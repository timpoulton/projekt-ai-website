#!/usr/bin/env python3
"""
Portfolio Image Generator
Generates images for portfolio projects using Stability AI's API
"""

import os
import json
import time
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
from stability_sdk import client as stability_client

# Load environment variables
load_dotenv()

# Configuration
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
FILE_FORMAT = os.getenv("FILE_FORMAT", "png")
IMAGE_WIDTH = int(os.getenv("IMAGE_WIDTH", 1024))
IMAGE_HEIGHT = int(os.getenv("IMAGE_HEIGHT", 768))
OUTPUT_DIR = "../assets/img/portfolio"
PORTFOLIO_CONFIG = "../portfolio-config.json"
IMAGE_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), OUTPUT_DIR)
os.makedirs(IMAGE_OUTPUT_DIR, exist_ok=True)

# Base style prompt for consistency
BASE_PROMPT = (
    "dramatic side lighting, styled like Annie Leibovitz photography, professional DSLR, "
    "sharp details, editorial quality, authentic moment, cinematic color grading"
)

# Project prompts for image generation
PROJECT_PROMPTS = {
    "club77-content-pipeline": f"{BASE_PROMPT}, Young asian woman in dark nightclub similar berlin nightclub berghain, looking down at her phone in the scrolling motion, background people dancing in dark nightclub scene",
    "upwork-proposal-automation": f"{BASE_PROMPT}, Young entrepreneur staring down at macbook laptop in an ultra modern office environment, the green colourway of the upwork design style reflected in his glasses, the logos of tech startup companies popping out of the screen",
    "blueprint-generator": "A minimal portfolio card for Blueprint Generator: Blueprint generation tool with architectural designs and technical schematics. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: photorealistic, 8k resolution, Behance graphic design style, no text generation. 1024×768, jpg.",
    "client-proposals": "A minimal portfolio card for Client Proposals: Professional proposal management system with elegant UI and document workflows. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: photorealistic, 8k resolution, Behance graphic design style, no text generation. 1024×768, jpg.",
    "multi-model-chatbot": "A minimal portfolio card for Multi-Model Chatbot: Multi-model AI chatbot interface with glowing neural networks and conversation flows. Background: smooth vertical gradient from #000 (top) to #111 (bottom). Accents: thin line and icon highlights in #1dd1a1. Style: photorealistic, 8k resolution, Behance graphic design style, no text generation. 1024×768, jpg.",
    "dj-recording-manager": f"{BASE_PROMPT}, Young startup woman entrepreneur standing at a console in a dark busy nightclub scene operating a panel with video controls",
    "manychat-guestlist-automation": f"{BASE_PROMPT}, nightclub scene, new york style underground nightclub entrance with long line and people waiting to get into the club"
}

def generate_image(project_id, prompt):
    """Generate an image via Stability SDK directly"""
    if not STABILITY_API_KEY:
        print(f"❌ STABILITY_API_KEY not set. Can't generate {project_id}.")
        return None
    filename = f"{project_id}-card.{FILE_FORMAT}"
    filepath = os.path.join(IMAGE_OUTPUT_DIR, filename)
    try:
        # Set up stability client
        stability_api = stability_client.StabilityInference(
            key=STABILITY_API_KEY,
            verbose=True
        )
        # Generate image
        answers = stability_api.generate(
            prompt=prompt,
            width=IMAGE_WIDTH,
            height=IMAGE_HEIGHT,
            samples=1,
            steps=30
        )
        # Save first image artifact
        for resp in answers:
            for artifact in resp.artifacts:
                if artifact.finish_reason == generation.FILTER:
                    print(f"❌ Prompt was filtered for {project_id}")
                    return None
                if artifact.type == generation.ARTIFACT_IMAGE:
                    img = Image.open(BytesIO(artifact.binary))
                    img.save(filepath, format=FILE_FORMAT.upper())
        print(f"✅ Generated image for {project_id}")
        return f"/assets/img/portfolio/{filename}"
    except Exception as e:
        print(f"❌ Error generating image for {project_id}: {e}")
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