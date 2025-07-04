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

echo "Creating test user..."
USER_ID=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/featherweight/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@featherweight.world",
    "firstName": "Test",
    "lastName": "User",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }]
  }' -I | grep -i location | cut -d'/' -f8 | tr -d '\r\n')

if [ -n "$USER_ID" ]; then
  echo "User created with ID: $USER_ID"
  
  echo "Assigning user role..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/featherweight/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '[{
      "name": "viewer"
    }]'
  
  echo "Test user created successfully!"
  echo "Username: testuser"
  echo "Password: password123"
else
  echo "Failed to create user"
fi
