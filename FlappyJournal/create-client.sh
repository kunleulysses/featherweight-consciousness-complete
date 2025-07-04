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

echo "Creating client..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/featherweight/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "name": "Featherweight Frontend",
    "enabled": true,
    "publicClient": true,
    "standardFlowEnabled": true,
    "redirectUris": [
      "https://app.featherweight.world/auth/callback",
      "http://localhost:3000/auth/callback"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000"
    ]
  }'

echo "Done!"
