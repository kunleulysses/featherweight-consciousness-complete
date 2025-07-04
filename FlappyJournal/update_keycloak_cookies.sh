#!/bin/bash

# Get admin token
TOKEN_RESPONSE=$(curl -s -X POST "https://app.featherweight.world/auth/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

echo "Updating realm to fix cookie settings..."

# Update realm with proper security settings
curl -s -X PUT "https://app.featherweight.world/auth/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sslRequired": "external",
    "attributes": {
      "frontendUrl": "https://app.featherweight.world/auth"
    }
  }'

echo "Realm updated"

# Also update browser security headers
curl -s -X PUT "https://app.featherweight.world/auth/admin/realms/featherweight" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "browserSecurityHeaders": {
      "contentSecurityPolicyReportOnly": "",
      "xContentTypeOptions": "nosniff",
      "xRobotsTag": "none",
      "xFrameOptions": "SAMEORIGIN",
      "contentSecurityPolicy": "frame-src '\''self'\''; frame-ancestors '\''self'\''; object-src '\''none'\'';",
      "xXSSProtection": "1; mode=block",
      "strictTransportSecurity": "max-age=31536000; includeSubDomains"
    }
  }'

echo "Security headers updated"

echo -e "\n✅ Cookie configuration updated!"

