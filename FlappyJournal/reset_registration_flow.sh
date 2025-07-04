#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

echo "Resetting registration flow to default..."

# First, let's copy the registration flow to ensure it has all required steps
REG_FLOW_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration") | .id')

# Delete the existing registration flow
curl -s -X DELETE "http://localhost:8082/admin/realms/featherweight/authentication/flows/$REG_FLOW_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo "Deleted old registration flow"

# Create a new registration flow
NEW_FLOW=$(curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "registration",
    "description": "Registration flow",
    "providerId": "basic-flow",
    "topLevel": true,
    "builtIn": false
  }')

NEW_FLOW_ID=$(echo $NEW_FLOW | jq -r '.id' 2>/dev/null)

if [ -z "$NEW_FLOW_ID" ] || [ "$NEW_FLOW_ID" == "null" ]; then
  # If creation failed, use the existing one
  NEW_FLOW_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
    jq -r '.[] | select(.alias == "registration") | .id')
fi

echo "New flow ID: $NEW_FLOW_ID"

# Add registration form
curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_FLOW_ID/executions/execution" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "registration-page-form"
  }'

# Get the form execution
FORM_EXEC=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_FLOW_ID/executions" | \
  jq -r '.[] | select(.displayName == "Registration Form") | .id')

echo "Form execution: $FORM_EXEC"

# Create a subflow for the form
if [ ! -z "$FORM_EXEC" ]; then
  SUB_FLOW=$(curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_FLOW_ID/executions/flow" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "alias": "registration form",
      "type": "form-flow",
      "description": "Registration form",
      "provider": "registration-page-form"
    }')
  
  SUB_FLOW_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
    jq -r '.[] | select(.alias == "registration form") | .id')
  
  # Add user creation
  curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$SUB_FLOW_ID/executions/execution" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "provider": "registration-user-creation"
    }'
  
  # Add password validation
  curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$SUB_FLOW_ID/executions/execution" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "provider": "registration-password-action"
    }'
fi

# Bind the flow
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_FLOW_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "registration",
    "description": "Registration flow",
    "providerId": "basic-flow",
    "topLevel": true,
    "builtIn": false
  }'

# Set it as the registration flow
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationFlow": "registration"
  }'

echo -e "\n\nRegistration flow reset complete!"

# Verify the flow
echo -e "\n\nVerifying registration flow:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_FLOW_ID/executions" | \
  jq '.[] | {displayName, requirement, providerId}'

