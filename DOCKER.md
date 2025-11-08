# Docker Setup Guide

This project uses Docker Compose for easy development and deployment.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (Next.js)                         │
│  Port: 3001                                 │
│  Hot Reload: ✓                              │
└─────────────────┬───────────────────────────┘
                  │ HTTP
                  ▼
┌─────────────────────────────────────────────┐
│  Backend (Express API)                      │
│  Port: 3000                                 │
│  Hot Reload: ✓                              │
└─────────────────┬───────────────────────────┘
                  │ SQL
                  ▼
┌─────────────────────────────────────────────┐
│  PostgreSQL                                 │
│  Port: 5432                                 │
│  Volume: postgres_data (persisted)          │
└─────────────────────────────────────────────┘
```

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add your API keys to .env
# GEMINI_API_KEY=your_key_here
# VEO_API_KEY=your_key_here

# 3. Start everything
make dev

# 4. View logs
make logs
```

## Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start all services |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make backend` | View backend logs only |
| `make frontend` | View frontend logs only |
| `make restart` | Restart all services |
| `make build` | Rebuild Docker images |
| `make clean` | Remove all containers and volumes |
| `make db` | Connect to PostgreSQL CLI |
| `make test` | Run unit tests |
| `make test-api` | Run API tests |

## Hot Reload

Both frontend and backend support hot reload:

- **Backend**: Uses `tsx watch` - changes to `/src` files trigger restart
- **Frontend**: Uses Next.js Turbopack - instant HMR for React components
- **No rebuild needed** - source code is mounted as volumes

## Volumes

### Persisted Volumes (survive restarts):
- `postgres_data`: Database data
- `storage_data`: Uploaded assets and generated videos

### Source Code Mounts (for hot reload):
- `./src` → `/app/src` (backend)
- `./apps/web/src` → `/app/apps/web/src` (frontend)

## Port Mapping

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| Frontend | 3001 | 3001 |
| Backend | 3000 | 3000 |
| Postgres | 5432 | 5432 |

## Environment Variables

Backend service reads from `.env`:
- `GEMINI_API_KEY` - Required
- `VEO_API_KEY` - Required
- `DATABASE_URL` - Auto-configured for Docker
- `DEFAULT_REGEN_LIMIT` - Optional (default: 5)

## Development Workflow

```bash
# Start services
make dev

# Make code changes (hot reload will pick them up)
vim src/routes/brand.ts

# View logs
make backend

# Run tests
make test

# Stop when done
make down
```

## Troubleshooting

### Port already in use
```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process or stop other containers
docker ps
docker stop <container_id>
```

### Database connection issues
```bash
# Check if Postgres is healthy
docker-compose ps

# Connect to DB to verify
make db

# Reset database (WARNING: deletes data)
make clean
make dev
```

### Hot reload not working
```bash
# Restart the specific service
docker-compose restart backend
# or
docker-compose restart frontend
```

### Clean slate
```bash
# Remove everything and start fresh
make clean
make build
make dev
```

## Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Production mode:
- No source code volumes
- Optimized builds
- No hot reload
- Runs compiled code

## Accessing Services

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Database**: `psql -h localhost -U adprompt -d adprompt` (password: adprompt)

## Best Practices

1. **Always use volumes for data**: Database and uploads use named volumes
2. **Exclude node_modules from mounts**: Containers use their own node_modules
3. **Multi-stage builds**: Separate dependency installation from runtime
4. **Health checks**: Postgres has health check, backend waits for it
5. **Networks**: All services on same bridge network for inter-service communication
6. **.dockerignore**: Prevents copying unnecessary files into images

