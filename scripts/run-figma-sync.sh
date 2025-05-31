#!/bin/bash

# Projekt AI - Figma Logo Sync Runner
# Automated asset pipeline for creative workflow automation

echo "🎨 Projekt AI - Figma Logo Sync"
echo "================================"

# Check for required environment variables
if [ -z "$FIGMA_API_TOKEN" ]; then
    echo "❌ FIGMA_API_TOKEN environment variable not set!"
    echo ""
    echo "🔐 For security, set your token as an environment variable:"
    echo "   export FIGMA_API_TOKEN=\"your_figma_token_here\""
    echo ""
    echo "💡 Get your token from: https://www.figma.com/developers/api#access-tokens"
    exit 1
fi

if [ -z "$FIGMA_FILE_ID" ]; then
    echo "❌ FIGMA_FILE_ID environment variable not set!"
    echo ""
    echo "📋 Set your Figma file ID:"
    echo "   export FIGMA_FILE_ID=\"your_file_id_here\""
    echo ""
    echo "💡 Get it from your Figma file URL"
    exit 1
fi

# Change to script directory
cd "$(dirname "$0")"

# Verify Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not found"
    echo "💡 Install Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
    exit 1
fi

# Make sure we're in the right directory
if [ ! -f "figma-logo-sync.js" ]; then
    echo "❌ figma-logo-sync.js not found in current directory"
    echo "📁 Current directory: $(pwd)"
    exit 1
fi

echo "🚀 Starting Figma logo sync..."
echo "📋 File ID: $FIGMA_FILE_ID"
echo "🔐 Token: [SECURE - FROM ENVIRONMENT]"
echo ""

# Run the sync
node figma-logo-sync.js

# Check if sync was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Figma sync completed successfully!"
    echo "📁 Check assets/img/logos/ for your synced logos"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Review the downloaded logos"
    echo "2. Update your website HTML to use the new logo assets"
    echo "3. Deploy the updated website"
    echo ""
    echo "💡 This is exactly the kind of creative workflow automation"
    echo "   that demonstrates your expertise to potential clients!"
else
    echo ""
    echo "❌ Figma sync failed. Check the error messages above."
    exit 1
fi 