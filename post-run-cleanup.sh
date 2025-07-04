#!/bin/bash

# Post-run cleanup script for container cleanup and artifact management
# Usage: ./post-run-cleanup.sh

set -e

echo "=========================================="
echo "Post-run cleanup and artifact management"
echo "=========================================="

# Step 1: Container cleanup - prune dangling images older than 3 days
echo "1. Pruning dangling Docker images older than 3 days..."
if command -v docker &> /dev/null; then
    docker image prune -f --filter "until=72h" && echo "✓ Docker image pruning completed" || echo "⚠ Docker image pruning failed"
else
    echo "⚠ Docker not found, skipping image pruning"
fi

# Step 2: Create timestamped artifact directory
TIMESTAMP=$(date +%F-%T)
ARTIFACT_DIR="/opt/featherweight/artifacts/${TIMESTAMP}"
echo "2. Creating artifact directory: ${ARTIFACT_DIR}"
mkdir -p "${ARTIFACT_DIR}"

# Step 3: Move specific artifacts
echo "3. Moving artifacts to archive..."

# Create subdirectories for organization
mkdir -p "${ARTIFACT_DIR}/logs"
mkdir -p "${ARTIFACT_DIR}/k6-results"
mkdir -p "${ARTIFACT_DIR}/cypress"

# Move application logs (exclude node_modules and archived artifacts)
echo "   - Moving application logs..."
find /opt/featherweight -name "*.log" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/artifacts/*" \
    -not -path "*/.git/*" \
    2>/dev/null | while read -r logfile; do
    echo "     Moving: $(basename "$logfile")"
    mv "$logfile" "${ARTIFACT_DIR}/logs/" 2>/dev/null || echo "     Failed to move $logfile"
done

# Move k6 result files (JSON, HTML reports)
echo "   - Moving k6 test results..."
find /opt/featherweight -name "*k6*" -type f \
    -not -name "*.js" \
    -not -path "*/node_modules/*" \
    -not -path "*/artifacts/*" \
    -not -path "*/.git/*" \
    2>/dev/null | while read -r k6file; do
    echo "     Moving: $(basename "$k6file")"
    mv "$k6file" "${ARTIFACT_DIR}/k6-results/" 2>/dev/null || echo "     Failed to move $k6file"
done

# Move k6 summary files
find /opt/featherweight -name "*summary*.json" -o -name "*summary*.html" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/artifacts/*" \
    -not -path "*/.git/*" \
    2>/dev/null | while read -r summary; do
    echo "     Moving: $(basename "$summary")"
    mv "$summary" "${ARTIFACT_DIR}/k6-results/" 2>/dev/null || echo "     Failed to move $summary"
done

# Move Cypress artifacts
echo "   - Moving Cypress artifacts..."
if [ -d "/opt/featherweight/FlappyJournal/cypress/videos" ]; then
    mkdir -p "${ARTIFACT_DIR}/cypress/videos"
    find /opt/featherweight/FlappyJournal/cypress/videos -type f 2>/dev/null | while read -r video; do
        echo "     Moving: $(basename "$video")"
        mv "$video" "${ARTIFACT_DIR}/cypress/videos/" 2>/dev/null || echo "     Failed to move $video"
    done
fi

if [ -d "/opt/featherweight/FlappyJournal/cypress/screenshots" ]; then
    mkdir -p "${ARTIFACT_DIR}/cypress/screenshots"
    find /opt/featherweight/FlappyJournal/cypress/screenshots -type f 2>/dev/null | while read -r screenshot; do
        echo "     Moving: $(basename "$screenshot")"
        mv "$screenshot" "${ARTIFACT_DIR}/cypress/screenshots/" 2>/dev/null || echo "     Failed to move $screenshot"
    done
fi

if [ -d "/opt/featherweight/FlappyJournal/cypress/reports" ]; then
    mkdir -p "${ARTIFACT_DIR}/cypress/reports"
    find /opt/featherweight/FlappyJournal/cypress/reports -type f 2>/dev/null | while read -r report; do
        echo "     Moving: $(basename "$report")"
        mv "$report" "${ARTIFACT_DIR}/cypress/reports/" 2>/dev/null || echo "     Failed to move $report"
    done
fi

# Move mochawesome reports
find /opt/featherweight -name "mochawesome-report*" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/artifacts/*" \
    -not -path "*/.git/*" \
    2>/dev/null | while read -r report; do
    echo "     Moving: $(basename "$report")"
    mv "$report" "${ARTIFACT_DIR}/cypress/" 2>/dev/null || echo "     Failed to move $report"
done

# Create a summary file
echo "4. Creating run summary..."
cat > "${ARTIFACT_DIR}/run-summary.txt" << SUMMARY
Featherweight Test Run Archive
==============================
Timestamp: ${TIMESTAMP}
Host: $(hostname)
User: $(whoami)

Contents:
$(find "${ARTIFACT_DIR}" -type f | sed 's|'${ARTIFACT_DIR}'/||' | sort)

Total files archived: $(find "${ARTIFACT_DIR}" -type f | wc -l)
Total size: $(du -sh "${ARTIFACT_DIR}" | cut -f1)
SUMMARY

echo "=========================================="
echo "✓ Cleanup and archiving completed successfully!"
echo "✓ Artifacts stored in: ${ARTIFACT_DIR}"
echo "✓ Total files archived: $(find "${ARTIFACT_DIR}" -type f | wc -l)"
echo "✓ Total size: $(du -sh "${ARTIFACT_DIR}" | cut -f1)"
echo "=========================================="
