# Video Generation Feature

## Overview

The BirthdAI app now includes video generation capabilities using fal.ai's Fabric 1.0 model. Users can generate personalized birthday videos based on their generated music.

## Setup

### 1. Get Your FAL API Key

1. Sign up at [fal.ai](https://fal.ai)
2. Navigate to your API keys section
3. Create a new API key

### 2. Configure Environment Variables

Add your FAL API key to `/voice-ai-agent/.env.local`:

```bash
FAL_KEY="your_fal_api_key_here"
```

### 3. Install Dependencies

#### Backend (Python)

```bash
cd voice-ai-agent
uv add fal-client requests
# or
pip install fal-client requests
```

#### Frontend (Node.js)

```bash
cd ../
npm install @fal-ai/client
```

## How It Works

### Backend API

The backend (`api_server.py`) includes a new endpoint:

**POST** `/api/generate-video`

Request Body:

```json
{
  "audio_url": "http://localhost:8000/music/music_20231122_123456.mp3",
  "image_url": "https://example.com/image.png",
  "resolution": "720p"
}
```

Response:

```json
{
  "success": true,
  "message": "Video generated successfully!",
  "filename": "video_20231122_123456.mp4",
  "file_url": "/videos/video_20231122_123456.mp4",
  "video_url": "https://v3.fal.media/files/..."
}
```

### Frontend Flow

1. User generates music by filling out the form and clicking "Generate Gift"
2. Once music is generated and the "Add Video Gift" checkbox is checked, a "Generate Video" button appears
3. Clicking the button sends the audio URL to the backend API
4. The backend calls fal.ai's Fabric 1.0 API with the audio and a default image
5. The generated video is downloaded and served locally
6. A video player appears with download capabilities

## Usage

### Basic Usage

1. Fill out the birthday song form (name, relationship, description, vibe, genre)
2. Check the "Add Video Gift" checkbox
3. Click "Generate Gift" to create the music
4. Wait for the music to generate
5. Click "Generate Video" to create a video
6. Download or share both the music and video!

### Customization

#### Custom Images

To use custom images, modify the `handleGenerateVideo` function in `src/pages/Index.tsx`:

```typescript
// Replace this line:
const imageUrl = "https://v3.fal.media/files/koala/NLVPfOI4XL1cWT2PmmqT3_Hope.png";

// With your own image URL or upload functionality
const imageUrl = "https://your-domain.com/custom-image.jpg";
```

#### Video Resolution

Change the resolution in the API call (options: `"720p"` or `"480p"`):

```typescript
body: JSON.stringify({
  audio_url: audioUrl,
  image_url: imageUrl,
  resolution: "480p" // or "720p"
}),
```

## API Endpoints

### Generate Video

- **Endpoint**: `POST /api/generate-video`
- **Description**: Generates a video from audio and image using fal.ai
- **Auth**: Requires FAL_KEY environment variable

### List Videos

- **Endpoint**: `GET /api/list-videos`
- **Description**: Lists all generated video files
- **Response**: Array of video metadata (filename, URL, created date, size)

## File Storage

Generated files are stored locally:

- **Music**: `/voice-ai-agent/generated_music/*.mp3`
- **Videos**: `/voice-ai-agent/generated_videos/*.mp4`

Files are served via FastAPI's StaticFiles middleware:

- Music URL: `http://localhost:8000/music/{filename}`
- Video URL: `http://localhost:8000/videos/{filename}`

## Troubleshooting

### Video Generation Fails

1. **Check FAL_KEY**: Ensure your API key is correctly set in `.env.local`
2. **Check Audio URL**: Verify the music was generated successfully first
3. **Check Logs**: View backend logs for detailed error messages:
   ```bash
   # Backend logs show detailed fal.ai progress
   cd voice-ai-agent
   python src/api_server.py
   ```

### API Key Not Found

If you see "FAL_KEY not found" error:

1. Create `/voice-ai-agent/.env.local` if it doesn't exist
2. Add `FAL_KEY="your_api_key_here"`
3. Restart the backend server

### Video Not Playing

- Ensure the video file was downloaded successfully (check `/generated_videos/`)
- Try a different browser (Chrome/Firefox recommended)
- Check browser console for errors

## Architecture

```
Frontend (React/TypeScript)
    ↓ (1) Generate music request
Backend API Server (FastAPI/Python)
    ↓ (2) Call ElevenLabs API
ElevenLabs Music Generation
    ↓ (3) Return audio file
Backend saves to /generated_music/
    ↓ (4) Music URL returned to frontend
User clicks "Generate Video"
    ↓ (5) Video generation request with audio URL
Backend API Server
    ↓ (6) Call fal.ai Fabric 1.0 API
Fal.ai Video Generation
    ↓ (7) Return video URL
Backend downloads and saves to /generated_videos/
    ↓ (8) Video URL returned to frontend
Frontend displays video player
```

## Future Enhancements

1. **Custom Image Upload**: Allow users to upload their own images
2. **Multiple Video Styles**: Support different video generation models
3. **Video Templates**: Pre-designed templates for different occasions
4. **Batch Generation**: Generate multiple videos with different styles
5. **Progress Tracking**: Real-time progress updates during video generation
6. **Cloud Storage**: Integration with S3/GCS for scalable file storage

## Resources

- [Fal.ai Documentation](https://fal.ai/docs)
- [Fabric 1.0 Model](https://fal.ai/models/veed/fabric-1.0)
- [ElevenLabs Music API](https://elevenlabs.io/docs/api-reference/music)
