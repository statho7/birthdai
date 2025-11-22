#!/bin/bash

# Start the FastAPI server in the background
echo "Starting API server on port 8000..."
uv run python src/api_server.py &
API_PID=$!

# Wait a moment for the API server to start
sleep 2

# Start the LiveKit agent
echo "Starting LiveKit agent..."
uv run src/agent.py start &
AGENT_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down services..."
    kill $API_PID $AGENT_PID 2>/dev/null
    exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

# Wait for both processes
wait $API_PID $AGENT_PID
