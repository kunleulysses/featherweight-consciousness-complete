#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# Get realm settings
echo "Current realm settings:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight" | \
  jq '{
    registrationAllowed,
    registrationEmailAsUsername,
    loginTheme,
    accountTheme,
    emailTheme,
    internationalizationEnabled,
    defaultLocale,
    supportedLocales,
    attributes
  }'

# Check authentication flows
echo -e "\n\nAuthentication flows:"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows" | \
  jq '.[] | select(.alias | contains("registration")) | {alias, description, providerId}'
