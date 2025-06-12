#!/usr/bin/env python3
"""
Multi-Model AI Portfolio Generator
Combines GPT-4, Gemini, and Cohere for content generation
with image generation capabilities.
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
import openai
from google import generativeai as genai
import cohere
from PIL import Image
import requests
import mdx2

class PortfolioGenerator:
    """
    Multi-model approach:
    1. GPT-4: Main content generation and structure
    2. Gemini: Visual descriptions and image prompts
    3. Cohere: Semantic analysis and keyword optimization
    4. DALL-E: Image generation based on Gemini's prompts
    """
    
    def __init__(self, project_name: str, project_overview: str):
        self.project_name = project_name
        self.project_overview = project_overview
        self.project_dir = Path(f"projects/{project_name}")
        self.assets_dir = self.project_dir / "assets"
        self.setup_directories()
        
        # Initialize AI clients
        self.openai_client = openai.OpenAI()
        self.cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.gemini_model = genai.GenerativeModel('gemini-pro')
        
    def setup_directories(self):
        """Create necessary directories for the project"""
        self.project_dir.mkdir(parents=True, exist_ok=True)
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        
    async def generate_content(self) -> Dict:
        """Generate portfolio content using multiple AI models"""
        
        # Step 1: Deep analysis with Cohere
        insights = await self.analyze_with_cohere()
        
        # Step 2: Generate base content with GPT-4
        base_content = await self.generate_with_gpt4(insights)
        
        # Step 3: Generate visual descriptions with Gemini
        visual_content = await self.generate_with_gemini(base_content, insights)
        
        # Step 4: Generate images with DALL-E
        images = await self.generate_images(visual_content)
        
        # Step 5: Create final content structure
        final_content = {
            "project_name": self.project_name,
            "overview": self.project_overview,
            "content": base_content,
            "visual_descriptions": visual_content,
            "images": images,
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }
        
        return final_content
    
    async def analyze_with_cohere(self) -> Dict:
        """Use Cohere for deep semantic analysis"""
        response = self.cohere_client.chat(
            message=f"Analyze this project for portfolio content: {self.project_overview}",
            model="command-r-plus"
        )
        return {
            "key_points": response.text.split("\n"),
            "semantic_analysis": response.text
        }
    
    async def generate_with_gpt4(self, insights: Dict) -> Dict:
        """Generate base content with GPT-4"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an expert portfolio content writer."},
                {"role": "user", "content": f"""
                Create portfolio content for: {self.project_name}
                Overview: {self.project_overview}
                Key points: {insights['key_points']}
                
                Generate:
                1. Hero section content
                2. Core components/services
                3. Process steps
                4. Project highlights
                5. Related projects
                """}
            ]
        )
        return json.loads(response.choices[0].message.content)
    
    async def generate_with_gemini(self, base_content: Dict, insights: Dict) -> Dict:
        """Generate visual descriptions with Gemini"""
        prompt = f"""
        Create visual descriptions for: {self.project_name}
        Content: {json.dumps(base_content)}
        Insights: {json.dumps(insights)}
        
        Generate:
        1. Hero image description
        2. Workflow diagram description
        3. Result screenshots description
        4. Thumbnail image description
        """
        
        response = self.gemini_model.generate_content(prompt)
        return json.loads(response.text)
    
    async def generate_images(self, visual_content: Dict) -> Dict:
        """Generate images with DALL-E based on Gemini's descriptions"""
        images = {}
        
        for key, description in visual_content.items():
            response = self.openai_client.images.generate(
                model="dall-e-3",
                prompt=description,
                size="1024x1024",
                quality="standard",
                n=1
            )
            
            # Download and save image
            image_url = response.data[0].url
            image_path = self.assets_dir / f"{key}.png"
            
            response = requests.get(image_url)
            with open(image_path, "wb") as f:
                f.write(response.content)
            
            images[key] = str(image_path)
        
        return images
    
    def save_content(self, content: Dict):
        """Save generated content to files"""
        # Save JSON content
        with open(self.project_dir / "content.json", "w") as f:
            json.dump(content, f, indent=2)
        
        # Generate HTML
        html_content = self.generate_html(content)
        with open(self.project_dir / "index.html", "w") as f:
            f.write(html_content)
        
        # Generate Markdown
        md_content = self.generate_markdown(content)
        with open(self.project_dir / "content.md", "w") as f:
            f.write(md_content)
    
    def generate_html(self, content: Dict) -> str:
        """Generate HTML from content"""
        template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{project_name}</title>
            <link rel="stylesheet" href="/assets/css/style.css">
        </head>
        <body>
            <div class="project-container">
                <div class="hero-section">
                    <h1>{project_name}</h1>
                    <p>{overview}</p>
                    <img src="{hero_image}" alt="Project Hero">
                </div>
                
                <div class="core-components">
                    <h2>Core Components</h2>
                    {core_components}
                </div>
                
                <div class="process-steps">
                    <h2>Process</h2>
                    {process_steps}
                </div>
                
                <div class="workflow">
                    <h2>Workflow</h2>
                    <img src="{workflow_image}" alt="Workflow Diagram">
                </div>
                
                <div class="results">
                    <h2>Results</h2>
                    <img src="{results_image}" alt="Project Results">
                </div>
            </div>
        </body>
        </html>
        """
        
        return template.format(
            project_name=content["project_name"],
            overview=content["overview"],
            hero_image=content["images"]["hero"],
            core_components=self._format_list(content["content"]["core_components"]),
            process_steps=self._format_list(content["content"]["process_steps"]),
            workflow_image=content["images"]["workflow"],
            results_image=content["images"]["results"]
        )
    
    def generate_markdown(self, content: Dict) -> str:
        """Generate Markdown from content"""
        md = f"""# {content['project_name']}

## Overview
{content['overview']}

## Core Components
{self._format_markdown_list(content['content']['core_components'])}

## Process
{self._format_markdown_list(content['content']['process_steps'])}

## Workflow
![Workflow Diagram]({content['images']['workflow']})

## Results
![Project Results]({content['images']['results']})
"""
        return md
    
    def _format_list(self, items: List[str]) -> str:
        """Format list items for HTML"""
        return "".join(f"<li>{item}</li>" for item in items)
    
    def _format_markdown_list(self, items: List[str]) -> str:
        """Format list items for Markdown"""
        return "".join(f"- {item}\n" for item in items)

async def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate portfolio content using AI")
    parser.add_argument("project_name", help="Name of the project")
    parser.add_argument("overview", help="Brief project overview")
    args = parser.parse_args()
    
    generator = PortfolioGenerator(args.project_name, args.overview)
    content = await generator.generate_content()
    generator.save_content(content)
    
    print(f"✅ Portfolio content generated for {args.project_name}")
    print(f"📁 Files saved in: {generator.project_dir}")

if __name__ == "__main__":
    asyncio.run(main()) 