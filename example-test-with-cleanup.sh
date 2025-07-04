#!/bin/bash

# Example test script with integrated cleanup
# This shows how to integrate the cleanup into your existing test pipelines

echo "Starting test run..."

# Your existing test commands would go here, for example:
# npm test
# k6 run test.js
# cypress run

echo "Test run completed"

# Add cleanup and artifact management at the end
echo "Running post-test cleanup..."
/opt/featherweight/post-run-cleanup.sh

echo "All done!"
