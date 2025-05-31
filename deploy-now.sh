#!/bin/bash

cd /root/homelab-docs/projekt-ai-website

echo "🚀 Deploying new LOGO SYSTEM logos + personal branding..."

git add -A
git commit -m "✨ New LOGO SYSTEM logos + personal branding transformation

- Downloaded from Figma LOGO SYSTEM (DegzkaFinaMjSokEJoNC6w)
- favicon.png: 1.1KB
- header-logo.png: 4.3KB  
- header-logo-light.png: 3.0KB
- logo-icon.png: 2.2KB

- Content transformation: Studio → Timothy Poulton personal expert
- Hero: 'I'm Timothy Poulton' with 20-year experience
- Industry focus: Nightlife, music venues, hospitality
- Portfolio: 6 industry-specific automation projects
- Contact: Personal 'Contact me' language"

git push origin main

echo "✅ Deployed to GitHub! Netlify will auto-deploy to projekt-ai.net" 