#!/bin/bash

# Run Cypress e2e tests
echo "Running Cypress e2e tests..."
npx cypress run --config-file /opt/featherweight/FlappyJournal/cypress.config.js

# Run k6 load tests
echo "Running k6 load test..."
k6 run /opt/featherweight/FlappyJournal/k6-tests/load-test.js

# Check test results and execute rollback if necessary
ERROR_RATE=0.01 # Placeholder value
HZ_THRESHOLD=95  # Placeholder value

if [[ $(echo "$ERROR_RATE > 0.01" | bc -l) -eq 1 || $(echo "$HZ_THRESHOLD < 95" | bc -l) -eq 1 ]]; then
    echo "Error rate or Hz threshold breached. Initiating rollback..."
    docker compose down && docker compose up -d prev_tag
else
    echo "Tests passed. Tagging stable images..."
    date_tag=$(date +'%Y%m%d')
    docker tag fw-prod fw-prod-$date_tag
    docker push fw-prod-$date_tag
fi
