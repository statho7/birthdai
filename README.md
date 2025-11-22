# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b48c6bce-c2f1-4cbc-9ddf-852b5b869bb4

This project consists of two main components:

1. **Frontend**: A React/Vite application for the web interface
2. **Voice AI Agent**: A Python-based LiveKit agent for creating songs

## Running with Docker

### Prerequisites

- Docker and Docker Compose installed on your system
- LiveKit credentials (for the voice AI agent)

### Setup

1. **Clone the repository**

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Quick Setup (Recommended)**

Use the Makefile for easy setup and management:

```sh
make setup
```

This will:

- Check for Docker installation
- Create environment files from templates
- Build and start both containers
- Display service URLs and helpful commands

3. **Configure LiveKit credentials** (Important!)

Edit `voice-ai-agent/.env.local` with your LiveKit credentials:

```sh
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

Then restart the agent:

```sh
make restart
```

### Available Make Commands

```sh
make help            # Show all available commands

# Setup & Start
make setup           # Initial setup and start containers
make build           # Build Docker images
make up              # Start all services
make down            # Stop all services
make restart         # Restart all services

# Logs
make logs            # View logs from all services
make logs-frontend   # View frontend logs only
make logs-agent      # View voice AI agent logs only

# Maintenance
make clean           # Stop services and remove containers/volumes
make rebuild         # Clean build and restart everything

# Development (without Docker)
make dev-frontend    # Run frontend in dev mode
make dev-agent       # Run voice AI agent locally
```

### Manual Setup (Alternative)

If you prefer not to use Make:

```sh
# 1. Create environment files
cp .env.example .env
cp voice-ai-agent/.env.example voice-ai-agent/.env.local

# 2. Edit voice-ai-agent/.env.local with your LiveKit credentials

# 3. Build and start services
docker-compose up -d --build

# 4. View logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

## Local Development (without Docker)

### Frontend Development

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b48c6bce-c2f1-4cbc-9ddf-852b5b869bb4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Voice AI Agent Development

See the [voice-ai-agent/README.md](voice-ai-agent/README.md) for detailed instructions on running and developing the voice AI agent locally.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

**Frontend:**

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Voice AI Agent:**

- Python 3.13
- LiveKit Agents
- UV (Python package manager)

## Architecture

The application uses a microservices architecture with two main services:

1. **Frontend Service**: Serves the React application through Nginx
2. **Voice AI Agent Service**: Runs the Python-based LiveKit agent for song creation

Both services communicate through Docker networking and can be scaled independently.

## How can I deploy this project?

### Deploy Frontend with Lovable

Simply open [Lovable](https://lovable.dev/projects/b48c6bce-c2f1-4cbc-9ddf-852b5b869bb4) and click on Share → Publish.

### Deploy with Docker

You can deploy both services to any Docker-compatible hosting platform:

1. Push your images to a container registry (Docker Hub, GitHub Container Registry, etc.)
2. Deploy using docker-compose on your server
3. Or use container orchestration platforms like Kubernetes, AWS ECS, Google Cloud Run, etc.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Troubleshooting

### Docker Issues

If containers fail to start:

```sh
# Check container status
docker-compose ps

# View detailed logs
make logs

# Restart services
make restart

# Or rebuild everything
make rebuild
```

### Port Conflicts

If port 8080 is already in use, modify the `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:80" # Change 8080 to any available port
```

### Environment Variables Not Loading

Ensure your `.env` files exist and are properly formatted:

- Root `.env` for frontend variables (prefixed with `VITE_`)
- `voice-ai-agent/.env.local` for LiveKit credentials
