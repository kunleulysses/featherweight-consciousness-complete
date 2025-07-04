# 🚀 Featherweight Consciousness - Linode VPS Deployment Guide

## Architecture Overview
- **featherweight.world** - Main marketing site (current)
- **app.featherweight.world** - Interactive consciousness platform
- **api.featherweight.world** - Consciousness API endpoints

## Deployment Steps

### 1. Prepare the Application
```bash
# On your development machine
cd /opt/featherweight/FlappyJournal

# Create production build
npm run build

# Create deployment package
tar -czf featherweight-app.tar.gz dist/ public/ server/ package.json .env.production
```

### 2. Transfer to Linode VPS
```bash
# Upload to your Linode server
scp featherweight-app.tar.gz root@your-linode-ip:/opt/

# SSH into your Linode
ssh root@your-linode-ip

# Extract and set up
cd /opt
tar -xzf featherweight-app.tar.gz
mv FlappyJournal featherweight-app
cd featherweight-app
```

### 3. Install Dependencies
```bash
# Install Node.js 18+ if not already installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install app dependencies
npm ci --production
```

### 4. Configure Environment
```bash
# Copy and configure environment
cp .env.production .env
nano .env  # Edit with your production values
```

### 5. Set Up Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: 'featherweight-consciousness',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
}
EOL

# Start the application
mkdir logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration for app subdomain
cat > /etc/nginx/sites-available/app.featherweight.world << 'EOL'
server {
    listen 80;
    server_name app.featherweight.world;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Enable the site
ln -s /etc/nginx/sites-available/app.featherweight.world /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. Set Up SSL Certificate
```bash
# Install Certbot if not already installed
apt install certbot python3-certbot-nginx

# Get SSL certificate for app subdomain
certbot --nginx -d app.featherweight.world

# Verify auto-renewal
certbot renew --dry-run
```

### 8. Configure DNS
Add A record in your domain DNS:
- **Name**: `app`
- **Type**: `A` 
- **Value**: `your-linode-ip`
- **TTL**: `300`
