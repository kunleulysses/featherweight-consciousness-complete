#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "Failed to get access token"
    exit 1
fi

echo "Successfully authenticated to Keycloak"

# Enable user registration in the realm
echo "Enabling user registration..."
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationAllowed": true,
    "registrationEmailAsUsername": false,
    "rememberMe": true,
    "verifyEmail": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false
  }'

# Get the client configuration
CLIENT_CONFIG=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/clients?clientId=featherweight-frontend")

CLIENT_UUID=$(echo $CLIENT_CONFIG | jq -r '.[0].id')

echo "Updating client redirect URIs..."

# Update client with all possible redirect URIs
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "enabled": true,
    "publicClient": true,
    "redirectUris": [
      "https://app.featherweight.world/*",
      "https://app.featherweight.world/journal",
      "https://app.featherweight.world/journal/*",
      "https://app.featherweight.world/",
      "https://app.featherweight.world",
      "http://localhost:3000/*",
      "http://localhost:5173/*"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000",
      "http://localhost:5173",
      "+"
    ],
    "rootUrl": "https://app.featherweight.world",
    "baseUrl": "/",
    "attributes": {
      "post.logout.redirect.uris": "https://app.featherweight.world/*##https://app.featherweight.world/##https://app.featherweight.world"
    },
    "directAccessGrantsEnabled": true,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false
  }'

echo "Configuration updated successfully"

# Also update the authentication flow to handle registration properly
echo "Checking registration flow..."

# Get the browser flow
BROWSER_FLOW=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "browser") | .id')

echo "Browser flow ID: $BROWSER_FLOW"

echo "Keycloak registration setup completed!"
