#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

echo "Copying registration flow from master realm..."

# Get the registration flow from master realm as reference
MASTER_REG_FLOW=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/master/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration" and .builtIn == true) | .id')

echo "Master registration flow ID: $MASTER_REG_FLOW"

# Get executions from master
echo -e "\n\nMaster registration flow executions:"
MASTER_EXECS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/master/authentication/flows/$MASTER_REG_FLOW/executions")

echo "$MASTER_EXECS" | jq '.[] | {displayName, providerId, requirement}'

# Delete the broken flow in featherweight
OLD_FLOW_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration") | .id')

if [ ! -z "$OLD_FLOW_ID" ]; then
  curl -s -X DELETE "http://localhost:8082/admin/realms/featherweight/authentication/flows/$OLD_FLOW_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null || echo "Could not delete old flow"
fi

# Copy the registration flow from master to featherweight
echo -e "\n\nCopying registration flow to featherweight realm..."
curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$MASTER_REG_FLOW/copy" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newName": "registration"
  }' || echo "Copy might have failed"

# If copy failed, create manually
NEW_REG_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq -r '.[] | select(.alias == "registration") | .id')

if [ -z "$NEW_REG_ID" ] || [ "$NEW_REG_ID" == "null" ]; then
  echo -e "\n\nCreating registration flow manually..."
  
  # Create the main flow
  curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "alias": "registration",
      "description": "registration flow", 
      "providerId": "basic-flow",
      "topLevel": true,
      "builtIn": false
    }'
  
  NEW_REG_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
    jq -r '.[] | select(.alias == "registration") | .id')
fi

echo -e "\n\nNew registration flow ID: $NEW_REG_ID"

# Now add the registration page form execution
if [ ! -z "$NEW_REG_ID" ] && [ "$NEW_REG_ID" != "null" ]; then
  echo "Adding registration page form..."
  
  RESP=$(curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_REG_ID/executions/execution" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "provider": "registration-page-form"
    }')
  
  echo "Response: $RESP"
  
  # Get the execution ID
  FORM_EXEC=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_REG_ID/executions" | \
    jq -r '.[] | select(.providerId == "registration-page-form") | .id')
  
  if [ ! -z "$FORM_EXEC" ] && [ "$FORM_EXEC" != "null" ]; then
    # Make it required
    curl -s -X PUT "http://localhost:8082/admin/realms/featherweight/authentication/executions/$FORM_EXEC" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "requirement": "REQUIRED"
      }'
    
    # Create the registration form subflow
    curl -s -X POST "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_REG_ID/executions/flow" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "alias": "registration form",
        "type": "form-flow",
        "description": "registration form",
        "provider": "registration-page-form"
      }'
  fi
fi

# Set as registration flow
echo -e "\n\nSetting as registration flow..."
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationFlow": "registration"
  }'

echo -e "\n\nFinal check:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows/$NEW_REG_ID/executions" | \
  jq '.[] | {displayName, providerId, requirement}'

