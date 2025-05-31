#!/bin/bash

cd /root/homelab-docs/projekt-ai-website

echo "🎨 Deploying new CLIENT LOGOS..."

git add -A
git commit -m "✨ Updated client logos with new uploads

- Replaced old SVG client logos with new PNG versions
- Client Logo 1: assets/img/uploads/1.png (27.1 KB)
- Client Logo 2: assets/img/uploads/2.png (14.7 KB)  
- Client Logo 3: assets/img/uploads/3.png (41.7 KB)
- Client Logo 4: assets/img/uploads/4.png (18.2 KB)
- Client Logo 5: assets/img/uploads/5.png (48.5 KB)

- Updated index-extramedium-exact-v2.html clients section
- Maintained grayscale filter and consistent styling
- Removed 6th logo slot to match 5 new uploads"

git push origin main

echo "✅ New client logos deployed! Live at projekt-ai.net" 