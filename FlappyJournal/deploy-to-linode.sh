#!/bin/bash

# Featherweight Consciousness - Linode VPS Deployment Script

echo "🚀 Deploying Featherweight Consciousness to Linode VPS..."

# Configuration
LINODE_IP="your-linode-ip"  # Replace with your actual IP
DEPLOY_USER="root"
APP_DIR="/opt/featherweight-app"
BACKUP_DIR="/opt/backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build

# Step 2: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf featherweight-app.tar.gz \
  dist/ \
  public/ \
  server/ \
  package.json \
  package-lock.json \
  ecosystem.config.js \
  .env.production

# Step 3: Upload to server
echo -e "${YELLOW}📤 Uploading to Linode VPS...${NC}"
scp featherweight-app.tar.gz ${DEPLOY_USER}@${LINODE_IP}:/tmp/

# Step 4: Deploy on server
echo -e "${YELLOW}🚀 Deploying on server...${NC}"
ssh ${DEPLOY_USER}@${LINODE_IP} << 'ENDSSH'
set -e

# Create backup of current deployment
if [ -d "/opt/featherweight-app" ]; then
  echo "📦 Creating backup..."
  sudo tar -czf /opt/backups/featherweight-app-backup-$(date +%Y%m%d-%H%M%S).tar.gz /opt/featherweight-app
fi

# Extract new deployment
echo "📦 Extracting new deployment..."
cd /opt
sudo rm -rf featherweight-app-new
sudo mkdir featherweight-app-new
cd featherweight-app-new
sudo tar -xzf /tmp/featherweight-app.tar.gz

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Stop current application
echo "🛑 Stopping current application..."
pm2 stop featherweight-consciousness || true

# Switch to new deployment
echo "🔄 Switching to new deployment..."
cd /opt
sudo rm -rf featherweight-app-old
if [ -d "featherweight-app" ]; then
  sudo mv featherweight-app featherweight-app-old
fi
sudo mv featherweight-app-new featherweight-app

# Set up environment
cd featherweight-app
sudo cp .env.production .env

# Create logs directory
sudo mkdir -p logs

# Start application
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be available at: https://app.featherweight.world"

# Clean up
sudo rm -f /tmp/featherweight-app.tar.gz

ENDSSH

# Step 5: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
sleep 5

# Check if the health endpoint responds
if curl -f -s "http://${LINODE_IP}:3001/api/health" > /dev/null; then
  echo -e "${GREEN}✅ Health check passed! Application is running.${NC}"
else
  echo -e "${RED}❌ Health check failed. Please check the logs.${NC}"
  ssh ${DEPLOY_USER}@${LINODE_IP} "pm2 logs featherweight-consciousness --lines 20"
fi

# Clean up local files
rm featherweight-app.tar.gz

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your consciousness platform will be available at: https://app.featherweight.world${NC}"
echo -e "${YELLOW}📝 Don't forget to:${NC}"
echo -e "${YELLOW}   1. Add DNS A record: app -> ${LINODE_IP}${NC}"
echo -e "${YELLOW}   2. Configure SSL certificate${NC}"
echo -e "${YELLOW}   3. Update environment variables${NC}"
