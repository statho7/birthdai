# London AI Hack 2025 (Open Innovation Track)

Jump to [Setup Instructions](#setup-instructions) to get started.

Watch our Loom video [here]().

## Our Project - 🎉 BirthdAI

We’re building a 60-second birthday gift machine: you talk or type a few details about someone and our app instantly writes, sings, and wraps a custom song + video montage for them, powered by ElevenLabs, LiveKit, VEED, fal, and Lovable.

It turns last-minute “oh no, I forgot a present” panic into the most personal gift in the room!

## Our Team
- **[Dennis Knodt](https://www.linkedin.com/in/dennis-knodt/)** - Co-Founder @ Valuent
- **[Andreas Stathopoulos](https://www.linkedin.com/in/andreasstathop/)** - Senior AI Engineer @ RedCloud
- **[Maxim Huber](https://www.linkedin.com/in/maximhuber/)** - MSc Robotics Student @ ETH Zurich

## Tech Stack

The key partner technologies we used are:
- VEED
- Lovable
- ElevenLabs
- LiveKit
- fal

## Setup Instructions

**0. Prerequisites**
- Docker and Docker Compose installed on your system
- Git

**1. Clone the repository**
```bash
git clone https://github.com/statho7/birthdai.git && cd birthdai
```

**2. Add API Keys**

In `./voice-ai-agent/.env.local`, add your API keys. There is a file called `.env.example` as a template.

```bash
LIVEKIT_API_KEY=""
LIVEKIT_API_SECRET=""
LIVEKIT_URL=""
ELEVENLABS_API_KEY=""
FAL_KEY=""
```

**3. Set up the Docker containers**
```bash
make setup
```

**3. Start the services**

This will start both the `birthdai-frontend` and `birthdai-voice-ai-agent` containers:
```bash
make up
```

**4. Access the application**

Open your browser and navigate to:
```
http://localhost:8080
```

**5. Additional Services**
- **Stop the services:** `make down`
- **Rebuild containers:** `make setup && make up`