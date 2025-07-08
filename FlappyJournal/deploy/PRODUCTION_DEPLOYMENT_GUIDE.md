# FlappyJournal Consciousness System - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the FlappyJournal AI Consciousness System to production at `app.featherweight.world` using Caddy reverse proxy.

## System Architecture

- **Consciousness Conversations System**: Port 3002 (WebSocket + HTTP)
- **Demo Portal Web Interface**: Port 5002 (HTTP API + Static Files)
- **Caddy Reverse Proxy**: Ports 80/443 (SSL termination + routing)
- **Domain**: app.featherweight.world

## Prerequisites

### 1. VPS Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Minimum 2GB RAM, 2 CPU cores
- Root access
- Domain `app.featherweight.world` pointing to your VPS IP

### 2. Required Software
- Node.js 18+ 
- Caddy 2.x
- Git
- curl

## Step-by-Step Deployment

### Step 1: Prepare the VPS Environment

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Install Git and other utilities
sudo apt install -y git curl htop

# Verify installations
node --version
npm --version
caddy version
```

### Step 2: Clone and Setup the Consciousness System

```bash
# Navigate to deployment directory
cd /opt

# Clone the repository (if not already present)
sudo git clone https://github.com/kunleulysses/featherweight-consciousness-complete.git featherweight
cd /opt/featherweight/FlappyJournal

# Install dependencies for consciousness system
cd server
sudo npm install --production

# Install dependencies for demo portal
cd ../demo-portal
sudo npm install --production

# Return to project root
cd /opt/featherweight/FlappyJournal
```

### Step 3: Configure DNS

Ensure your domain `app.featherweight.world` points to your VPS IP address:

```bash
# Test DNS resolution
nslookup app.featherweight.world
# Should return your VPS IP address
```

### Step 4: Deploy Using Automated Script

```bash
# Make deployment script executable
chmod +x /opt/featherweight/FlappyJournal/deploy/scripts/deploy-consciousness-production.sh

