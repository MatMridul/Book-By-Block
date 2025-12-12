# AWS Deployment Guide

## Architecture Overview
- **Frontend**: AWS Amplify (Static hosting with CDN)
- **Backend**: AWS Lambda + API Gateway (Serverless)
- **Database**: AWS RDS PostgreSQL
- **Blockchain**: Polygon network (external)

## 1. Backend Deployment (AWS Lambda)

### Install Serverless Framework
```bash
npm install -g serverless
npm install serverless-offline --save-dev
```

### Deploy Backend
```bash
cd backend
serverless deploy --stage prod
```

### Environment Variables (AWS Systems Manager)
```bash
aws ssm put-parameter --name "/bookbyblock/prod/PRIVATE_KEY" --value "your-private-key" --type "SecureString"
aws ssm put-parameter --name "/bookbyblock/prod/CONTRACT_ADDRESS" --value "your-contract-address" --type "String"
aws ssm put-parameter --name "/bookbyblock/prod/RPC_URL" --value "https://polygon-rpc.com" --type "String"
```

## 2. Frontend Deployment (AWS Amplify)

### Build Configuration
```bash
cd frontend
npm run build
```

### Amplify Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/prod
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
NEXT_PUBLIC_CHAIN_ID=137
```

## 3. Database Setup (AWS RDS)

### Create PostgreSQL Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier bookbyblock-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

## 4. API Gateway CORS Configuration

CORS will be automatically configured through serverless.yml for:
- Amplify frontend domain
- Custom domain (if configured)
- Local development (for testing)

## 5. Monitoring & Logging

- **CloudWatch**: Automatic Lambda logging
- **X-Ray**: Distributed tracing
- **CloudWatch Alarms**: Error rate monitoring

## Deployment Commands

```bash
# Deploy backend
cd backend && serverless deploy --stage prod

# Deploy frontend
cd frontend && amplify publish

# Update environment variables
aws ssm put-parameter --name "/bookbyblock/prod/PARAM_NAME" --value "value" --overwrite
```
