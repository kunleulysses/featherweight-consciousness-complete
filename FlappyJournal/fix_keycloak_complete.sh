#!/bin/bash

echo "Implementing comprehensive Keycloak fix..."

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

echo "1. Updating client configuration for better compatibility..."

# Get client ID
CLIENT_ID=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/clients?clientId=featherweight-frontend" | \
  jq -r '.[0].id')

# Update client with all possible settings
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "name": "Featherweight Frontend",
    "enabled": true,
    "publicClient": true,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": false,
    "authorizationServicesEnabled": false,
    "redirectUris": [
      "https://app.featherweight.world/*",
      "http://localhost:3000/*",
      "http://localhost:5173/*"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000",
      "http://localhost:5173",
      "+"
    ],
    "notBefore": 0,
    "bearerOnly": false,
    "consentRequired": false,
    "protocol": "openid-connect",
    "attributes": {
      "post.logout.redirect.uris": "https://app.featherweight.world/*",
      "oauth2.device.authorization.grant.enabled": "false",
      "oidc.ciba.grant.enabled": "false",
      "backchannel.logout.session.required": "true",
      "backchannel.logout.revoke.offline.tokens": "false",
      "display.on.consent.screen": "false",
      "exclude.session.state.from.auth.response": "false",
      "client_credentials.use_refresh_token": "false",
      "tls.client.certificate.bound.access.tokens": "false",
      "require.pushed.authorization.requests": "false",
      "acr.loa.map": "{}",
      "use.refresh.tokens": "true",
      "id.token.as.detached.signature": "false",
      "token.response.type.bearer.lower-case": "false",
      "access.token.lifespan": "",
      "client.session.idle.timeout": "",
      "client.session.max.lifespan": "",
      "client.offline.session.idle.timeout": "",
      "client.offline.session.max.lifespan": "",
      "authorization.encrypted.response.alg": "",
      "authorization.encrypted.response.enc": "",
      "authorization.signed.response.alg": "",
      "request.object.encryption.alg": "",
      "request.object.encryption.enc": "",
      "request.object.signature.alg": "",
      "request.object.required": "",
      "pkce.code.challenge.method": ""
    },
    "alwaysDisplayInConsole": false,
    "rootUrl": "https://app.featherweight.world",
    "baseUrl": "/",
    "adminUrl": "",
    "fullScopeAllowed": true,
    "nodeReRegistrationTimeout": -1,
    "protocolMappers": [],
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
    ],
    "access": {
      "view": true,
      "configure": true,
      "manage": true
    }
  }'

echo "Client updated"

# Update realm settings
echo -e "\n2. Updating realm settings..."
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
    "sslRequired": "external",
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth",
      "acr.loa.map": "{}"
    }
  }'

echo "Realm updated"

# Check authentication flows
echo -e "\n3. Checking authentication flows..."
FLOWS=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8082/admin/realms/featherweight/authentication/flows")

REG_FLOW=$(echo $FLOWS | jq -r '.[] | select(.alias == "registration") | .id')
echo "Registration flow ID: $REG_FLOW"

# Ensure browser flow is set correctly
BROWSER_FLOW=$(echo $FLOWS | jq -r '.[] | select(.alias == "browser") | .id')
echo "Browser flow ID: $BROWSER_FLOW"

# Set the flows
curl -s -X PUT "http://localhost:8082/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"browserFlow\": \"browser\",
    \"registrationFlow\": \"registration\",
    \"directGrantFlow\": \"direct grant\",
    \"resetCredentialsFlow\": \"reset credentials\",
    \"clientAuthenticationFlow\": \"clients\",
    \"dockerAuthenticationFlow\": \"docker auth\"
  }"

echo -e "\n4. Testing configuration..."
echo "Registration URL (with proper encoding):"
echo "https://app.featherweight.world/auth/realms/featherweight/protocol/openid-connect/auth?client_id=featherweight-frontend&redirect_uri=https%3A%2F%2Fapp.featherweight.world%2Fjournal&response_type=code&scope=openid%20profile%20email&kc_action=register"

echo -e "\nLogin URL:"
echo "https://app.featherweight.world/auth/realms/featherweight/protocol/openid-connect/auth?client_id=featherweight-frontend&redirect_uri=https%3A%2F%2Fapp.featherweight.world%2Fjournal&response_type=code&scope=openid%20profile%20email"

echo -e "\n✅ Configuration complete!"