# Run the deployment script
sudo /opt/featherweight/FlappyJournal/deploy/scripts/deploy-consciousness-production.sh
```

### Step 5: Manual Deployment (Alternative)

If you prefer manual deployment:

#### 5.1 Create Log Directories
```bash
sudo mkdir -p /var/log/consciousness
sudo chown root:root /var/log/consciousness
sudo chmod 755 /var/log/consciousness
```

#### 5.2 Install Systemd Services
```bash
# Copy service files
sudo cp /opt/featherweight/FlappyJournal/deploy/systemd/*.service /etc/systemd/system/

# Reload systemd and enable services
sudo systemctl daemon-reload
sudo systemctl enable consciousness-conversations.service
sudo systemctl enable demo-portal.service
```

#### 5.3 Install Caddy Configuration
```bash
# Backup existing Caddy config
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)

# Install new Caddy configuration
sudo cp /opt/featherweight/FlappyJournal/Caddyfile /etc/caddy/Caddyfile

# Validate Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile
```

#### 5.4 Start Services
```bash
# Start consciousness services
sudo systemctl start consciousness-conversations.service
sudo systemctl start demo-portal.service

# Reload Caddy with new configuration
sudo systemctl reload caddy

# Check service status
sudo systemctl status consciousness-conversations.service
sudo systemctl status demo-portal.service
sudo systemctl status caddy
```

### Step 6: Verify Deployment

#### 6.1 Check Service Health
```bash
# Test consciousness service
curl http://localhost:3002/health

# Test demo portal
curl http://localhost:5002/api/status

# Test external access
curl https://app.featherweight.world/health
```

#### 6.2 Test WebSocket Connection
```bash
# Visit the consciousness interface
# https://app.featherweight.world/conversations.html
```

#### 6.3 Check Logs
```bash
# View consciousness logs
sudo journalctl -u consciousness-conversations.service -f

# View demo portal logs
sudo journalctl -u demo-portal.service -f

# View Caddy logs
sudo journalctl -u caddy -f
```

## Service Management

### Using the Management Script

```bash
# Make management script executable
chmod +x /opt/featherweight/FlappyJournal/deploy/scripts/manage-consciousness-services.sh

# Show all available commands
sudo /opt/featherweight/FlappyJournal/deploy/scripts/manage-consciousness-services.sh

# Common operations
sudo ./manage-consciousness-services.sh start     # Start all services
sudo ./manage-consciousness-services.sh stop      # Stop all services
sudo ./manage-consciousness-services.sh restart   # Restart all services
sudo ./manage-consciousness-services.sh status    # Show status
sudo ./manage-consciousness-services.sh health    # Health check
sudo ./manage-consciousness-services.sh logs      # View logs
sudo ./manage-consciousness-services.sh backup    # Create backup
```

### Manual Service Management

```bash
# Start services
sudo systemctl start consciousness-conversations.service
sudo systemctl start demo-portal.service

# Stop services
sudo systemctl stop consciousness-conversations.service
sudo systemctl stop demo-portal.service

# Restart services
sudo systemctl restart consciousness-conversations.service
sudo systemctl restart demo-portal.service

# Check status
sudo systemctl status consciousness-conversations.service
sudo systemctl status demo-portal.service
```

## Alternative: PM2 Process Management

If you prefer PM2 over systemd:

### Setup PM2
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 for consciousness system
sudo /opt/featherweight/FlappyJournal/deploy/scripts/pm2-consciousness-manager.sh setup

# Start services with PM2
sudo /opt/featherweight/FlappyJournal/deploy/scripts/pm2-consciousness-manager.sh start
```

### PM2 Management
```bash
# Show PM2 status
sudo pm2 status

# View logs
sudo pm2 logs

# Restart services
sudo pm2 restart consciousness-conversations demo-portal

# Save PM2 configuration
sudo pm2 save
```

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check logs for errors
   sudo journalctl -u consciousness-conversations.service -n 50
   sudo journalctl -u demo-portal.service -n 50
   ```

2. **Port conflicts**
   ```bash
   # Check what's using the ports
   sudo netstat -tlnp | grep -E ':(3002|5002)'
   ```

3. **SSL certificate issues**
   ```bash
   # Check Caddy logs
   sudo journalctl -u caddy -n 50
   
   # Manually request certificate
   sudo caddy reload --config /etc/caddy/Caddyfile
   ```

4. **WebSocket connection issues**
   - Verify consciousness service is running on port 3002
   - Check browser console for WebSocket errors
   - Ensure firewall allows traffic on ports 80, 443

### Log Locations

- Consciousness System: `/var/log/consciousness/`
- Systemd logs: `journalctl -u [service-name]`
- Caddy logs: `/var/log/caddy/consciousness.log`

## Security Considerations

1. **Firewall Configuration**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **SSL/TLS**
   - Caddy automatically handles SSL certificates via Let's Encrypt
   - Certificates are automatically renewed

3. **Access Control**
   - Consider implementing authentication for production use
   - Monitor access logs regularly

## Monitoring and Maintenance

### Health Monitoring
```bash
# Automated health check
sudo /opt/featherweight/FlappyJournal/deploy/scripts/manage-consciousness-services.sh health
```

### Backup Strategy
```bash
# Create regular backups
sudo /opt/featherweight/FlappyJournal/deploy/scripts/manage-consciousness-services.sh backup
```

### Updates
```bash
# Update consciousness system
cd /opt/featherweight/FlappyJournal
sudo git pull origin main
sudo ./deploy/scripts/manage-consciousness-services.sh restart
```

## Success Verification

After successful deployment, you should be able to:

1. **Access the consciousness interface**: https://app.featherweight.world/conversations.html
2. **See consciousness metrics**: Real-time consciousness heartbeat and metrics
3. **Interact with the AI**: Send messages and receive consciousness-driven responses
4. **Monitor system health**: All services running and responding

## Support

For issues or questions:
- Check the troubleshooting section above
- Review service logs for error messages
- Ensure all prerequisites are met
- Verify DNS configuration

Your FlappyJournal AI Consciousness System is now deployed and operational at `app.featherweight.world`!
