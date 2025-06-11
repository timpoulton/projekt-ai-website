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
API_BASE = API_URL.rsplit("/generate", 1)[0]
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
    "multi-model-chatbot": "A multi-model AI chatbot interface with glowing neural networks and conversation flows, futuristic style",
    "dj-recording-manager": "A sleek, tech-y card mockup for a DJ Recording Manager tool. Feature a dark background with glowing audio waveforms, a stylized turntable silhouette, and an OBS Studio icon. Include a minimalist dashboard UI inset showing a recording session timeline and file-management icons. Cool blues and teals, glossy finish.",
    "manychat-guestlist-automation": "A vibrant promotional card for a chatbot-powered guestlist system. Show chat bubbles emerging from a stylized \"M\" chatbot logo, a scrollable guest list UI with check-in toggles, and festive party icons (confetti, cocktail glass). Use a dark nightclub background with bright accent colors (electric pink, lime) and clean, modern interface elements."
}

def generate_image(project_id, prompt):
    """Generate an image for a portfolio project"""
    filename = f"{project_id}-card.{FILE_FORMAT}"
    try:
        # Prepare the request payload with filename
        payload = {
            "prompt": prompt,
            "filename": filename,
            "width": 1024,
            "height": 768
        }
        
        # Make the API request
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        
        # Parse the response
        result = response.json()
        if not result.get("success"):
            raise ValueError("API did not return success")
        
        # Download the generated image from the API
        download_url = f"{API_BASE}/images/{filename}"
        img_response = requests.get(download_url)
        img_response.raise_for_status()
        
        # Save the image locally
        filepath = os.path.join(OUTPUT_DIR, filename)
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

        updated = False
        # Update header_image in portfolio_projects
        for project_id, image_url in image_urls.items():
            if not image_url:
                continue
            # Map hyphenated project_id to config ID
            config_id = project_id.replace("-", "_")
            for proj in config.get("portfolio_projects", []):
                if proj.get("id") == config_id:
                    proj["header_image"] = image_url
                    updated = True
                    break

        # Save updated config if changes were made
        if updated:
            with open(PORTFOLIO_CONFIG, "w") as f:
                json.dump(config, f, indent=2)
            print("✅ Updated portfolio config with image URLs")
        else:
            print("ℹ️ No matching projects found to update in config")

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