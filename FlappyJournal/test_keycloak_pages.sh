#!/bin/bash

echo "Testing Keycloak pages..."

# Test if the account page exists
echo -e "\n1. Testing account page:"
curl -s -I "https://app.featherweight.world/auth/realms/featherweight/account/" | grep HTTP

# Test if the login actions exist
echo -e "\n2. Testing login actions:"
curl -s -I "https://app.featherweight.world/auth/realms/featherweight/login-actions/authenticate" | grep HTTP

# Test protocol endpoints
echo -e "\n3. Testing protocol endpoints:"
curl -s -I "https://app.featherweight.world/auth/realms/featherweight/protocol/openid-connect/auth" | grep HTTP

# Check what happens with a fake session
echo -e "\n4. Testing registration completion:"
curl -s -L "https://app.featherweight.world/auth/realms/featherweight/login-actions/registration?session_code=test&execution=test&client_id=featherweight-frontend" 2>&1 | grep -i "page not found" | head -5

