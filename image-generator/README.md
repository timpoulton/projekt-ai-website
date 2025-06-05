# 🎨 Image Generator Service

## Overview
AI-powered image generation service for portfolio projects using Stability AI's API.

## 📋 Standardization Compliance

### Category E Requirements ✅
- **External Access:** ✅ HTTPS via api.projekt-ai.net
- **SSL Certificate:** ✅ Let's Encrypt auto-renewal
- **Port Range:** ✅ 5050 (Category E: 5000-5999)
- **Docker Deployment:** ✅ Containerized with docker-compose
- **Reverse Proxy:** ✅ Nginx configuration
- **Documentation:** ✅ Complete standardized docs

### Homelab Integration ✅
- **PORT-TRACKER.md:** ✅ Updated with port 5050
- **Backup System:** ✅ Included in daily backups
- **Monitoring:** ✅ Health checks and logging
- **Templates:** ✅ Uses standardized deployment templates

## 🚀 Quick Start

1. **Setup Environment:**
   ```bash
   ./setup.sh
   ```

2. **Deploy Service:**
   ```bash
   ./deploy.sh
   ```

3. **Generate Images:**
   ```bash
   python3 generate-portfolio-images.py
   ```

## 🔧 Configuration

### Environment Variables
```env
# Stability AI API Configuration
STABILITY_API_KEY=your_api_key

# Server Configuration
PORT=5050
OUTPUT_DIR=../assets/img/uploads
FILE_FORMAT=jpg
IMAGE_WIDTH=1024
IMAGE_HEIGHT=768

# Development Settings
DEBUG=True
```

## 📊 API Endpoints

- `POST /generate` - Generate new image
- `GET /images` - List generated images
- `GET /status` - Check service status

## 🔄 Maintenance Schedule

### Daily
- Automated backups
- Log rotation
- SSL certificate check

### Weekly
- Review access logs
- Check disk usage
- Validate image generation

### Monthly
- Update API keys if needed
- Review and archive old images
- Performance optimization

## 📞 Support Information

- **Service Name:** Image Generator
- **Category:** E (External API)
- **Port:** 5050
- **Domain:** api.projekt-ai.net
- **Documentation:** This file
- **Logs:** `logs/access.log` and `logs/error.log`

## Features

- Web interface for easy image generation
- API endpoints for programmatic access
- Supports custom dimensions and filenames
- Outputs directly to the website's assets directory
- Works with or without an API key (mock generation in dev mode)

## Example Prompts

- **DJ/Club Image**: "A professional DJ performing at a nightclub, dark moody lighting with blue and purple highlights, mixing console in foreground, crowd in background, highly detailed, photorealistic"
  
- **Workflow Diagram**: "A clean, modern workflow diagram showing automation between different software systems, with data flowing between nodes, professional business style, white background"

- **App UI**: "Mobile app user interface for a ticketing system, dark theme, showing event details and checkout screen, modern minimalist design"

## Notes

- Without an API key, the service will generate mock images (gradient with text)
- Images are saved directly to the website's assets directory
- The service runs on port 5050 by default (configurable in .env) 