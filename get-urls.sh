#!/bin/bash

STACK_NAME="bookbyblock-full-stack"
REGION="us-east-1"

echo "🔗 Fetching BookByBlock URLs..."
echo ""

# Get URLs from CloudFormation
FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
    --output text 2>/dev/null)

SCANNER_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`ScannerURL`].OutputValue' \
    --output text 2>/dev/null)

BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendURL`].OutputValue' \
    --output text 2>/dev/null)

# Display results
if [ ! -z "$FRONTEND_URL" ]; then
    echo "🌐 BookByBlock URLs:"
    echo "   Frontend:  $FRONTEND_URL"
    echo "   Scanner:   $SCANNER_URL"
    echo "   Backend:   $BACKEND_URL"
    echo ""
    echo "📋 Copy & Share:"
    echo "   Main App:     $FRONTEND_URL"
    echo "   Scanner App:  $SCANNER_URL"
else
    echo "❌ No deployment found. Run ./deploy-full-aws.sh first"
fi
