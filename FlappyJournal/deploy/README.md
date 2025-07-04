# Docker Compose Deployment

This directory contains the Docker Compose configuration for the FlappyJournal application with deterministic boot sequence.

## Services

The deployment includes the following services in dependency order:

1. **postgres** (port 5432) - PostgreSQL database
2. **auth-service** (port 4001) - Authentication service
3. **consciousness-backend** (gRPC 50051 / HTTP 4003) - Core backend service
4. **chat-orchestrator** (port 4002) - Chat management service
5. **api-gateway** (port 4000) - API gateway and routing
6. **websocket-monitor** (port 4004) - WebSocket monitoring service
7. **caddy** (ports 80/443) - Reverse proxy routing to 4000 and 4002 WS

## Setup

1. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Build and start all services:
   ```bash
   docker-compose up -d
   ```

3. Check service status:
   ```bash
   docker-compose ps
   ```

4. View logs:
   ```bash
   docker-compose logs -f
   ```

## Features

- **Deterministic Boot Sequence**: Services start in the correct dependency order using `depends_on` with health checks
- **Health Checks**: All services have health checks to ensure proper startup
- **Restart Policy**: All services use `restart: unless-stopped` for reliability
- **Networking**: Services communicate through a dedicated bridge network
- **Data Persistence**: PostgreSQL data is persisted using Docker volumes
- **Reverse Proxy**: Caddy handles SSL termination and routing
- **Environment Variables**: Configurable through `.env` file

## Service URLs

- **Main Application**: http://localhost (or your configured domain)
- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **Chat Orchestrator**: http://localhost:4002
- **Consciousness Backend**: http://localhost:4003
- **WebSocket Monitor**: http://localhost:4004
- **PostgreSQL**: localhost:5432

## Troubleshooting

- Check service logs: `docker-compose logs <service-name>`
- Restart a specific service: `docker-compose restart <service-name>`
- Rebuild and restart: `docker-compose up -d --build`
- Stop all services: `docker-compose down`
- Remove volumes: `docker-compose down -v`
