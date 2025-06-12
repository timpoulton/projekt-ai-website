#!/bin/bash

# Safe Cron Wrapper Script
# Purpose: Safely execute maintenance tasks with timeout and error handling

# Set error handling
set -e
trap 'echo "Error on line $LINENO"' ERR

# Configuration
SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_ROOT/../logs"
TIMEOUT_SECONDS=300  # 5 minutes
MAX_RETRIES=3

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
    echo "[$timestamp] [$level] $message" >> "$LOG_DIR/maintenance.log"
    echo -e "[$timestamp] [$level] $message"
}

# Function to execute command with timeout
execute_with_timeout() {
    local command="$1"
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log_message "INFO" "Executing: $command (Attempt $((retry_count + 1))/$MAX_RETRIES)"
        
        # Execute command with timeout
        timeout $TIMEOUT_SECONDS bash -c "$command" 2>&1 | tee -a "$LOG_DIR/maintenance.log"
        
        # Check exit status
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log_message "SUCCESS" "Command completed successfully"
            return 0
        elif [ ${PIPESTATUS[0]} -eq 124 ]; then
            log_message "WARNING" "Command timed out after $TIMEOUT_SECONDS seconds"
        else
            log_message "ERROR" "Command failed with exit code ${PIPESTATUS[0]}"
        fi
        
        retry_count=$((retry_count + 1))
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            log_message "INFO" "Retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    log_message "ERROR" "Command failed after $MAX_RETRIES attempts"
    return 1
}

# Main execution
log_message "INFO" "Starting maintenance tasks"

# Run documentation health check
execute_with_timeout "$SCRIPT_ROOT/doc_health_check.sh"

# Run AI memory save
execute_with_timeout "$SCRIPT_ROOT/../ai-memory/save-session.sh"

# Check system health
execute_with_timeout "df -h | grep -v tmpfs"
execute_with_timeout "free -h"
execute_with_timeout "top -bn1 | head -n 5"

# Clean up old logs (keep last 7 days)
find "$LOG_DIR" -name "*.log" -type f -mtime +7 -delete

log_message "INFO" "Maintenance tasks completed"
exit 0 