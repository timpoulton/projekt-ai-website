#!/bin/bash

# AI Memory Load Script
# Purpose: Load project context at the start of each session

# Set error handling
set -e
trap 'echo "Error on line $LINENO"' ERR

# Configuration
SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_FILE="$SCRIPT_ROOT/website-memory.json"
MASTER_DOC="$SCRIPT_ROOT/../../docs/PROJEKT-AI-WEBSITE-MASTER.md"
LOG_DIR="$SCRIPT_ROOT/../logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_DIR/ai-memory.log"
    echo -e "[$timestamp] [$level] $message"
}

# Check if memory file exists
if [ ! -f "$MEMORY_FILE" ]; then
    log_message "ERROR" "AI memory file not found at $MEMORY_FILE"
    exit 1
fi

# Check if master documentation exists
if [ ! -f "$MASTER_DOC" ]; then
    log_message "ERROR" "Master documentation not found at $MASTER_DOC"
    exit 1
fi

# Load project context
log_message "INFO" "Loading project context..."

# Extract project name and status
PROJECT_NAME=$(jq -r '.project_name' "$MEMORY_FILE")
PROJECT_STATUS=$(jq -r '.status' "$MEMORY_FILE")
PROJECT_CATEGORY=$(jq -r '.category' "$MEMORY_FILE")

# Extract current focus areas
CURRENT_FOCUS=$(jq -r '.components | to_entries[] | select(.value.status == "in_progress") | .key' "$MEMORY_FILE")

# Extract next actions
NEXT_ACTIONS=$(jq -r '.next_actions[] | "Priority \(.priority): \(.action)"' "$MEMORY_FILE")

# Display loaded context
echo -e "\n${GREEN}=== Projekt-AI Website Context Loaded ===${NC}"
echo -e "Project: ${YELLOW}$PROJECT_NAME${NC}"
echo -e "Status: ${YELLOW}$PROJECT_STATUS${NC}"
echo -e "Category: ${YELLOW}$PROJECT_CATEGORY${NC}"
echo -e "\n${GREEN}Current Focus Areas:${NC}"
for focus in $CURRENT_FOCUS; do
    echo -e "- ${YELLOW}$focus${NC}"
done
echo -e "\n${GREEN}Next Actions:${NC}"
echo -e "$NEXT_ACTIONS"

# Check documentation age
DOC_AGE=$(($(date +%s) - $(stat -c %Y "$MASTER_DOC")))
DOC_AGE_HOURS=$((DOC_AGE / 3600))

if [ $DOC_AGE_HOURS -gt 8 ]; then
    log_message "WARNING" "Master documentation is $DOC_AGE_HOURS hours old"
    echo -e "\n${YELLOW}⚠️  Warning: Master documentation is $DOC_AGE_HOURS hours old${NC}"
    echo -e "Consider running: ${YELLOW}./scripts/maintenance/doc_health_check.sh${NC}"
fi

# Check memory file age
MEMORY_AGE=$(($(date +%s) - $(stat -c %Y "$MEMORY_FILE")))
MEMORY_AGE_HOURS=$((MEMORY_AGE / 3600))

if [ $MEMORY_AGE_HOURS -gt 8 ]; then
    log_message "WARNING" "AI memory file is $MEMORY_AGE_HOURS hours old"
    echo -e "\n${YELLOW}⚠️  Warning: AI memory file is $MEMORY_AGE_HOURS hours old${NC}"
    echo -e "Consider running: ${YELLOW}./scripts/maintenance/doc_health_check.sh${NC}"
fi

log_message "SUCCESS" "Project context loaded successfully"
exit 0 