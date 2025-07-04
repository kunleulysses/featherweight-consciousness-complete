# Secrets Manager secrets
resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}-${var.environment}-database-url"
  description             = "Database URL for ${var.project_name} ${var.environment}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-database-url"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project_name}-${var.environment}-jwt-secret"
  description             = "JWT secret for ${var.project_name} ${var.environment}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-jwt-secret"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret" "openai_api_key" {
  name                    = "${var.project_name}-${var.environment}-openai-api-key"
  description             = "OpenAI API key for ${var.project_name} ${var.environment}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-openai-api-key"
    Environment = var.environment
    Project     = var.project_name
  }
}
