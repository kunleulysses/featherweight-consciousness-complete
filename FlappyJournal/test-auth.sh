#!/bin/bash

echo "Testing Keycloak authentication flow..."

# Test if we can reach Keycloak
echo "1. Testing Keycloak connectivity:"
curl -s -o /dev/null -w "%{http_code}" https://app.featherweight.world/realms/featherweight/.well-known/openid-configuration

echo -e "\n\n2. Testing direct authentication:"
curl -X POST https://app.featherweight.world/realms/featherweight/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=featherweight-frontend" \
  -d "username=test@example.com" \
  -d "password=test123" \
  -d "grant_type=password" \
  -v 2>&1 | grep -E "(HTTP|error|Error)"

echo -e "\n\n3. Checking client configuration:"
curl -s https://app.featherweight.world/realms/featherweight/.well-known/openid-configuration | jq '.authorization_endpoint'
