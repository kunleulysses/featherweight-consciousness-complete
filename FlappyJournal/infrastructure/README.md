# FlappyJournal Infrastructure

This directory contains the Infrastructure as Code (IaC) configurations for deploying FlappyJournal using Terraform and Ansible.

## Architecture Overview

The infrastructure is designed with the following principles:
- **Security First**: All resources follow security best practices
- **High Availability**: Multi-AZ deployment with auto-scaling
- **Monitoring**: Comprehensive logging and monitoring
- **WebSocket Support**: Optimized for real-time streaming loops
- **Environment Parity**: Staging mirrors production networking

## Directory Structure

```
infrastructure/
├── terraform/
│   ├── modules/
│   │   └── app-infrastructure/    # Reusable Terraform module
│   └── environments/
│       ├── staging/               # Staging environment config
│       └── production/            # Production environment config
├── ansible/
│   ├── deploy.yml                 # Main deployment playbook
│   └── inventory/                 # Environment-specific inventories
└── docs/                          # Additional documentation
```

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Terraform** >= 1.6
3. **Ansible** >= 4.0 with AWS collections
4. **Docker** for local testing
5. **GitHub CLI** for secrets management

### Required AWS Permissions

The deployment user/role needs the following AWS managed policies:
- `AmazonECS_FullAccess`
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonVPCFullAccess`
- `IAMFullAccess`
- `SecretsManagerReadWrite`
- `CloudWatchFullAccess`

## Setup Instructions

### 1. Initial Setup

```bash
# Clone and navigate to the project
cd /path/to/FlappyJournal

# Install required tools
./infrastructure/scripts/setup.sh

# Set up AWS credentials
aws configure
```

### 2. Environment Configuration

#### Staging Environment

```bash
cd infrastructure/terraform/environments/staging

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -var="image_tag=latest"

# Apply the configuration
terraform apply
```

#### Production Environment

```bash
cd infrastructure/terraform/environments/production

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -var="image_tag=v1.0.0"

# Apply the configuration (requires approval)
terraform apply
```

### 3. Secrets Management

Store sensitive values in AWS Secrets Manager:

```bash
# Database URL
aws secretsmanager create-secret \
  --name flappyjournal-staging-database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# JWT Secret
aws secretsmanager create-secret \
  --name flappyjournal-staging-jwt-secret \
  --secret-string "your-jwt-secret-here"

# OpenAI API Key
aws secretsmanager create-secret \
  --name flappyjournal-staging-openai-api-key \
  --secret-string "your-openai-api-key"
```

## Deployment

### Automated Deployment (CI/CD)

The GitHub Actions workflow automatically:
1. Runs security scans and tests
2. Builds and pushes Docker images
3. Generates SBOM
4. Deploys to staging (on develop branch)
5. Deploys to production (on main branch)

### Manual Deployment

```bash
# Deploy to staging
ansible-playbook infrastructure/ansible/deploy.yml \
  -i infrastructure/ansible/inventory/staging.yml \
  --extra-vars "image_tag=latest"

# Deploy to production
ansible-playbook infrastructure/ansible/deploy.yml \
  -i infrastructure/ansible/inventory/production.yml \
  --extra-vars "image_tag=v1.0.0"
```

## Networking Configuration

### WebSocket Support

The infrastructure includes specific configurations for WebSocket support:

- **Load Balancer**: Configured for sticky sessions and WebSocket upgrade headers
- **Security Groups**: Allow traffic on both HTTP (5000) and WebSocket (8080) ports
- **Health Checks**: Separate health checks for HTTP and WebSocket endpoints

### Staging Environment

- **VPC CIDR**: 10.1.0.0/16
- **Public Subnets**: 10.1.1.0/24, 10.1.2.0/24
- **Private Subnets**: 10.1.10.0/24, 10.1.20.0/24
- **Resources**: 1 ECS task, minimal auto-scaling

### Production Environment

- **VPC CIDR**: 10.0.0.0/16
- **Public Subnets**: 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24
- **Private Subnets**: 10.0.10.0/24, 10.0.20.0/24, 10.0.30.0/24
- **Resources**: 3 ECS tasks, aggressive auto-scaling

## Monitoring and Logging

### CloudWatch Logs

- Application logs: `/ecs/flappyjournal-{environment}`
- Retention: 7 days (staging), 30 days (production)

### Metrics and Alarms

- CPU utilization monitoring
- Memory utilization monitoring
- Request count and latency
- WebSocket connection count

### Health Checks

- **HTTP**: `GET /api/health` on port 5000
- **WebSocket**: `GET /ws/health` on port 8080

## Security Features

### Container Security

- Multi-stage Docker builds
- Non-root user execution
- Security scanning with Trivy and Grype
- Regular base image updates

### Infrastructure Security

- VPC with private subnets for ECS tasks
- Security groups with minimal required access
- Secrets stored in AWS Secrets Manager
- IAM roles with least privilege

### CI/CD Security

- Secrets scanning with TruffleHog and GitLeaks
- SAST with CodeQL and Semgrep
- Container vulnerability scanning
- SBOM generation
- License compliance checking

## Backup and Disaster Recovery

### Production Backups

- ECS service configurations backed up daily
- Secrets Manager automatic backups
- Terraform state stored in S3 with versioning

### Recovery Procedures

1. **Infrastructure Recovery**: Re-run Terraform apply
2. **Application Recovery**: Deploy previous known-good image
3. **Data Recovery**: Restore from database backups

## Troubleshooting

### Common Issues

1. **ECS Service Won't Start**
   - Check CloudWatch logs
   - Verify secrets are accessible
   - Confirm security group rules

2. **Load Balancer Health Checks Failing**
   - Verify application is listening on correct ports
   - Check security group ingress rules
   - Review health check endpoint responses

3. **WebSocket Connections Failing**
   - Confirm WebSocket port (8080) is open
   - Check ALB listener rules for WebSocket paths
   - Verify sticky sessions configuration

### Useful Commands

```bash
# View ECS service logs
aws logs tail /ecs/flappyjournal-staging --follow

# Check ECS service status
aws ecs describe-services \
  --cluster flappyjournal-staging-cluster \
  --services flappyjournal-staging-service

# Test health endpoints
curl https://staging.flappyjournal.com/api/health
curl https://staging.flappyjournal.com/ws/health
```

## Cost Optimization

### Staging Environment

- Uses smaller Fargate instances (0.5 vCPU, 1GB RAM)
- Single AZ deployment
- Reduced log retention
- No backup services

### Production Environment

- Uses appropriately sized instances
- Multi-AZ for high availability
- Enhanced monitoring and backup services
- Auto-scaling based on demand

## Contributing

When making infrastructure changes:

1. Test in staging first
2. Update documentation
3. Run `terraform plan` before applying
4. Use descriptive commit messages
5. Tag production deployments

## Support

For infrastructure issues:
- Check CloudWatch logs first
- Review AWS console for service status
- Use the troubleshooting guide above
- Contact the DevOps team for escalation
