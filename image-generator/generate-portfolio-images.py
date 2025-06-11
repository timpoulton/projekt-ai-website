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
PORT = os.getenv("PORT", "5050")
API_URL = f"http://localhost:{PORT}/generate"
API_BASE = API_URL.rsplit("/generate", 1)[0]
OUTPUT_DIR = "../assets/img/portfolio"
PORTFOLIO_CONFIG = "../portfolio-config.json"
FILE_FORMAT = "jpg"  # Default image format

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Project prompts for image generation
PROJECT_PROMPTS = {
    "club77-content-pipeline": "A minimal portfolio card for Club77 Content Pipeline: AI Content Generation & Social Media Automation. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg.",
    "upwork-proposal-automation": "A minimal portfolio card for Upwork Proposal Automation: AI-powered proposal writing system with glowing neural networks and document generation. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg.",
    "blueprint-generator": "A minimal portfolio card for Blueprint Generator: Blueprint generation tool with architectural designs and technical schematics. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg.",
    "client-proposals": "A minimal portfolio card for Client Proposals: Professional proposal management system with elegant UI and document workflows. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg.",
    "multi-model-chatbot": "A minimal portfolio card for Multi-Model Chatbot: Multi-model AI chatbot interface with glowing neural networks and conversation flows. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg.",
    "dj-recording-manager": "A minimal portfolio card for DJ Recording Manager: Sleek, tech-y card mockup featuring audio waveforms, turntable silhouette, and a minimalist dashboard UI inset. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg.",
    "manychat-guestlist-automation": "A minimal portfolio card for ManyChat Guestlist Automation: Vibrant promotional card for a chatbot-powered guestlist system with chat bubbles, scrollable guest list UI, and festive party icons. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: flat vector illustration, no extra text or shadows. 1024×768, jpg."
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