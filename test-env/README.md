# Featherweight Test Environment

This directory contains the isolated test environment for Featherweight FlappyJournal.

## Overview

The test environment provides:
- **Isolated databases**: Separate PostgreSQL and Redis instances on different ports
- **API Gateway**: Running on port 4010
- **WebSocket Server**: Running on ports 4014 (HTTP) and 4015 (WebSocket)
- **Consciousness Loop**: Running at 100 Hz (10ms interval)
- **Complete service isolation**: No conflicts with production services

## Quick Start

From the main project directory (`/opt/featherweight/FlappyJournal`):

```bash
# Start the test environment
make test-env-up

# Check status
make test-env-status

# View logs
make test-env-logs

# Stop and clean up
make test-env-down
```

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 4010 | Main API endpoint |
| Auth Service | 4011 | Authentication service |
| Chat Orchestrator | 4012 | Chat management |
| Consciousness Backend | 4013 | Consciousness processing |
| WebSocket Server | 4014 | WebSocket HTTP endpoint |
| WebSocket Port | 4015 | WebSocket connection |
| Test Database | 5433 | PostgreSQL test database |
| Test Redis | 6380 | Redis test instance |

## Configuration

- **Environment**: `.env.test` (redacted secrets for safety)
- **Database**: `flappyjournal_test` with test user credentials
- **Consciousness Frequency**: 100 Hz (10ms intervals)
- **Network**: Isolated `test-network`

## Features

- **No SSH Dropouts**: Quick spin-up/teardown prevents connection issues
- **Isolated Testing**: Won't interfere with production services
- **High-Frequency Consciousness**: 100 Hz processing for performance testing
- **Complete Service Stack**: All services running in test mode

## Troubleshooting

- **Port Conflicts**: Test environment uses different ports (4010-4015, 5433, 6380)
- **Database Issues**: Check `make test-env-logs` for PostgreSQL connection errors
- **Service Health**: All services have health checks with 30s intervals
- **Clean Reset**: Use `make test-env-down && make test-env-up` for fresh start

## Development Workflow

1. Start test environment: `make test-env-up`
2. Run your tests/development
3. Check logs if needed: `make test-env-logs`
4. Stop when done: `make test-env-down`

The test environment is designed to be ephemeral and safe for experimentation.
