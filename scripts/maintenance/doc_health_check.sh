#!/bin/bash

# Documentation Health Check Script
# Purpose: Verify documentation integrity and update timestamps

# Set error handling
set -e
trap 'echo "Error on line $LINENO"' ERR

# Configuration
DOC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MASTER_DOC="$DOC_ROOT/docs/PROJEKT-AI-WEBSITE-MASTER.md"
MEMORY_FILE="$DOC_ROOT/scripts/ai-memory/website-memory.json"
MAX_AGE_HOURS=8

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Starting documentation health check..."

# Check if master documentation exists
if [ ! -f "$MASTER_DOC" ]; then
    echo -e "${RED}❌ Master documentation not found at $MASTER_DOC${NC}"
    exit 1
fi

# Check if memory file exists
if [ ! -f "$MEMORY_FILE" ]; then
    echo -e "${RED}❌ AI memory file not found at $MEMORY_FILE${NC}"
    exit 1
fi

# Check documentation age
DOC_AGE=$(($(date +%s) - $(stat -c %Y "$MASTER_DOC")))
DOC_AGE_HOURS=$((DOC_AGE / 3600))

if [ $DOC_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo -e "${YELLOW}⚠️  Master documentation is $DOC_AGE_HOURS hours old${NC}"
else
    echo -e "${GREEN}✅ Master documentation is up to date ($DOC_AGE_HOURS hours old)${NC}"
fi

# Check memory file age
MEMORY_AGE=$(($(date +%s) - $(stat -c %Y "$MEMORY_FILE")))
MEMORY_AGE_HOURS=$((MEMORY_AGE / 3600))

if [ $MEMORY_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo -e "${YELLOW}⚠️  AI memory file is $MEMORY_AGE_HOURS hours old${NC}"
else
    echo -e "${GREEN}✅ AI memory file is up to date ($MEMORY_AGE_HOURS hours old)${NC}"
fi

# Check for required sections in master documentation
REQUIRED_SECTIONS=(
    "PROJECT STATUS"
    "PROJECT STRUCTURE"
    "TECHNICAL STACK"
    "STANDARDIZATION COMPLIANCE"
    "CURRENT FOCUS AREAS"
    "UPDATE PROTOCOL"
    "IMMEDIATE NEXT ACTIONS"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "##.*$section" "$MASTER_DOC"; then
        echo -e "${RED}❌ Missing required section: $section${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required sections present in master documentation${NC}"

# Check memory file structure
if ! jq empty "$MEMORY_FILE" 2>/dev/null; then
    echo -e "${RED}❌ AI memory file is not valid JSON${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AI memory file is valid JSON${NC}"

# Check for required fields in memory file
REQUIRED_FIELDS=(
    "project_name"
    "last_updated"
    "status"
    "category"
    "components"
    "documentation"
    "deployment"
    "next_actions"
    "memory_persistence"
)

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! jq -e ".$field" "$MEMORY_FILE" >/dev/null 2>&1; then
        echo -e "${RED}❌ Missing required field in memory file: $field${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required fields present in AI memory file${NC}"

# Update timestamps if needed
if [ $DOC_AGE_HOURS -gt $MAX_AGE_HOURS ] || [ $MEMORY_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo "🔄 Updating timestamps..."
    
    # Update master documentation timestamp
    sed -i "s/Last Updated:.*/Last Updated: $(date '+%Y-%m-%d %H:%M')/" "$MASTER_DOC"
    
    # Update memory file timestamp
    jq --arg date "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '.last_updated = $date | .memory_persistence.last_saved = $date' "$MEMORY_FILE" > "${MEMORY_FILE}.tmp"
    mv "${MEMORY_FILE}.tmp" "$MEMORY_FILE"
    
    echo -e "${GREEN}✅ Timestamps updated${NC}"
fi

echo -e "${GREEN}✅ Documentation health check completed successfully${NC}"
exit 0 