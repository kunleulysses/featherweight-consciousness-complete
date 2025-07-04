#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# Get the current client configuration
CLIENT_CONFIG=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/clients?clientId=featherweight-frontend")

CLIENT_UUID=$(echo $CLIENT_CONFIG | jq -r '.[0].id')
CLIENT_FULL=$(echo $CLIENT_CONFIG | jq -r '.[0]')

echo "Current client configuration:"
echo $CLIENT_FULL | jq '{clientId, redirectUris, webOrigins, baseUrl, rootUrl}'

# Update the client to handle all redirect scenarios
echo -e "\n\nUpdating client configuration..."

curl -s -X PUT "http://localhost:8082/admin/realms/featherweight/clients/${CLIENT_UUID}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "enabled": true,
    "publicClient": true,
    "redirectUris": [
      "https://app.featherweight.world/*",
      "https://app.featherweight.world/journal",
      "https://app.featherweight.world/journal/*",
      "https://app.featherweight.world/",
      "https://app.featherweight.world",
      "https://app.featherweight.world/auth/callback",
      "https://app.featherweight.world/auth/realms/featherweight/*",
      "http://localhost:3000/*",
      "http://localhost:5173/*"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000",
      "http://localhost:5173",
      "+"
    ],
    "rootUrl": "https://app.featherweight.world",
    "baseUrl": "/",
    "attributes": {
      "post.logout.redirect.uris": "https://app.featherweight.world/*##https://app.featherweight.world/##https://app.featherweight.world",
      "pkce.code.challenge.method": "S256"
    },
    "directAccessGrantsEnabled": true,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "frontchannelLogout": true,
    "protocol": "openid-connect",
    "fullScopeAllowed": true,
    "nodeReRegistrationTimeout": -1,
    "defaultClientScopes": [
      "web-origins",
      "profile",
      "roles",
      "email"
    ],
    "optionalClientScopes": [
      "address",
      "phone",
      "offline_access",
      "microprofile-jwt"
    ]
  }'

echo "Client updated"

# Update authentication flow bindings
echo -e "\n\nUpdating authentication flow bindings..."

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
    "sslRequired": "external",
    "eventsEnabled": true,
    "eventsExpiration": 900,
    "enabledEventTypes": [
      "SEND_RESET_PASSWORD",
      "UPDATE_CONSENT_ERROR",
      "LOGIN",
      "CLIENT_INITIATED_ACCOUNT_LINKING",
      "LOGOUT",
      "REGISTER",
      "DELETE_ACCOUNT_ERROR",
      "IDENTITY_PROVIDER_RETRIEVE_TOKEN",
      "IDENTITY_PROVIDER_LINK_ACCOUNT",
      "UPDATE_PASSWORD_ERROR",
      "LOGIN_ERROR",
      "IDENTITY_PROVIDER_FIRST_LOGIN",
      "REGISTER_ERROR",
      "LOGOUT_ERROR",
      "UPDATE_PASSWORD",
      "CLIENT_LOGIN",
      "IDENTITY_PROVIDER_POST_LOGIN",
      "UPDATE_PROFILE_ERROR",
      "CLIENT_REGISTER",
      "IDENTITY_PROVIDER_LINK_ACCOUNT_ERROR",
      "UPDATE_PROFILE",
      "CLIENT_DELETE",
      "SEND_RESET_PASSWORD_ERROR",
      "CLIENT_LOGIN_ERROR",
      "REMOVE_TOTP_ERROR",
      "VERIFY_EMAIL_ERROR",
      "SEND_VERIFY_EMAIL",
      "EXECUTE_ACTION_TOKEN_ERROR",
      "SEND_VERIFY_EMAIL_ERROR",
      "EXECUTE_ACTIONS",
      "IDENTITY_PROVIDER_RETRIEVE_TOKEN_ERROR",
      "IDENTITY_PROVIDER_POST_LOGIN_ERROR",
      "UPDATE_TOTP_ERROR",
      "CODE_TO_TOKEN_ERROR",
      "VERIFY_EMAIL",
      "EXECUTE_ACTION_TOKEN",
      "IDENTITY_PROVIDER_FIRST_LOGIN_ERROR",
      "UPDATE_CONSENT",
      "DELETE_ACCOUNT",
      "UPDATE_TOTP",
      "REGISTER_NODE_ERROR",
      "UNREGISTER_NODE_ERROR",
      "REGISTER_NODE",
      "IDENTITY_PROVIDER_LOGIN_ERROR",
      "REMOVE_TOTP",
      "IDENTITY_PROVIDER_LOGIN",
      "UNREGISTER_NODE",
      "CODE_TO_TOKEN",
      "EXECUTE_ACTIONS_ERROR"
    ],
    "adminEventsEnabled": true,
    "adminEventsDetailsEnabled": true,
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth",
      "_browser_header.contentSecurityPolicy": "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"
    }
  }'

echo "Realm updated"

# Check authentication flows
echo -e "\n\nChecking flows..."
FLOWS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows")

echo $FLOWS | jq '.[] | select(.alias | contains("registration")) | {alias, description, providerId, topLevel}'

echo -e "\n\nConfiguration complete!"
