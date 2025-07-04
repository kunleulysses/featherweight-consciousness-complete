#!/bin/bash

echo "Fixing Keycloak client configuration..."

# First, let's create the client if it doesn't exist
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin

# Delete existing client if it exists
docker exec keycloak /opt/keycloak/bin/kcadm.sh delete clients/featherweight-frontend \
  -r featherweight 2>/dev/null || true

# Create new client with correct settings
docker exec keycloak /opt/keycloak/bin/kcadm.sh create clients \
  -r featherweight \
  -s clientId=featherweight-frontend \
  -s enabled=true \
  -s publicClient=true \
  -s standardFlowEnabled=true \
  -s implicitFlowEnabled=false \
  -s directAccessGrantsEnabled=false \
  -s redirectUris='["https://app.featherweight.world/*","http://localhost:3000/*","http://localhost:4000/*"]' \
  -s webOrigins='["https://app.featherweight.world","http://localhost:3000","http://localhost:4000"]' \
  -s protocol=openid-connect \
  -s attributes='{"pkce.code.challenge.method":"S256","post.logout.redirect.uris":"https://app.featherweight.world/*##http://localhost:3000/*##http://localhost:4000/*"}'

echo "Client configuration fixed!"

# Also ensure test user exists
docker exec keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r featherweight \
  -s username=testuser \
  -s email=test@example.com \
  -s enabled=true \
  -s emailVerified=true \
  -s firstName=Test \
  -s lastName=User 2>/dev/null || true

# Set password
docker exec keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r featherweight \
  --username testuser \
  --new-password test123

echo "Test user created/updated: testuser / test123"
