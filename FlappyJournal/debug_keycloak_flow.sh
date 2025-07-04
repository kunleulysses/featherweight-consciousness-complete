#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# Get registration flow details
REG_FLOW=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration") | .id')

echo "Registration flow executions:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$REG_FLOW/executions" | \
  jq '.[] | {displayName, requirement, configurable, providerId}'

# Check if there's a terms and conditions or other page configured
echo -e "\n\nChecking for problematic executions..."
EXECUTIONS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$REG_FLOW/executions")

# Look for any execution that might be causing issues
echo "$EXECUTIONS" | jq '.[] | select(.displayName | contains("Terms") or contains("Recaptcha") or contains("Page"))'

# Get the actual registration form action
echo -e "\n\nGetting registration form configuration..."
REG_FORM=$(echo "$EXECUTIONS" | jq -r '.[] | select(.displayName == "Registration User Creation") | .id')

if [ ! -z "$REG_FORM" ]; then
  CONFIG=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "http://localhost:8082/admin/realms/featherweight/authentication/config/$REG_FORM" 2>/dev/null)
  echo "Registration form config: $CONFIG"
fi

# Also check required actions
echo -e "\n\nRequired actions:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/required-actions" | \
  jq '.[] | {alias, name, enabled, defaultAction}'

