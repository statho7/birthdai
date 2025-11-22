import asyncio
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional
import requests
import time

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import fal_client
from pydub import AudioSegment
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi import UploadFile, File as FastAPIFile

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

# Create directory for saved videos
video_dir = Path("generated_videos")
video_dir.mkdir(exist_ok=True)

# Mount the music directory to serve files
app.mount("/music", StaticFiles(directory=str(music_dir)), name="music")
app.mount("/videos", StaticFiles(directory=str(video_dir)), name="videos")

# Get FAL API key
fal_api_key = os.getenv("FAL_KEY")
if not fal_api_key:
    logger.warning("FAL_KEY not found. Video generation will not be available.")


class MusicGenerationRequest(BaseModel):
    prompt: str
    duration_seconds: int = 30


class MusicGenerationResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    file_url: Optional[str] = None


class VideoGenerationRequest(BaseModel):
    audio_url: str
    image_url: str
    resolution: str = "720p"


class VideoGenerationResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    file_url: Optional[str] = None
    video_url: Optional[str] = None


@app.get("/")
async def root():
    return {
        "service": "BirthdAI Music Generation API",
        "status": "running",
        "elevenlabs_configured": elevenlabs_client is not None,
        "fal_configured": fal_api_key is not None
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


@app.post("/api/upload-image")
async def upload_image(image: UploadFile = FastAPIFile(...)):
    """
    Upload an image file to fal.ai storage and return the URL.
    
    Args:
        image: The image file to upload
        
    Returns:
        JSON with the uploaded image URL
    """
    if not fal_api_key:
        raise HTTPException(
            status_code=503,
            detail="Image upload is not available. FAL_KEY is not configured."
        )
    
    try:
        # Read the file content
        content = await image.read()
        
        # Save temporarily
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_filename = f"temp_{timestamp}_{image.filename}"
        temp_filepath = temp_dir / temp_filename
        
        with open(temp_filepath, "wb") as f:
            f.write(content)
        
        logger.info(f"Uploading image to fal.ai: {temp_filepath}")
        
        # Upload to fal.ai
        image_url = fal_client.upload_file(str(temp_filepath))
        
        logger.info(f"Image uploaded to fal.ai: {image_url}")
        
        # Clean up temp file
        temp_filepath.unlink()
        
        return {
            "success": True,
            "image_url": image_url,
            "message": "Image uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        # Clean up temp file if it exists
        if 'temp_filepath' in locals() and temp_filepath.exists():
            temp_filepath.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Image upload failed: {str(e)}"
        )


@app.post("/api/generate-video", response_model=VideoGenerationResponse)
async def generate_video(request: VideoGenerationRequest):
    """
    Generate a video based on an audio file and image using fal.ai Fabric 1.0.
    
    Args:
        request: Contains audio_url, image_url, and resolution
        
    Returns:
        Response with success status, message, filename, and video URL
    """
    if not fal_api_key:
        raise HTTPException(
            status_code=503,
            detail="Video generation is not available. FAL_KEY is not configured."
        )
    
    logger.info(f"Generating video with audio: {request.audio_url}, image: {request.image_url}, resolution: {request.resolution}")
    
    try:
        # Upload audio file to fal.ai if it's a local URL
        audio_url = request.audio_url
        if "localhost" in audio_url or audio_url.startswith("/"):
            # Extract the local file path
            if audio_url.startswith("http://localhost"):
                # Extract just the path part
                audio_path = audio_url.split("localhost:8000")[-1]
            else:
                audio_path = audio_url
            
            # Remove leading slash if present
            if audio_path.startswith("/music/"):
                filename = audio_path.replace("/music/", "")
                local_audio_path = music_dir / filename
                
                if not local_audio_path.exists():
                    raise HTTPException(
                        status_code=404,
                        detail=f"Audio file not found: {filename}"
                    )
                
                # Trim audio to 5 seconds for video generation to save credits
                logger.info(f"Trimming audio to 5 seconds for video generation")
                audio = AudioSegment.from_mp3(str(local_audio_path))
                trimmed_audio = audio[:5000]  # First 5 seconds (5000 milliseconds)
                
                # Save trimmed audio to temp file
                temp_audio_dir = Path("temp_uploads")
                temp_audio_dir.mkdir(exist_ok=True)
                trimmed_filename = f"trimmed_{filename}"
                trimmed_audio_path = temp_audio_dir / trimmed_filename
                trimmed_audio.export(str(trimmed_audio_path), format="mp3")
                
                logger.info(f"Uploading trimmed audio file to fal.ai: {trimmed_audio_path}")
                audio_url = fal_client.upload_file(str(trimmed_audio_path))
                logger.info(f"Audio uploaded to fal.ai: {audio_url}")
                
                # Clean up temp trimmed file
                trimmed_audio_path.unlink()
        
        # Submit the video generation request
        logger.info("Submitting video generation request to fal.ai...")
        handler = fal_client.submit(
            "veed/fabric-1.0/fast",
            arguments={
                "image_url": request.image_url,
                "audio_url": audio_url,
                "resolution": request.resolution
            },
        )
        
        request_id = handler.request_id
        logger.info(f"Video generation request submitted with ID: {request_id}")
        
        # Poll for status with 5-second intervals
        max_wait_time = 300  # 5 minutes maximum
        start_time = time.time()
        poll_interval = 5  # 5 seconds between polls
        
        while True:
            elapsed_time = time.time() - start_time
            
            if elapsed_time > max_wait_time:
                raise HTTPException(
                    status_code=504,
                    detail="Video generation timed out after 5 minutes"
                )
            
            # Check status
            status_response = fal_client.status("veed/fabric-1.0/fast", request_id, with_logs=True)
            
            # Handle different status types
            if isinstance(status_response, fal_client.InProgress):
                logger.info("Video generation in progress...")
                
                # Log any progress messages
                if hasattr(status_response, 'logs') and status_response.logs:
                    for log in status_response.logs:
                        if isinstance(log, dict) and 'message' in log:
                            logger.info(f"Progress: {log['message']}")
                
                # Wait 5 seconds before next poll
                logger.info(f"Waiting {poll_interval} seconds before next status check...")
                time.sleep(poll_interval)
                continue
                
            elif isinstance(status_response, fal_client.Completed):
                logger.info("Video generation completed!")
                break
                
            else:
                # Handle other status types or errors
                logger.error(f"Unexpected status response: {type(status_response)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Video generation failed with unexpected status"
                )
        
        # Get the final result
        result = fal_client.result("veed/fabric-1.0/fast", request_id)
        
        if not result or "video" not in result:
            raise HTTPException(
                status_code=500,
                detail="No video data was generated. Please try again."
            )
        
        video_data = result["video"]
        video_url = video_data.get("url")
        
        if not video_url:
            raise HTTPException(
                status_code=500,
                detail="Video URL not found in response."
            )
        
        logger.info(f"Video generated successfully: {video_url}")
        
        # Download the video and save it locally
        response = requests.get(video_url, stream=True)
        response.raise_for_status()
        
        # Save to file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"video_{timestamp}.mp4"
        filepath = video_dir / filename
        
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"Video saved to {filepath}")
        
        # Return the local file URL
        file_url = f"/videos/{filename}"
        
        return VideoGenerationResponse(
            success=True,
            message="Video generated successfully!",
            filename=filename,
            file_url=file_url,
            video_url=video_url
        )
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Video download failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Video download failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Video generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Video generation failed: {str(e)}"
        )


@app.get("/api/list-videos")
async def list_videos():
    """List all generated video files."""
    video_files = sorted(video_dir.glob("*.mp4"), key=lambda x: x.stat().st_mtime, reverse=True)
    
    return {
        "files": [
            {
                "filename": f.name,
                "url": f"/videos/{f.name}",
                "created": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                "size_bytes": f.stat().st_size
            }
            for f in video_files
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
