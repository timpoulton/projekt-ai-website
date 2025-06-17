#!/bin/bash

# Portfolio Content Generator
# This script helps generate content for portfolio pages using the template

# Check if project name is provided
if [ -z "$1" ]; then
    echo "Usage: ./generate-portfolio-content.sh <project-name>"
    exit 1
fi

PROJECT_NAME=$1
PROJECT_DIR="projekt-ai-website"
TEMPLATE_FILE="$PROJECT_DIR/PORTFOLIO-CONTENT-TEMPLATE.md"
OUTPUT_FILE="$PROJECT_DIR/projects/$PROJECT_NAME/content.md"

# Create project directory if it doesn't exist
mkdir -p "$PROJECT_DIR/projects/$PROJECT_NAME"
mkdir -p "$PROJECT_DIR/assets/img/uploads"
mkdir -p "$PROJECT_DIR/assets/img/projects"

# Copy template to project directory
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# Replace project name in template
sed -i "s/\[Project Name\]/$PROJECT_NAME/g" "$OUTPUT_FILE"
sed -i "s/\[project-name\]/${PROJECT_NAME,,}/g" "$OUTPUT_FILE"

echo "✅ Content template created for $PROJECT_NAME"
echo "📝 Edit the content at: $OUTPUT_FILE"
echo "📁 Project assets should be placed in:"
echo "   - $PROJECT_DIR/assets/img/uploads/${PROJECT_NAME,,}-bg.jpg"
echo "   - $PROJECT_DIR/assets/img/uploads/${PROJECT_NAME,,}-workflow.png"
echo "   - $PROJECT_DIR/assets/img/uploads/${PROJECT_NAME,,}-result.png"
echo "   - $PROJECT_DIR/assets/img/projects/${PROJECT_NAME,,}-thumb.jpg"

# Create HTML file from the new template location
NEW_TEMPLATE_HTML="$PROJECT_DIR/project-template.html"

# Fallback check in case the template cannot be found
if [[ ! -f "$NEW_TEMPLATE_HTML" ]]; then
    echo "❌ New portfolio template not found at $NEW_TEMPLATE_HTML"
    exit 1
fi

# Copy the new template to the project directory
cp "$NEW_TEMPLATE_HTML" "$PROJECT_DIR/projects/$PROJECT_NAME/index.html"

echo "✅ HTML template created at: $PROJECT_DIR/projects/$PROJECT_NAME/index.html"
echo ""
echo "Next steps:"
echo "1. Fill out the content template"
echo "2. Add project images"
echo "3. Update the HTML file with your content"
echo "4. Test the page locally"
echo "5. Deploy changes" 