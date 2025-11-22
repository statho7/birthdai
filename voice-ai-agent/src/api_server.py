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
api_key = os.getenv("ELEVENLABS_API_KEY")
if not api_key:
    logger.warning("ELEVENLABS_API_KEY not found. Music generation will not be available.")
    elevenlabs_client = None
else:
    elevenlabs_client = ElevenLabs(api_key=api_key)

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


@app.get("/")
async def root():
    return {
        "service": "BirthdAI Music Generation API",
        "status": "running",
        "elevenlabs_configured": elevenlabs_client is not None
    }


@app.post("/api/generate-music", response_model=MusicGenerationResponse)
async def generate_music(request: MusicGenerationRequest):
    """
    Generate music based on a text prompt using ElevenLabs API.
    
    Args:
        request: Contains the prompt and optional duration
        
    Returns:
        Response with success status, message, filename, and file URL
    """
    if not elevenlabs_client:
        raise HTTPException(
            status_code=503,
            detail="Music generation is not available. ELEVENLABS_API_KEY is not configured."
        )
    
    # Limit duration to reasonable range
    duration_seconds = max(10, min(request.duration_seconds, 120))
    duration_ms = duration_seconds * 1000
    
    logger.info(f"Generating music: {request.prompt} ({duration_seconds}s)")
    
    try:
        # Generate music using ElevenLabs API
        stream = elevenlabs_client.music.stream(
            prompt=request.prompt,
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
            file_url=file_url
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
