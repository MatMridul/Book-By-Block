#!/bin/bash

set -e

REGION="us-east-1"

echo "🧹 AWS Cleanup - Removing Existing BookByBlock Resources"
echo "======================================================="
echo ""

# Check for existing stacks
echo "🔍 Checking for existing CloudFormation stacks..."

# Remove old serverless stack (from previous Lambda deployment)
OLD_STACK="bookbyblock-api-prod"
if aws cloudformation describe-stacks --stack-name ${OLD_STACK} --region ${REGION} >/dev/null 2>&1; then
    echo "🗑️  Removing old serverless stack: ${OLD_STACK}"
    aws cloudformation delete-stack --stack-name ${OLD_STACK} --region ${REGION}
    
    echo "⏳ Waiting for stack deletion to complete..."
    aws cloudformation wait stack-delete-complete --stack-name ${OLD_STACK} --region ${REGION}
    echo "✅ Old stack deleted successfully"
else
    echo "ℹ️  No old serverless stack found"
fi

# Check for new full stack
NEW_STACK="bookbyblock-full-stack"
if aws cloudformation describe-stacks --stack-name ${NEW_STACK} --region ${REGION} >/dev/null 2>&1; then
    echo "🗑️  Removing existing full stack: ${NEW_STACK}"
    aws cloudformation delete-stack --stack-name ${NEW_STACK} --region ${REGION}
    
    echo "⏳ Waiting for stack deletion to complete..."
    aws cloudformation wait stack-delete-complete --stack-name ${NEW_STACK} --region ${REGION}
    echo "✅ Full stack deleted successfully"
else
    echo "ℹ️  No existing full stack found"
fi

# Clean up ECR images (optional - saves storage costs)
ECR_REPOSITORY="bookbyblock-backend"
echo "🐳 Checking ECR repository..."
if aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${REGION} >/dev/null 2>&1; then
    echo "🗑️  Cleaning up old Docker images in ECR..."
    
    # List and delete old images (keep latest)
    IMAGE_TAGS=$(aws ecr list-images --repository-name ${ECR_REPOSITORY} --region ${REGION} --query 'imageIds[?imageTag!=`latest`]' --output json)
    
    if [ "$IMAGE_TAGS" != "[]" ]; then
        aws ecr batch-delete-image --repository-name ${ECR_REPOSITORY} --region ${REGION} --image-ids "$IMAGE_TAGS" >/dev/null 2>&1 || true
        echo "✅ Old Docker images cleaned up"
    else
        echo "ℹ️  No old images to clean up"
    fi
else
    echo "ℹ️  No ECR repository found"
fi

# Clean up any orphaned resources
echo "🔍 Checking for orphaned resources..."

# Check for load balancers
LB_ARNS=$(aws elbv2 describe-load-balancers --region ${REGION} --query 'LoadBalancers[?contains(LoadBalancerName, `bookbyblock`)].LoadBalancerArn' --output text 2>/dev/null || true)
if [ ! -z "$LB_ARNS" ]; then
    echo "⚠️  Found orphaned load balancers - they will be cleaned up by CloudFormation"
fi

# Check for ECS clusters
ECS_CLUSTERS=$(aws ecs list-clusters --region ${REGION} --query 'clusterArns[?contains(@, `bookbyblock`)]' --output text 2>/dev/null || true)
if [ ! -z "$ECS_CLUSTERS" ]; then
    echo "⚠️  Found orphaned ECS clusters - they will be cleaned up by CloudFormation"
fi

echo ""
echo "✅ Cleanup completed successfully!"
echo ""
echo "🚀 Ready for fresh deployment:"
echo "   ./deploy-full-aws.sh"
echo ""
echo "💡 Note: Some resources may take a few minutes to fully terminate"
