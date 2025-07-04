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

echo "Updating realm frontend URL..."
curl -s -X PUT "$KEYCLOAK_URL/admin/realms/featherweight" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "featherweight",
    "enabled": true,
    "attributes": {
      "frontendUrl": "https://app.featherweight.world"
    }
  }'

echo "Updated!"
