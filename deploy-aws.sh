#!/bin/bash

echo "🚀 Deploying BookByBlock to AWS..."

# Deploy Backend to Lambda
echo "📦 Deploying backend to AWS Lambda..."
cd backend
npm install
npm run deploy:prod
BACKEND_URL=$(serverless info --stage prod | grep "endpoint:" | awk '{print $2}')
cd ..

# Deploy Frontend to Amplify
echo "🎨 Deploying frontend to AWS Amplify..."
cd frontend

# Set environment variables for build
export NEXT_PUBLIC_API_URL=$BACKEND_URL
export NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
export NEXT_PUBLIC_CHAIN_ID=137

npm install
npm run build

echo "✅ Deployment complete!"
echo "🔗 Backend URL: $BACKEND_URL"
echo "📱 Frontend: Deploy to Amplify Console with this build"
echo ""
echo "Next steps:"
echo "1. Push changes to GitHub"
echo "2. Connect GitHub repo to AWS Amplify"
echo "3. Set environment variables in Amplify Console"
echo "4. Deploy frontend"
