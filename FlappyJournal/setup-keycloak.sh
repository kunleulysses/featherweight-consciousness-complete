#!/bin/bash

KEYCLOAK_URL="http://localhost:8082"
ADMIN_USER="admin"
ADMIN_PASS="admin123"

echo "Getting admin token..."
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$TOKEN" == "null" ]; then
  echo "Failed to get admin token"
  exit 1
fi

echo "Creating featherweight realm..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "featherweight",
    "enabled": true,
    "displayName": "Featherweight Journal",
    "registrationAllowed": true,
    "registrationEmailAsUsername": true,
    "rememberMe": true,
    "verifyEmail": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false,
    "sslRequired": "external"
  }'

echo "Creating roles..."
for role in admin researcher collaborator viewer; do
  echo "Creating role: $role"
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/featherweight/roles" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$role\", \"description\": \"$role role\"}"
done

echo "Creating client..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/featherweight/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "name": "Featherweight Frontend",
    "description": "Frontend client for Featherweight app",
    "enabled": true,
    "publicClient": true,
    "protocol": "openid-connect",
    "redirectUris": [
      "https://app.featherweight.world/auth/callback",
      "http://localhost:3000/auth/callback"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000"
    ],
    "postLogoutRedirectUris": [
      "https://app.featherweight.world/",
      "http://localhost:3000/"
    ],
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": false,
    "serviceAccountsEnabled": false,
    "authorizationServicesEnabled": false,
    "frontchannelLogout": true,
    "attributes": {
      "access.token.lifespan": "1800"
    }
  }'

echo "Setup complete!"
