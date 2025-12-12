#!/bin/bash

echo "🚀 BookByBlock AWS Deployment Script"
echo "======================================"

# Check AWS credentials
echo "📋 Checking AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

echo "✅ AWS credentials verified"

# Set environment variables (replace with your actual values)
STAGE="prod"
REGION="us-east-1"
PRIVATE_KEY="your-private-key-here"
CONTRACT_ADDRESS="your-contract-address-here"
RPC_URL="https://polygon-rpc.com"

echo "🔧 Setting up AWS Systems Manager parameters..."

# Create SSM parameters
aws ssm put-parameter \
    --name "/bookbyblock/${STAGE}/PRIVATE_KEY" \
    --value "${PRIVATE_KEY}" \
    --type "SecureString" \
    --overwrite \
    --region ${REGION}

aws ssm put-parameter \
    --name "/bookbyblock/${STAGE}/CONTRACT_ADDRESS" \
    --value "${CONTRACT_ADDRESS}" \
    --type "String" \
    --overwrite \
    --region ${REGION}

aws ssm put-parameter \
    --name "/bookbyblock/${STAGE}/RPC_URL" \
    --value "${RPC_URL}" \
    --type "String" \
    --overwrite \
    --region ${REGION}

echo "✅ AWS parameters configured"

# Install serverless globally if not present
if ! command -v serverless &> /dev/null; then
    echo "📦 Installing Serverless Framework..."
    npm install -g serverless
fi

# Deploy backend
echo "🚀 Deploying backend to AWS Lambda..."
cd backend

# Install dependencies
npm install

# Build the project
npm run build

# Deploy with serverless
serverless deploy --stage ${STAGE} --region ${REGION}

# Get the API Gateway URL
API_URL=$(serverless info --stage ${STAGE} --region ${REGION} | grep "endpoint:" | awk '{print $2}')

echo "✅ Backend deployed successfully!"
echo "🔗 API Gateway URL: ${API_URL}"

cd ..

# Frontend deployment instructions
echo ""
echo "📱 Frontend Deployment Instructions:"
echo "======================================"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' > 'Host web app'"
echo "3. Connect your GitHub repository"
echo "4. Set environment variables:"
echo "   NEXT_PUBLIC_API_URL=${API_URL}"
echo "   NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}"
echo "   NEXT_PUBLIC_CHAIN_ID=137"
echo "5. Deploy the app"
echo ""
echo "🎯 Deployment Summary:"
echo "======================"
echo "✅ Backend: AWS Lambda + API Gateway"
echo "✅ Environment: Production-ready"
echo "✅ CORS: Configured for Amplify"
echo "✅ Monitoring: CloudWatch enabled"
echo ""
echo "🔗 API Endpoint: ${API_URL}"
echo "📊 CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups"
echo ""
echo "🎉 Deployment complete! Your Web3 ticketing platform is live on AWS!"
