#!/bin/bash

set -e

# Configuration
ENVIRONMENT="prod"
REGION="us-east-1"
STACK_NAME="bookbyblock-${ENVIRONMENT}"
ECR_REPOSITORY="bookbyblock-backend"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 BookByBlock AWS Production Deployment (Simplified for Root User)"
echo "=================================================================="
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${REGION}"
echo "Account: ${ACCOUNT_ID}"
echo ""

# Check required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY environment variable is required"
    exit 1
fi

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ CONTRACT_ADDRESS environment variable is required"
    exit 1
fi

# Create default ECS execution role if it doesn't exist
echo "🔐 Ensuring ECS execution role exists..."
aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null || \
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Attach required policies to execution role
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite 2>/dev/null || true

# Create ECR repository if it doesn't exist
echo "📦 Setting up ECR repository..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${REGION} 2>/dev/null || \
aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${REGION}

# Get ECR login token
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Build and push Docker image
echo "🏗️  Building Docker image..."
cd backend
docker build -t ${ECR_REPOSITORY}:latest .
docker tag ${ECR_REPOSITORY}:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY}:latest

echo "📤 Pushing Docker image to ECR..."
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY}:latest

cd ..

# Deploy CloudFormation stack
echo "☁️  Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file aws/cloudformation-template.yaml \
    --stack-name ${STACK_NAME} \
    --parameter-overrides \
        Environment=${ENVIRONMENT} \
        ContainerImage=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY}:latest \
        PrivateKey=${PRIVATE_KEY} \
        ContractAddress=${CONTRACT_ADDRESS} \
        RpcUrl=${RPC_URL:-https://polygon-rpc.com} \
    --region ${REGION}

# Get outputs
echo "📋 Getting deployment outputs..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 API Endpoint: ${API_ENDPOINT}"
echo ""
echo "📊 Monitoring:"
echo "   CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups/log-group/%2Fecs%2Fbookbyblock-${ENVIRONMENT}"
echo "   ECS Service: https://console.aws.amazon.com/ecs/home?region=${REGION}#/clusters/bookbyblock-${ENVIRONMENT}/services"
echo ""
echo "🧪 Test the API:"
echo "   curl ${API_ENDPOINT}/health"
echo ""
echo "🎯 Next steps:"
echo "   1. Update frontend NEXT_PUBLIC_BACKEND_URL to: ${API_ENDPOINT}"
echo "   2. Deploy frontend to Netlify/Vercel"
echo "   3. Test the complete application"
echo ""
echo "🎉 Your Web3 ticketing platform is now live on AWS!"
