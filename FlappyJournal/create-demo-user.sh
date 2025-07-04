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

echo "Creating demo user..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/featherweight/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo@featherweight.world",
    "email": "demo@featherweight.world",
    "firstName": "Demo",
    "lastName": "User",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "demo123",
      "temporary": false
    }],
    "realmRoles": ["viewer"]
  }'

echo "Demo user created!"
echo "Email: demo@featherweight.world"
echo "Password: demo123"
