#!/bin/bash

# Function to checking command availability
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "Starting deployment setup..."

# 1. Start Infrastructure (Postgres, Redis, Backend)
echo "----------------------------------------"
echo "Starting Docker containers..."
if command_exists docker-compose; then
    docker-compose up -d --build
else
    echo "Error: docker-compose not found. Please install Docker Compose."
    exit 1
fi

# Wait for backend to be ready
echo "Waiting for Backend to be ready..."
RETRIES=30
until curl -s -f http://localhost:8001/health > /dev/null; do
    echo "Backend is starting... ($RETRIES retries left)"
    sleep 2
    RETRIES=$((RETRIES-1))
    if [ $RETRIES -le 0 ]; then
        echo "Error: Backend failed to start."
        docker-compose logs backend
        exit 1
    fi
done
echo "Backend is RUNNING!"

# 2. Run Database Migrations
echo "----------------------------------------"
echo "Running Database Migrations..."
docker-compose exec -T backend alembic revision --autogenerate -m "Auto migration from run script" || echo "Migration revision already exists or failed (ignoring)..."
docker-compose exec -T backend alembic upgrade head

# 3. Start Celery Worker (New in Phase 2)
echo "----------------------------------------"
echo "Starting Celery Worker..."
docker-compose exec -d backend celery -A app.worker worker --loglevel=info

# 4. Setup & Start Frontend
echo "----------------------------------------"
echo "Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "----------------------------------------"
echo "Setup complete! Starting Frontend Development Server..."
echo "Backend API: http://localhost:8001"
echo "Frontend Web: http://localhost:3000"
echo "----------------------------------------"

# Run frontend dev server
npm run dev
