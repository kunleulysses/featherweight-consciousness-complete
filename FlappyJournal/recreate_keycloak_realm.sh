#!/bin/bash

echo "Recreating Keycloak realm with proper configuration..."

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8082/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "Failed to authenticate to Keycloak"
    exit 1
fi

echo "Successfully authenticated to Keycloak"

# Delete the existing realm
echo "Deleting existing featherweight realm..."
curl -s -X DELETE "http://localhost:8082/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

sleep 2

# Create new realm
echo "Creating new featherweight realm..."
curl -s -X POST "http://localhost:8082/admin/realms" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "featherweight",
    "realm": "featherweight",
    "enabled": true,
    "displayName": "Featherweight",
    "displayNameHtml": "<b>Featherweight</b>",
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
    "defaultSignatureAlgorithm": "RS256",
    "revokeRefreshToken": false,
    "refreshTokenMaxReuse": 0,
    "accessTokenLifespan": 300,
    "accessTokenLifespanForImplicitFlow": 900,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 36000,
    "ssoSessionIdleTimeoutRememberMe": 0,
    "ssoSessionMaxLifespanRememberMe": 0,
    "offlineSessionIdleTimeout": 2592000,
    "offlineSessionMaxLifespanEnabled": false,
    "offlineSessionMaxLifespan": 5184000,
    "clientSessionIdleTimeout": 0,
    "clientSessionMaxLifespan": 0,
    "clientOfflineSessionIdleTimeout": 0,
    "clientOfflineSessionMaxLifespan": 0,
    "accessCodeLifespan": 60,
    "accessCodeLifespanUserAction": 300,
    "accessCodeLifespanLogin": 1800,
    "actionTokenGeneratedByAdminLifespan": 43200,
    "actionTokenGeneratedByUserLifespan": 300,
    "enabled": true,
    "internationalizationEnabled": false,
    "supportedLocales": [],
    "defaultRoles": ["offline_access", "uma_authorization"],
    "requiredCredentials": ["password"],
    "passwordPolicy": "",
    "otpPolicyType": "totp",
    "otpPolicyAlgorithm": "HmacSHA1",
    "otpPolicyInitialCounter": 0,
    "otpPolicyDigits": 6,
    "otpPolicyLookAheadWindow": 1,
    "otpPolicyPeriod": 30,
    "browserSecurityHeaders": {
      "contentSecurityPolicyReportOnly": "",
      "xContentTypeOptions": "nosniff",
      "xRobotsTag": "none",
      "xFrameOptions": "SAMEORIGIN",
      "contentSecurityPolicy": "frame-src '\''self'\''; frame-ancestors '\''self'\''; object-src '\''none'\'';",
      "xXSSProtection": "1; mode=block",
      "strictTransportSecurity": "max-age=31536000; includeSubDomains"
    },
    "smtpServer": {},
    "eventsEnabled": false,
    "eventsListeners": ["jboss-logging"],
    "enabledEventTypes": [],
    "adminEventsEnabled": false,
    "adminEventsDetailsEnabled": false,
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth",
      "_browser_header.contentSecurityPolicy": "frame-src '\''self'\''; frame-ancestors '\''self'\''; object-src '\''none'\'';",
      "permanentLockout": "false",
      "maxFailureWaitSeconds": "900",
      "minimumQuickLoginWaitSeconds": "60",
      "waitIncrementSeconds": "60",
      "quickLoginCheckMilliSeconds": "1000",
      "maxDeltaTimeSeconds": "43200",
      "failureFactor": "30"
    },
    "userManagedAccessAllowed": false
  }'

echo "Realm created"

# Create client
echo "Creating featherweight-frontend client..."
CLIENT_RESP=$(curl -s -X POST "http://localhost:8082/admin/realms/featherweight/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "featherweight-frontend",
    "name": "Featherweight Frontend",
    "description": "Frontend application for Featherweight",
    "rootUrl": "https://app.featherweight.world",
    "adminUrl": "https://app.featherweight.world",
    "baseUrl": "/",
    "surrogateAuthRequired": false,
    "enabled": true,
    "alwaysDisplayInConsole": false,
    "clientAuthenticatorType": "client-secret",
    "secret": "",
    "redirectUris": [
      "https://app.featherweight.world/*",
      "http://localhost:3000/*",
      "http://localhost:5173/*"
    ],
    "webOrigins": [
      "https://app.featherweight.world",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "notBefore": 0,
    "bearerOnly": false,
    "consentRequired": false,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": false,
    "publicClient": true,
    "frontchannelLogout": false,
    "protocol": "openid-connect",
    "attributes": {
      "saml.assertion.signature": "false",
      "saml.force.post.binding": "false",
      "saml.multivalued.roles": "false",
      "saml.encrypt": "false",
      "post.logout.redirect.uris": "https://app.featherweight.world/*##http://localhost:3000/*",
      "saml.server.signature": "false",
      "saml.server.signature.keyinfo.ext": "false",
      "exclude.session.state.from.auth.response": "false",
      "saml_force_name_id_format": "false",
      "saml.client.signature": "false",
      "tls.client.certificate.bound.access.tokens": "false",
      "saml.authnstatement": "false",
      "display.on.consent.screen": "false",
      "saml.onetimeuse.condition": "false",
      "oauth2.device.authorization.grant.enabled": "false",
      "oidc.ciba.grant.enabled": "false",
      "backchannel.logout.session.required": "true",
      "backchannel.logout.revoke.offline.tokens": "false"
    },
    "authenticationFlowBindingOverrides": {},
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
  }')

CLIENT_ID=$(echo $CLIENT_RESP | jq -r '.id')
echo "Client created with ID: $CLIENT_ID"

# Create roles
echo "Creating roles..."
curl -s -X POST "http://localhost:8082/admin/realms/featherweight/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user",
    "description": "Regular user role"
  }'

curl -s -X POST "http://localhost:8082/admin/realms/featherweight/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "description": "Administrator role"
  }'

# Create a test user
echo "Creating test users..."
curl -s -X POST "http://localhost:8082/admin/realms/featherweight/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "testpass123",
      "temporary": false
    }],
    "realmRoles": ["user", "offline_access"],
    "attributes": {}
  }'

curl -s -X POST "http://localhost:8082/admin/realms/featherweight/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@featherweight.world",
    "firstName": "Admin",
    "lastName": "User",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "admin123",
      "temporary": false
    }],
    "realmRoles": ["admin", "user", "offline_access"],
    "attributes": {}
  }'

# Update realm settings one more time to ensure everything is correct
echo "Final realm configuration..."
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
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth"
    }
  }'

echo -e "\n\n✅ Keycloak realm recreation complete!"
echo "================================================"
echo "Realm: featherweight"
echo "Client: featherweight-frontend (public client)"
echo "Test users:"
echo "  - Username: testuser, Password: testpass123"
echo "  - Username: admin, Password: admin123"
echo "================================================"

# Test the configuration
echo -e "\n\nTesting configuration..."
echo "Registration URL:"
echo "https://app.featherweight.world/auth/realms/featherweight/protocol/openid-connect/auth?client_id=featherweight-frontend&redirect_uri=https%3A%2F%2Fapp.featherweight.world%2Fjournal&response_type=code&scope=openid&kc_action=register"

