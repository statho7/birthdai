import asyncio
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from pydantic import BaseModel

logger = logging.getLogger("api_server")
logging.basicConfig(level=logging.INFO)

load_dotenv(".env.local")

app = FastAPI(title="BirthdAI Music Generation API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ElevenLabs client
elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
if not elevenlabs_api_key:
    logger.warning("ELEVENLABS_API_KEY not found. Music generation will not be available.")
    elevenlabs_client = None
else:
    elevenlabs_client = ElevenLabs(api_key=elevenlabs_api_key)

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    logger.warning("OPENAI_API_KEY not found. Lyrics generation will not be available.")
    openai_client = None
else:
    openai_client = OpenAI(api_key=openai_api_key)

# Create directory for saved music if it doesn't exist
music_dir = Path("generated_music")
music_dir.mkdir(exist_ok=True)

# Mount the music directory to serve files
app.mount("/music", StaticFiles(directory=str(music_dir)), name="music")


class MusicGenerationRequest(BaseModel):
    prompt: str
    duration_seconds: int = 30


class MusicGenerationResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    file_url: Optional[str] = None
    lyrics: Optional[str] = None


def generate_lyrics_with_openai(prompt: str) -> str:
    """
    Generate song lyrics using OpenAI based on the given prompt.

    Args:
        prompt: The detailed prompt describing the song requirements

    Returns:
        Generated lyrics as a string
    """
    if not openai_client:
        raise HTTPException(
            status_code=503,
            detail="Lyrics generation is not available. OPENAI_API_KEY is not configured."
        )

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional songwriter. Generate only the song lyrics based on the user's requirements. Do not include any explanations, just the lyrics with verses, chorus, and bridge clearly labeled."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.9,
        )

        lyrics = response.choices[0].message.content
        logger.info(f"Generated lyrics:\n{lyrics}")
        return lyrics

    except Exception as e:
        logger.error(f"Lyrics generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lyrics generation failed: {str(e)}"
        )


@app.get("/")
async def root():
    return {
        "service": "BirthdAI Music Generation API",
        "status": "running",
        "elevenlabs_configured": elevenlabs_client is not None,
        "openai_configured": openai_client is not None
    }


@app.post("/api/generate-music", response_model=MusicGenerationResponse)
async def generate_music(request: MusicGenerationRequest):
    """
    Generate music based on a text prompt using OpenAI (for lyrics) and ElevenLabs API (for music).

    Args:
        request: Contains the prompt and optional duration

    Returns:
        Response with success status, message, filename, file URL, and lyrics
    """
    if not elevenlabs_client:
        raise HTTPException(
            status_code=503,
            detail="Music generation is not available. ELEVENLABS_API_KEY is not configured."
        )

    # Limit duration to reasonable range
    duration_seconds = max(10, min(request.duration_seconds, 120))
    duration_ms = duration_seconds * 1000

    logger.info(f"Generating lyrics from prompt: {request.prompt}")

    try:
        # Step 1: Generate lyrics using OpenAI
        lyrics = generate_lyrics_with_openai(request.prompt)

        logger.info(f"Generating music from lyrics ({duration_seconds}s)")

        # Step 2: Generate music using ElevenLabs API with the generated lyrics
        stream = elevenlabs_client.music.stream(
            prompt=lyrics,
            music_length_ms=duration_ms,
        )
        
        # Collect audio data
        audio_chunks = []
        for chunk in stream:
            if chunk:
                audio_chunks.append(chunk)
        
        if not audio_chunks:
            raise HTTPException(
                status_code=500,
                detail="No audio data was generated. Please try a different prompt."
            )
        
        # Combine all chunks
        audio_data = b"".join(audio_chunks)
        
        # Save to file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"music_{timestamp}.mp3"
        filepath = music_dir / filename
        
        with open(filepath, "wb") as f:
            f.write(audio_data)
        
        logger.info(f"Music saved to {filepath}")

        # Return the file URL (relative to the API server)
        file_url = f"/music/{filename}"

        return MusicGenerationResponse(
            success=True,
            message=f"Music generated successfully! Duration: {duration_seconds} seconds.",
            filename=filename,
            file_url=file_url,
            lyrics=lyrics
        )
        
    except Exception as e:
        logger.error(f"Music generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Music generation failed: {str(e)}"
        )


@app.get("/api/list-music")
async def list_music():
    """List all generated music files."""
    music_files = sorted(music_dir.glob("*.mp3"), key=lambda x: x.stat().st_mtime, reverse=True)
    
    return {
        "files": [
            {
                "filename": f.name,
                "url": f"/music/{f.name}",
                "created": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                "size_bytes": f.stat().st_size
            }
            for f in music_files
        ]
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the API server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
