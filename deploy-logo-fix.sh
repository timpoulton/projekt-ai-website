#!/bin/bash

# Deploy logo fix to show proper gradient colors
cd /root/homelab-docs/projekt-ai-website

echo "🎨 Deploying logo fix..."

# Add the CSS changes
git add assets/css/style.css

# Commit the changes
git commit -m "Fix logo display: Remove color inversion to show proper gradient branding

- Remove brightness(0) invert(1) filter from .logo-img
- Update hover effect to use brand green glow instead of white  
- Logo now displays proper gradient (#00ff88 to #ff0080) matching proposals system
- Maintains consistent branding across all platforms"

# Push to deploy
git push origin main

echo "✅ Logo fix deployed! The gradient logo should now be visible on https://projekt-ai.net"
echo "🔍 Check the website to verify the logo displays the proper green-to-pink gradient" 