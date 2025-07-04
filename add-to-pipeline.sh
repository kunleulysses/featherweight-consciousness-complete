#!/bin/bash

# Integration helper script
# Add this line to the end of your test scripts:
# /opt/featherweight/post-run-cleanup.sh

echo "To integrate cleanup into your test pipelines, add this line to the end of your test scripts:"
echo ""
echo "# Container cleanup and artifact management"
echo "/opt/featherweight/post-run-cleanup.sh"
echo ""
echo "Available scripts:"
echo "- /opt/featherweight/post-run-cleanup.sh    (recommended - organized output)"
echo "- /opt/featherweight/cleanup-and-archive.sh (basic version)"
echo ""
echo "Both scripts will:"
echo "1. Prune dangling Docker images older than 3 days"
echo "2. Move logs, k6 summaries, and Cypress artifacts to timestamped directories"
echo "3. Create organized artifact structure in /opt/featherweight/artifacts/"
