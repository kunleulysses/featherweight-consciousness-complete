#!/bin/bash

# Get admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8082/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Update the frontend client to include all necessary redirect URIs
curl -X PUT http://localhost:8082/admin/realms/featherweight/clients/featherweight-frontend \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "enabled": true,
    "publicClient": true,
    "redirectUris": [
      "https://app.featherweight.world/*",
      "http://localhost:3000/*",
      "http://localhost:4000/*"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000",
      "http://localhost:4000"
    ],
    "protocol": "openid-connect",
    "attributes": {
      "pkce.code.challenge.method": "S256"
    }
  }'

echo "Keycloak client updated"
