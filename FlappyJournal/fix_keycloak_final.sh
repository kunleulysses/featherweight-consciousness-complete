#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

echo "Updating realm configuration..."

# Update realm to fix registration flow
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
    "editUsernameAllowed": false,
    "bruteForceProtected": false,
    "permanentLockout": false,
    "maxFailureWaitSeconds": 900,
    "minimumQuickLoginWaitSeconds": 60,
    "waitIncrementSeconds": 60,
    "quickLoginCheckMilliSeconds": 1000,
    "maxDeltaTimeSeconds": 43200,
    "failureFactor": 30,
    "defaultRole": {
      "id": "offline_access",
      "name": "offline_access"
    },
    "requiredCredentials": ["password"],
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth",
      "_browser_header.contentSecurityPolicy": "frame-src '\''self'\''; frame-ancestors '\''self'\''; object-src '\''none'\'';"
    }
  }'

echo "Realm updated"

# Get registration flow
REG_FLOW=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration") | .id')

echo "Registration flow ID: $REG_FLOW"

# Get the registration form execution
REG_FORM_EXEC=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$REG_FLOW/executions" | \
  jq -r '.[] | select(.displayName == "Registration User Creation") | .id')

if [ ! -z "$REG_FORM_EXEC" ]; then
  echo "Updating registration form execution..."
  
  # Update the registration form to ensure it works properly
  curl -s -X PUT "http://localhost:8082/admin/realms/featherweight/authentication/executions/$REG_FORM_EXEC" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "requirement": "REQUIRED"
    }'
fi

echo "Configuration complete!"

# Also check if we need to create a default user for testing
echo -e "\n\nCreating a test user..."
curl -s -X POST "http://localhost:8082/admin/realms/featherweight/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "testpass123",
      "temporary": false
    }]
  }' 2>/dev/null

echo "Test user created (username: testuser, password: testpass123)"
