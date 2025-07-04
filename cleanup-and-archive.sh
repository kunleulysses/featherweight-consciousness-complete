#!/bin/bash

# Container cleanup & artifact management script
# This script should be run after each test run

set -e

echo "Starting container cleanup and artifact management..."

# Step 1: Prune dangling Docker images older than 3 days
echo "Pruning dangling Docker images older than 3 days..."
docker image prune -f --filter "until=72h" || {
    echo "Warning: Docker image pruning failed or no Docker daemon running"
}

# Step 2: Create timestamped artifact directory
TIMESTAMP=$(date +%F-%T)
ARTIFACT_DIR="/opt/featherweight/artifacts/${TIMESTAMP}"
echo "Creating artifact directory: ${ARTIFACT_DIR}"
mkdir -p "${ARTIFACT_DIR}"

# Step 3: Move logs, k6 summaries, and Cypress artifacts
echo "Moving artifacts to ${ARTIFACT_DIR}..."

# Find and move log files (common log extensions)
find /opt/featherweight -name "*.log" -type f 2>/dev/null | while read -r logfile; do
    if [[ "$logfile" != *"/artifacts/"* ]]; then
        echo "Moving log: $logfile"
        mv "$logfile" "${ARTIFACT_DIR}/" 2>/dev/null || echo "Failed to move $logfile"
    fi
done

# Find and move k6 summary files (typically JSON or HTML)
find /opt/featherweight -name "*summary*" -type f 2>/dev/null | while read -r summary; do
    if [[ "$summary" != *"/artifacts/"* ]]; then
        echo "Moving k6 summary: $summary"
        mv "$summary" "${ARTIFACT_DIR}/" 2>/dev/null || echo "Failed to move $summary"
    fi
done

# Find and move k6 result files
find /opt/featherweight -name "*k6*" -type f 2>/dev/null | while read -r k6file; do
    if [[ "$k6file" != *"/artifacts/"* ]] && [[ "$k6file" != *".js" ]]; then
        echo "Moving k6 file: $k6file"
        mv "$k6file" "${ARTIFACT_DIR}/" 2>/dev/null || echo "Failed to move $k6file"
    fi
done

# Find and move Cypress artifacts (videos, screenshots, reports)
find /opt/featherweight -path "*/cypress/videos/*" -type f 2>/dev/null | while read -r video; do
    echo "Moving Cypress video: $video"
    mkdir -p "${ARTIFACT_DIR}/cypress/videos"
    mv "$video" "${ARTIFACT_DIR}/cypress/videos/" 2>/dev/null || echo "Failed to move $video"
done

find /opt/featherweight -path "*/cypress/screenshots/*" -type f 2>/dev/null | while read -r screenshot; do
    echo "Moving Cypress screenshot: $screenshot"
    mkdir -p "${ARTIFACT_DIR}/cypress/screenshots"
    mv "$screenshot" "${ARTIFACT_DIR}/cypress/screenshots/" 2>/dev/null || echo "Failed to move $screenshot"
done

find /opt/featherweight -path "*/cypress/reports/*" -type f 2>/dev/null | while read -r report; do
    echo "Moving Cypress report: $report"
    mkdir -p "${ARTIFACT_DIR}/cypress/reports"
    mv "$report" "${ARTIFACT_DIR}/cypress/reports/" 2>/dev/null || echo "Failed to move $report"
done

# Also check for any mochawesome reports
find /opt/featherweight -name "mochawesome-report*" -type f 2>/dev/null | while read -r report; do
    if [[ "$report" != *"/artifacts/"* ]]; then
        echo "Moving mochawesome report: $report"
        mv "$report" "${ARTIFACT_DIR}/" 2>/dev/null || echo "Failed to move $report"
    fi
done

echo "Cleanup and archiving completed successfully!"
echo "Artifacts stored in: ${ARTIFACT_DIR}"
