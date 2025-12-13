#!/bin/bash

set -e

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-bookbyblock.com}"
REGION="us-east-1"
STACK_NAME="bookbyblock-full-stack"
ECR_REPOSITORY="bookbyblock-backend"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 BookByBlock Complete AWS Deployment"
echo "======================================"
echo "Domain: ${DOMAIN_NAME}"
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

# Create default ECS execution role if needed
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

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite 2>/dev/null || true

# Create ECR repository
echo "📦 Setting up ECR repository..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${REGION} 2>/dev/null || \
aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${REGION}

# Build and push backend Docker image
echo "🏗️  Building and pushing backend Docker image..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

cd backend
docker build -t ${ECR_REPOSITORY}:latest .
docker tag ${ECR_REPOSITORY}:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
cd ..

# Deploy infrastructure
echo "☁️  Deploying complete AWS infrastructure..."
aws cloudformation deploy \
    --template-file aws/full-aws-hosting.yaml \
    --stack-name ${STACK_NAME} \
    --parameter-overrides \
        DomainName=${DOMAIN_NAME} \
        ContainerImage=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPOSITORY}:latest \
        PrivateKey=${PRIVATE_KEY} \
        ContractAddress=${CONTRACT_ADDRESS} \
    --region ${REGION}

# Get deployment outputs
echo "📋 Getting deployment information..."
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' \
    --output text)

SCANNER_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`ScannerBucket`].OutputValue' \
    --output text)

BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendURL`].OutputValue' \
    --output text)

# Build and deploy frontend
echo "🎨 Building and deploying frontend..."
cd frontend
export NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}
export NEXT_PUBLIC_SCANNER_URL=https://scanner.${DOMAIN_NAME}
npm install
npm run build
aws s3 sync out/ s3://${FRONTEND_BUCKET}/ --delete
cd ..

# Build and deploy scanner
echo "📱 Building and deploying scanner app..."
cd scanner
export NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}
npm install
npm run build
aws s3 sync out/ s3://${SCANNER_BUCKET}/ --delete
cd ..

# Invalidate CloudFront caches
echo "🔄 Invalidating CloudFront caches..."
FRONTEND_DISTRIBUTION=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Aliases.Items[0]=='${DOMAIN_NAME}'].Id" \
    --output text)

SCANNER_DISTRIBUTION=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Aliases.Items[0]=='scanner.${DOMAIN_NAME}'].Id" \
    --output text)

if [ ! -z "$FRONTEND_DISTRIBUTION" ]; then
    aws cloudfront create-invalidation --distribution-id ${FRONTEND_DISTRIBUTION} --paths "/*"
fi

if [ ! -z "$SCANNER_DISTRIBUTION" ]; then
    aws cloudfront create-invalidation --distribution-id ${SCANNER_DISTRIBUTION} --paths "/*"
fi

echo ""
echo "✅ Complete AWS deployment successful!"
echo ""
echo "🌐 Your BookByBlock Platform:"
echo "   Frontend:  https://${DOMAIN_NAME}"
echo "   Scanner:   https://scanner.${DOMAIN_NAME}"
echo "   Backend:   ${BACKEND_URL}"
echo ""
echo "📊 AWS Resources Created:"
echo "   • ECS Fargate cluster for backend API"
echo "   • S3 + CloudFront for frontend hosting"
echo "   • S3 + CloudFront for scanner app hosting"
echo "   • Application Load Balancer for backend"
echo "   • Secrets Manager for secure configuration"
echo ""
echo "🎯 Next Steps:"
echo "   1. Configure your domain DNS to point to CloudFront"
echo "   2. Set up SSL certificates in AWS Certificate Manager"
echo "   3. Update Route 53 for custom domain routing"
echo ""
echo "🎉 Your complete Web3 ticketing platform is live on AWS!"
