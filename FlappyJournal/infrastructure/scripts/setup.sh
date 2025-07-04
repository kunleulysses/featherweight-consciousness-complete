#!/bin/bash

# Ensure script is running with root privileges
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Update system packages
apt update && apt upgrade -y

# Install core tools
apt install -y \
  awscli \
  python3-pip \
  docker.io \
  unzip \
  curl \
  jq \
  git \
  wget

# Install Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
DOCKER_CHECK=$(which docker)
if [[ -z "$DOCKER_CHECK" ]]; then
  apt install -y --no-install-recommends \ 
    apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
  add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  apt update
  apt install -y docker-ce
fi

if [[ ! -x "$(command -v docker-compose)" ]]; then
    ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
fi

wget https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m) -O /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
aws --version
pip3 --version
docker --version
docker-compose --version
git --version

# Install Terraform
TERRAFORM_VERSION=$(curl -s https://checkpoint-api.hashicorp.com/v1/check/terraform | jq -r .current_version)
wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/local/bin/
rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

echo "Setup complete. Please verify all installations."
