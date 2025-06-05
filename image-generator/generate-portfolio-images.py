#!/usr/bin/env python3
"""
Portfolio Image Generator
Generates images for portfolio projects using Stability AI's API
"""

import os
import json
import time
import requests
from pathlib import Path

# Configuration
API_URL = "http://localhost:5050/generate"
OUTPUT_DIR = "../assets/img/portfolio"
PORTFOLIO_CONFIG = "../portfolio-config.json"
FILE_FORMAT = "jpg"  # Default image format

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Project prompts for image generation
PROJECT_PROMPTS = {
    "club77-content-pipeline": "A modern content pipeline system with flowing data streams and automated processing, digital art style",
    "upwork-proposal-automation": "An AI-powered proposal writing system with glowing neural networks and document generation, cyberpunk style",
    "blueprint-generator": "A blueprint generation tool with architectural designs and technical schematics, blueprint style",
    "client-proposals": "A professional proposal management system with elegant UI and document workflows, corporate style",
    "multi-model-chatbot": "A multi-model AI chatbot interface with glowing neural networks and conversation flows, futuristic style"
}

def generate_image(project_id, prompt):
    """Generate an image for a portfolio project"""
    try:
        # Prepare the request
        data = {
            "prompt": prompt,
            "width": 1024,
            "height": 768,
            "format": FILE_FORMAT
        }
        
        # Make the API request
        response = requests.post(API_URL, json=data)
        response.raise_for_status()
        
        # Get the image URL from response
        result = response.json()
        image_url = result.get("url")
        
        if not image_url:
            raise ValueError("No image URL in response")
            
        # Download and save the image
        filename = f"{project_id}-card.{FILE_FORMAT}"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        img_response = requests.get(image_url)
        img_response.raise_for_status()
        
        with open(filepath, "wb") as f:
            f.write(img_response.content)
            
        print(f"✅ Generated image for {project_id}")
        return f"/assets/img/portfolio/{filename}"
        
    except Exception as e:
        print(f"❌ Error generating image for {project_id}: {str(e)}")
        return None

def update_portfolio_config(image_urls):
    """Update portfolio config with generated image URLs"""
    try:
        # Read current config
        with open(PORTFOLIO_CONFIG, "r") as f:
            config = json.load(f)
            
        # Update image URLs
        for project_id, image_url in image_urls.items():
            if image_url and project_id in config["projects"]:
                config["projects"][project_id]["header_image"] = image_url
                
        # Save updated config
        with open(PORTFOLIO_CONFIG, "w") as f:
            json.dump(config, f, indent=2)
            
        print("✅ Updated portfolio config with image URLs")
        
    except Exception as e:
        print(f"❌ Error updating portfolio config: {str(e)}")

def main():
    """Main function to generate portfolio images"""
    print("\n🚀 Starting portfolio image generation...\n")
    
    image_urls = {}
    
    # Generate images for each project
    for project_id, prompt in PROJECT_PROMPTS.items():
        print(f"\n📸 Generating image for {project_id}...")
        image_url = generate_image(project_id, prompt)
        if image_url:
            image_urls[project_id] = image_url
            
    # Update portfolio config
    if image_urls:
        update_portfolio_config(image_urls)
        
    print("\n✨ Portfolio image generation complete!")

if __name__ == "__main__":
    main() 