# Music Generation Setup

This document explains how the music generation feature works in BirthdAI.

## Architecture

The application consists of three main components:

1. **Frontend (React/Vite)** - Port 8080

   - User interface for creating birthday gifts
   - Generates song prompts based on user input
   - Sends prompts to the backend API
   - Displays music player with generated songs

2. **Backend API Server (FastAPI)** - Port 8000

   - Receives music generation requests from frontend
   - Uses ElevenLabs API to generate music
   - Saves MP3 files to `generated_music/` directory
   - Serves music files via HTTP

3. **Voice AI Agent (LiveKit)** - Background
   - Handles voice interactions (separate from music generation)
   - Runs alongside the API server

## Setup

### 1. Environment Variables

The voice AI agent needs ElevenLabs API credentials. Make sure you have:

**voice-ai-agent/.env.local:**

```bash
ELEVENLABS_API_KEY=your_api_key_here
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
```

**Frontend .env:**

```bash
VITE_API_URL=http://localhost:8000
```

### 2. Start the Application

```bash
# Start all services with Docker
make up

# Or build and start
make setup
```

This will start:

- Frontend at http://localhost:8080
- Backend API at http://localhost:8000

### 3. Generate Music

1. Open http://localhost:8080 in your browser
2. Fill in the form:
   - Friend's name
   - Personality description
   - Gift theme
3. Click "Generate Gift"
4. Wait for the music to be generated (20-40 seconds)
5. Listen to the music using the audio player that appears
6. Download the MP3 file if desired

## How It Works

1. **User Input**: User fills out the form with friend details
2. **Prompt Generation**: Frontend creates a detailed song prompt
3. **API Request**: Frontend sends POST request to `/api/generate-music`
4. **Music Generation**: Backend calls ElevenLabs API with the prompt
5. **File Storage**: MP3 is saved to `generated_music/` directory
6. **Response**: Backend returns the file URL to frontend
7. **Playback**: Frontend displays audio player with the generated music

## API Endpoints

### POST /api/generate-music

Generate music from a text prompt.

**Request:**

```json
{
  "prompt": "upbeat pop birthday song with electronic elements",
  "duration_seconds": 30
}
```

**Response:**

```json
{
  "success": true,
  "message": "Music generated successfully! Duration: 30 seconds.",
  "filename": "music_20241122_143022.mp3",
  "file_url": "/music/music_20241122_143022.mp3"
}
```

### GET /api/list-music

List all generated music files.

**Response:**

```json
{
  "files": [
    {
      "filename": "music_20241122_143022.mp3",
      "url": "/music/music_20241122_143022.mp3",
      "created": "2024-11-22T14:30:22",
      "size_bytes": 482304
    }
  ]
}
```

## Development

### Run Frontend Only

```bash
npm run dev
```

### Run Backend API Only

```bash
cd voice-ai-agent
uv run python src/api_server.py
```

### Run Voice AI Agent Only

```bash
cd voice-ai-agent
uv run src/agent.py start
```

## Troubleshooting

### Music Not Generating

1. Check ElevenLabs API key is set in `voice-ai-agent/.env.local`
2. Check backend logs: `make logs-agent`
3. Verify API is accessible: `curl http://localhost:8000/`

### CORS Errors

The API server has CORS enabled for all origins. If you still see CORS errors:

- Check that VITE_API_URL is set correctly in frontend `.env`
- Verify the backend is running on port 8000

### Cannot Access Music Files

Music files are stored in a Docker volume shared between containers. The backend serves them via the `/music` endpoint.

## File Structure

```
birthdai/
├── src/pages/Index.tsx          # Frontend UI with music player
├── voice-ai-agent/
│   ├── src/
│   │   ├── agent.py             # LiveKit voice agent
│   │   └── api_server.py        # FastAPI music generation server
│   ├── start.sh                 # Startup script for both services
│   └── generated_music/         # Generated MP3 files (Docker volume)
├── docker-compose.yml           # Container orchestration
└── Makefile                     # Build and run commands
```
