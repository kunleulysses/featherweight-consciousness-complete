#!/bin/bash

# Keycloak configuration
KEYCLOAK_URL="http://localhost:8082"
REALM="featherweight"
CLIENT_ID="featherweight-frontend"

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

# Check if we got a token
if echo "$TOKEN_RESPONSE" | grep -q "error"; then
    echo "Failed to authenticate. Trying with environment password..."
    # Try with a different password
    TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin" \
      -d "password=featherweight123" \
      -d "grant_type=password" \
      -d "client_id=admin-cli")
fi

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "Failed to get access token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "Successfully authenticated to Keycloak"

# Get current client configuration
CLIENT_CONFIG=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=${CLIENT_ID}")

CLIENT_UUID=$(echo $CLIENT_CONFIG | jq -r '.[0].id')

if [ "$CLIENT_UUID" == "null" ] || [ -z "$CLIENT_UUID" ]; then
    echo "Client ${CLIENT_ID} not found in realm ${REALM}"
    exit 1
fi

echo "Found client: $CLIENT_UUID"

# Update client with proper redirect URIs
curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "enabled": true,
    "publicClient": true,
    "redirectUris": [
      "https://app.featherweight.world/*",
      "https://app.featherweight.world/journal",
      "https://app.featherweight.world/",
      "http://localhost:3000/*"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000"
    ],
    "rootUrl": "https://app.featherweight.world",
    "baseUrl": "/",
    "attributes": {
      "post.logout.redirect.uris": "https://app.featherweight.world/*"
    }
  }'

echo "Client redirect URIs updated successfully"

# Also update the account console theme to redirect properly
curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth"
    }
  }'

echo "Realm frontend URL updated"
