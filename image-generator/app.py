#!/usr/bin/env python3
"""
Image Generator API for Projekt AI Website
Uses Stability AI's API to generate images based on text prompts.
"""

import os
import time
import json
import base64
import logging
from pathlib import Path
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from PIL import Image, ImageOps

# Try to import stability_sdk - if not available, we'll mock it for development
try:
    import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
    from stability_sdk import client
    STABILITY_AVAILABLE = True
except ImportError:
    STABILITY_AVAILABLE = False
    print("WARNING: stability_sdk not available. Using mock image generation for development.")

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configuration
API_KEY = os.getenv('STABILITY_API_KEY')
PORT = int(os.getenv('PORT', 5050))
OUTPUT_DIR = os.getenv('OUTPUT_DIR', '../assets/img/uploads')
FILE_FORMAT = os.getenv('FILE_FORMAT', 'jpg').lower()
IMAGE_WIDTH = int(os.getenv('IMAGE_WIDTH', 1024))
IMAGE_HEIGHT = int(os.getenv('IMAGE_HEIGHT', 768))

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

def mock_generate_image(width, height):
    """Generate a mock image for development when stability_sdk is not available"""
    # Create a gradient image as a placeholder
    img = Image.new('RGB', (width, height), color='black')
    for y in range(height):
        for x in range(width):
            r = int(255 * x / width)
            g = int(255 * y / height)
            b = 100
            img.putpixel((x, y), (r, g, b))
    
    # Add some text
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 40)
    except IOError:
        font = ImageFont.load_default()
    
    draw.text((width//2-150, height//2), "MOCK IMAGE\nNo API key provided", 
              fill=(255, 255, 255), font=font)
    
    return img

def generate_image_with_stability(prompt, width, height, filename):
    """Generate an image using Stability AI's API"""
    if not STABILITY_AVAILABLE or not API_KEY:
        logger.warning("Using mock image generation (stability_sdk not available or no API key)")
        img = mock_generate_image(width, height)
        img.save(filename)
        return filename
    
    try:
        # Set up stability api client
        stability_api = client.StabilityInference(
            key=API_KEY,
            verbose=True,
        )
        
        # Generate image
        answers = stability_api.generate(
            prompt=prompt,
            width=width,
            height=height,
            samples=1,
            steps=30,
        )
        
        # Process and save the image
        for resp in answers:
            for artifact in resp.artifacts:
                if artifact.finish_reason == generation.FILTER:
                    logger.warning("Your prompt was filtered by safety systems")
                    return None
                if artifact.type == generation.ARTIFACT_IMAGE:
                    img = Image.open(BytesIO(artifact.binary))
                    img.save(filename)
                    return filename
                    
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        # Fallback to mock image if API fails
        img = mock_generate_image(width, height)
        img.save(filename)
        
    return filename

# Base style prompt for all images
def get_full_prompt(subject_prompt):
    base_prompt = (
        "dramatic side lighting, styled like Annie Leibovitz photography, professional DSLR, "
        "sharp details, editorial quality, authentic moment, cinematic color grading"
    )
    return f"{base_prompt}, {subject_prompt.strip()}"

@app.route('/')
def index():
    """Serve the HTML interface"""
    return render_template('index.html')

@app.route('/status', methods=['GET'])
def status():
    """Status endpoint to check if the service is running"""
    return jsonify({
        "status": "online",
        "stability_sdk_available": STABILITY_AVAILABLE,
        "api_key_configured": bool(API_KEY),
        "output_directory": OUTPUT_DIR
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate an image from a text prompt"""
    data = request.get_json()
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Missing prompt parameter"}), 400
    
    # Use the new base prompt for all generations
    subject_prompt = data.get('prompt')
    prompt = get_full_prompt(subject_prompt)
    filename = data.get('filename', f"generated-{int(time.time())}.{FILE_FORMAT}")
    width = data.get('width', IMAGE_WIDTH)
    height = data.get('height', IMAGE_HEIGHT)
    
    # Ensure width and height are integers
    try:
        width = int(width)
        height = int(height)
    except (ValueError, TypeError):
        return jsonify({"error": "Width and height must be integers"}), 400
    
    # Generate the image
    filepath = os.path.join(OUTPUT_DIR, filename)
    result = generate_image_with_stability(prompt, width, height, filepath)
    
    if not result:
        return jsonify({"error": "Failed to generate image"}), 500
    
    # Return the file path and URL
    return jsonify({
        "success": True,
        "filepath": filepath,
        "url": f"/assets/img/uploads/{filename}",
        "filename": filename
    })

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve generated images for preview"""
    return send_from_directory(OUTPUT_DIR, filename)

@app.route('/images', methods=['GET'])
def list_images():
    """List all generated images"""
    files = []
    for file in os.listdir(OUTPUT_DIR):
        if file.endswith(('.jpg', '.jpeg', '.png')):
            files.append({
                "filename": file,
                "url": f"/assets/img/uploads/{file}",
                "created": os.path.getctime(os.path.join(OUTPUT_DIR, file))
            })
    
    # Sort by creation time (newest first)
    files.sort(key=lambda x: x["created"], reverse=True)
    
    return jsonify({"images": files})

if __name__ == '__main__':
    logger.info(f"Starting Image Generator API on port {PORT}")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    logger.info(f"Stability SDK available: {STABILITY_AVAILABLE}")
    app.run(host='0.0.0.0', port=PORT, debug=True) 