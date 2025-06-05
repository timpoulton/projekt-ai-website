#!/bin/bash

# ========================================
# Image Generator Service Deployment (Category E)
# Port: 5050 (External API)
# ========================================

echo "🚀 Deploying Image Generator Service..."

# 1. Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# 2. Verify dependencies
echo "📦 Verifying dependencies..."
pip list | grep -E "flask|flask-cors|Pillow|requests|stability-sdk|python-dotenv|gunicorn"

# 3. Create necessary directories
echo "📁 Creating directories..."
mkdir -p ../assets/img/uploads
mkdir -p ../assets/img/portfolio
mkdir -p logs

# 4. Check for environment variables
if [ ! -f .env ]; then
    echo "⚠️ No .env file found. Creating from example..."
    cp env.example .env
    echo "⚠️ Please update .env with your Stability AI API key"
fi

# 5. Stop any existing service
echo "🛑 Stopping any existing service..."
pkill -f "gunicorn.*app:app" || true

# 6. Start the service in the background
echo "🚀 Starting Image Generator service..."
nohup gunicorn --bind 0.0.0.0:5050 \
         --workers 4 \
         --timeout 120 \
         --access-logfile logs/access.log \
         --error-logfile logs/error.log \
         --capture-output \
         --log-level info \
         app:app > logs/gunicorn.log 2>&1 &

# 7. Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# 8. Check if service is running
if curl -s http://localhost:5050/status > /dev/null; then
    echo "✅ Service is running!"
else
    echo "❌ Service failed to start. Check logs/error.log for details."
    exit 1
fi

# 9. Generate portfolio images
echo "🎨 Generating portfolio images..."
python3 generate-portfolio-images.py

echo "✅ Image Generator Service deployed!"
echo "📝 Service running on http://localhost:5050"
echo "📝 API Documentation:"
echo "   - POST /generate - Generate new image"
echo "   - GET /images - List generated images"
echo "   - GET /status - Check service status" 