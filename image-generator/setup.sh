#!/bin/bash

# ========================================
# Image Generator Setup Script
# ========================================

echo "🚀 Setting up Image Generator..."

# 1. Create virtual environment
echo "🔧 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
echo "📦 Installing dependencies..."
pip install flask==2.3.3
pip install flask-cors==4.0.0
pip install Pillow==10.1.0
pip install requests==2.31.0
pip install stability-sdk==0.8.4
pip install python-dotenv==1.0.0
pip install gunicorn==21.2.0

# 3. Create .env file
echo "🔑 Creating .env file..."
cat > .env << EOL
# Stability AI API Configuration
STABILITY_API_KEY=sk-BMmaD6i1JLMKD5Z4FwluEmfGyaTnDTqGEgsqCYSglaRZwDn8

# Server Configuration
PORT=5050
OUTPUT_DIR=../assets/img/uploads
FILE_FORMAT=jpg
IMAGE_WIDTH=1024
IMAGE_HEIGHT=768

# Development Settings
DEBUG=True
EOL

# 4. Create necessary directories
echo "📁 Creating directories..."
mkdir -p ../assets/img/uploads
mkdir -p ../assets/img/portfolio

# 5. Set permissions
echo "🔒 Setting permissions..."
chmod +x deploy.sh
chmod +x generate-portfolio-images.py

echo "✅ Setup complete!"
echo "📝 Next steps:"
echo "   1. Run ./deploy.sh to start the service"
echo "   2. Run python3 generate-portfolio-images.py to generate images"
echo "   3. Run node ../scripts/update-portfolio-images.js to update config" 