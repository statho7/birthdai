# syntax=docker/dockerfile:1
ARG PYTHON_VERSION=3.13
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS base

ENV PYTHONUNBUFFERED=1

ARG UID=10001
RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/app" \
  --shell "/sbin/nologin" \
  --uid "${UID}" \
  appuser

# -------------------------------------------------------------
# 🔧 FIX: Repair Debian GPG keys
# -------------------------------------------------------------
RUN apt-get clean && \
  rm -rf /var/lib/apt/lists/* && \
  mkdir -p /var/lib/apt/lists/partial && \
  apt-get clean && \
  apt-get update --allow-insecure-repositories && \
  apt-get install -y --allow-unauthenticated ca-certificates gnupg && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Reinstall Debian keyring with proper keys
RUN apt-get update --allow-insecure-repositories && \
  apt-get install -y --allow-unauthenticated debian-archive-keyring && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# -------------------------------------------------------------
# Now install build dependencies normally
# -------------------------------------------------------------
RUN apt-get update && \
  apt-get install -y gcc g++ python3-dev && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./
RUN mkdir -p src
RUN uv sync

COPY . .
RUN mkdir -p /app/generated_music
RUN chown -R appuser:appuser /app
RUN chmod +x start.sh

USER appuser

RUN uv run src/agent.py download-files

CMD ["./start.sh"]
