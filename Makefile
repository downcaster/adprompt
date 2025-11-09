.PHONY: help dev up down logs clean build restart backend frontend db

# Help command
help:
	@echo "ADPrompt Docker Commands:"
	@echo "  make dev        - Start all services in development mode"
	@echo "  make up         - Start all services (alias for dev)"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - View logs from all services"
	@echo "  make clean      - Stop and remove all containers, volumes"
	@echo "  make build      - Rebuild all Docker images"
	@echo "  make restart    - Restart all services"
	@echo "  make backend    - View backend logs"
	@echo "  make frontend   - View frontend logs"
	@echo "  make db         - Connect to PostgreSQL CLI"
	@echo "  make test       - Run unit tests"
	@echo "  make test-api   - Run API tests (uses real API keys)"

# Start all services in development mode
dev up:
	docker-compose up -d
	@echo ""
	@echo "✅ Services started!"
	@echo "   Backend:  http://localhost:3000"
	@echo "   Frontend: http://localhost:3001"
	@echo "   Postgres: localhost:5432"
	@echo ""
	@echo "View logs: make logs"

# Stop all services
down:
	docker-compose down

# View logs from all services
logs:
	docker-compose logs -f

# Backend logs only
backend:
	docker-compose logs -f backend

# Frontend logs only
frontend:
	docker-compose logs -f frontend

# Clean up everything (including volumes)
clean:
	docker-compose down -v
	@echo "✅ Cleaned up all containers and volumes"

# Rebuild all images
build:
	docker-compose build --no-cache
	@echo "✅ Rebuilt all Docker images"

# Restart all services
restart:
	docker-compose restart

# Connect to PostgreSQL
db:
	docker-compose exec postgres psql -U adprompt -d adprompt

# Run unit tests
test:
	docker-compose exec backend npm test

# Run API integration tests
test-api:
	docker-compose exec backend npm run test:api

