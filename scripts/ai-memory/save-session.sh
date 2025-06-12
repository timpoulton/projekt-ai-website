#!/bin/bash

# AI Memory Save Script
# Purpose: Save project context after significant changes

# Set error handling
set -e
trap 'echo "Error on line $LINENO"' ERR

# Configuration
SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_FILE="$SCRIPT_ROOT/website-memory.json"
MASTER_DOC="$SCRIPT_ROOT/../../docs/PROJEKT-AI-WEBSITE-MASTER.md"
LOG_DIR="$SCRIPT_ROOT/../logs"
BACKUP_DIR="$SCRIPT_ROOT/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log and backup directories if they don't exist
mkdir -p "$LOG_DIR" "$BACKUP_DIR"

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

# Create backup of current memory file
BACKUP_FILE="$BACKUP_DIR/website-memory-$(date +%Y%m%d-%H%M%S).json"
cp "$MEMORY_FILE" "$BACKUP_FILE"
log_message "INFO" "Created backup at $BACKUP_FILE"

# Update timestamps
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
jq --arg date "$CURRENT_TIME" '.last_updated = $date | .memory_persistence.last_saved = $date' "$MEMORY_FILE" > "${MEMORY_FILE}.tmp"
mv "${MEMORY_FILE}.tmp" "$MEMORY_FILE"

# Update master documentation timestamp
sed -i "s/Last Updated:.*/Last Updated: $(date '+%Y-%m-%d %H:%M')/" "$MASTER_DOC"

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "website-memory-*.json" -type f -mtime +7 -delete

# Verify the update
if jq -e '.last_updated' "$MEMORY_FILE" >/dev/null 2>&1; then
    log_message "SUCCESS" "Memory state saved successfully"
    echo -e "\n${GREEN}=== Memory State Saved ===${NC}"
    echo -e "Timestamp: ${YELLOW}$CURRENT_TIME${NC}"
    echo -e "Backup: ${YELLOW}$BACKUP_FILE${NC}"
else
    log_message "ERROR" "Failed to update memory file"
    echo -e "\n${RED}❌ Failed to update memory file${NC}"
    exit 1
fi

# Check for any warnings
if [ -f "$LOG_DIR/ai-memory.log" ]; then
    WARNINGS=$(grep -c "WARNING" "$LOG_DIR/ai-memory.log" || true)
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️  Found $WARNINGS warnings in the log${NC}"
        echo -e "Check: ${YELLOW}$LOG_DIR/ai-memory.log${NC}"
    fi
fi

exit 0 