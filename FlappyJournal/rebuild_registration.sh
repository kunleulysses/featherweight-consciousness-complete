#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# Get current realm configuration
REALM_CONFIG=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight")

# Use the built-in registration flow
echo "Setting realm to use built-in registration flow..."
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(echo $REALM_CONFIG | jq '. + {
    "registrationFlow": "registration",
    "registrationAllowed": true,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "verifyEmail": false,
    "resetPasswordAllowed": true
  }')"

echo "Realm updated"

# Let's check what flows are available
echo -e "\n\nAvailable flows:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq '.[] | {alias, description, builtIn, topLevel}'

# Get the registration flow ID (should be built-in)
REG_FLOW_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration" and .builtIn == true) | .id')

if [ -z "$REG_FLOW_ID" ]; then
  REG_FLOW_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
    jq -r '.[] | select(.alias == "registration") | .id')
fi

echo -e "\n\nRegistration flow ID: $REG_FLOW_ID"

# Add the registration page form if missing
echo -e "\n\nAdding registration components..."
curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$REG_FLOW_ID/executions/execution" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "registration-page-form"
  }' 2>/dev/null || echo "Registration page form might already exist"

# Get current executions
echo -e "\n\nCurrent registration flow executions:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$REG_FLOW_ID/executions" | \
  jq '.[] | {displayName, requirement, providerId}'

