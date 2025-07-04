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

echo "Getting client info..."
CLIENT_INFO=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$KEYCLOAK_URL/admin/realms/featherweight/clients?clientId=featherweight-frontend")

CLIENT_ID=$(echo "$CLIENT_INFO" | jq -r '.[0].id')

echo "Updating client redirects..."
curl -s -X PUT "$KEYCLOAK_URL/admin/realms/featherweight/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$CLIENT_ID'",
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
    ],
    "attributes": {
      "post.logout.redirect.uris": "https://app.featherweight.world/+##http://localhost:3000/+"
    }
  }'

echo "Updated!"
