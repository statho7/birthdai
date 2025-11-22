.PHONY: help setup build up down restart logs logs-frontend logs-agent clean check-docker check-env

# Detect docker compose command (docker-compose vs docker compose)
DOCKER_COMPOSE := $(shell command -v docker-compose 2>/dev/null)
ifndef DOCKER_COMPOSE
	DOCKER_COMPOSE := docker compose
endif

# Default target
help:
	@echo "🎉 BirthdAI - Available Commands"
	@echo ""
	@echo "Setup & Start:"
	@echo "  make setup          - Initial setup (create env files and start containers)"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo ""
	@echo "Logs:"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-frontend  - View frontend logs only"
	@echo "  make logs-agent     - View voice AI agent logs only"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Stop services and remove containers, networks, and volumes"
	@echo "  make rebuild        - Clean build and restart everything"
	@echo ""
	@echo "Development:"
	@echo "  make dev-frontend   - Run frontend in development mode (without Docker)"
	@echo "  make dev-agent      - Run voice AI agent locally (without Docker)"
	@echo ""

# Check if Docker is installed and running
check-docker:
	@command -v docker >/dev/null 2>&1 || { echo "❌ Docker is not installed. Please install Docker first."; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose is not installed."; exit 1; }
	@echo "✅ Docker is installed"
	@if ! docker info >/dev/null 2>&1; then \
		echo "⚠️  Docker daemon is not running. Starting Docker..."; \
		if [ "$$(uname)" = "Darwin" ]; then \
			open -a Docker && echo "⏳ Waiting for Docker to start..." && \
			while ! docker info >/dev/null 2>&1; do sleep 1; done && \
			echo "✅ Docker is now running"; \
		elif command -v systemctl >/dev/null 2>&1; then \
			sudo systemctl start docker && echo "✅ Docker daemon started"; \
		else \
			echo "❌ Unable to start Docker daemon automatically. Please start Docker manually."; \
			exit 1; \
		fi; \
	else \
		echo "✅ Docker daemon is running"; \
	fi
	@echo "✅ Using: $(DOCKER_COMPOSE)"

# Check if environment files exist
check-env:
	@if [ ! -f .env ]; then \
		echo "⚠️  Frontend .env file not found. Creating from template..."; \
		cp .env.example .env; \
		echo "✅ Created .env file"; \
	else \
		echo "✅ Frontend .env file exists"; \
	fi
	@if [ ! -f voice-ai-agent/.env.local ]; then \
		echo "⚠️  Voice AI agent .env.local file not found. Creating from template..."; \
		cp voice-ai-agent/.env.example voice-ai-agent/.env.local; \
		echo "⚠️  IMPORTANT: Please edit voice-ai-agent/.env.local with your LiveKit credentials!"; \
		echo "   Required: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET"; \
	else \
		echo "✅ Voice AI agent .env.local file exists"; \
	fi

# Initial setup
setup: check-docker check-env
	@echo ""
	@echo "🚀 Building and starting Docker containers..."
	@$(DOCKER_COMPOSE) up -d --build
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "📍 Your services are running at:"
	@echo "   - Frontend: http://localhost:8080"
	@echo "   - Voice AI Agent: Running in background"
	@echo ""
	@echo "📋 Next steps:"
	@echo "   - View logs: make logs"
	@echo "   - Stop services: make down"
	@echo "   - Restart services: make restart"
	@echo ""

# Build Docker images
build: check-docker
	@echo "🔨 Building Docker images..."
	@$(DOCKER_COMPOSE) build

# Start services
up: check-docker check-env
	@echo "🚀 Starting services..."
	@$(DOCKER_COMPOSE) up -d
	@echo "✅ Services started!"
	@echo "   - Frontend: http://localhost:8080"

# Stop services
down:
	@echo "🛑 Stopping services..."
	@$(DOCKER_COMPOSE) down
	@echo "✅ Services stopped"

# Restart services
restart:
	@echo "🔄 Restarting services..."
	@$(DOCKER_COMPOSE) restart
	@echo "✅ Services restarted"

# View all logs
logs:
	@$(DOCKER_COMPOSE) logs -f

# View frontend logs
logs-frontend:
	@$(DOCKER_COMPOSE) logs -f frontend

# View voice AI agent logs
logs-agent:
	@$(DOCKER_COMPOSE) logs -f voice-ai-agent

# Clean everything
clean:
	@echo "🧹 Cleaning up Docker resources..."
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@echo "✅ Cleanup complete"

# Rebuild everything from scratch
rebuild: clean build up
	@echo "✅ Rebuild complete!"

# Development mode - frontend only (without Docker)
dev-frontend:
	@echo "🔧 Starting frontend in development mode..."
	@npm run dev

# Development mode - voice AI agent only (without Docker)
dev-agent:
	@echo "🔧 Starting voice AI agent in development mode..."
	@cd voice-ai-agent && uv run src/agent.py start
