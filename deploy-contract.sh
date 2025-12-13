#!/bin/bash

echo "🚀 BookByBlock Smart Contract Deployment"
echo "========================================"

# Check if private key is provided
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY environment variable not set"
    echo ""
    echo "Please run:"
    echo "export PRIVATE_KEY=your-metamask-private-key"
    echo "then run this script again"
    exit 1
fi

echo "✅ Private key detected"
echo "📦 Installing dependencies..."

cd contracts
npm install --silent

echo "🔨 Compiling contracts..."
npx hardhat compile

echo "🚀 Deploying to Polygon..."
npx hardhat run scripts/deploy.js --network polygon

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "📋 Contract address saved to deployment.json"
    echo "🔧 Updating .env.deploy file..."
    
    # Extract contract address from deployment.json
    CONTRACT_ADDRESS=$(node -p "JSON.parse(require('fs').readFileSync('deployment.json', 'utf8')).contractAddress")
    
    # Update .env.deploy file
    cd ..
    sed -i "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env.deploy
    
    echo "✅ .env.deploy updated with contract address: $CONTRACT_ADDRESS"
    echo ""
    echo "🎉 Ready for AWS deployment!"
    echo "Run: source .env.deploy && ./deploy-full-aws.sh"
else
    echo "❌ Deployment failed"
    exit 1
fi
