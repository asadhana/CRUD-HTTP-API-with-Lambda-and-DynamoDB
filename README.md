# AWS Serverless CRUD API Tutorial

A serverless API that performs CRUD operations on a DynamoDB table using AWS Lambda and API Gateway HTTP API.

## Architecture

```
Client → API Gateway HTTP API → Lambda Function → DynamoDB Table
```

## Project Structure

```
.
├── README.md
├── lambda/
│   ├── index.js (or index.py)
│   └── package.json (for Node.js)
├── infrastructure/
│   └── template.yaml (AWS SAM template)
└── docs/
    └── setup-guide.md
```

## Resources Created

- DynamoDB Table: `http-crud-tutorial-items`
- Lambda Function: `http-crud-tutorial-function`
- HTTP API: `http-crud-tutorial-api`
- IAM Role: `http-crud-tutorial-role`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /items | Get all items |
| GET | /items/{id} | Get item by ID |
| PUT | /items | Create or update item |
| DELETE | /items/{id} | Delete item by ID |

## Implementation Plan

### Phase 1: Lambda Function Code
- Create Lambda function handler (Node.js or Python)
- Implement CRUD operations for DynamoDB
- Handle API Gateway event routing

### Phase 2: Infrastructure as Code
- Create AWS SAM template
- Define DynamoDB table resource
- Define Lambda function with proper IAM permissions
- Define HTTP API with routes and integrations

### Phase 3: Documentation
- Manual setup guide for AWS Console
- Deployment instructions using AWS SAM CLI
- Testing examples with curl commands

### Phase 4: Testing
- Local testing setup (optional)
- Integration test examples

## Quick Start

### Prerequisites
- AWS Account
- AWS CLI configured
- AWS SAM CLI installed (for automated deployment)

### Option 1: Manual Deployment (AWS Console)
Follow the step-by-step guide in `docs/setup-guide.md`

### Option 2: Automated Deployment (AWS SAM)
```bash
sam build
sam deploy --guided
```

## Testing the API

Replace `YOUR_API_URL` with your actual API Gateway invoke URL:

```bash
# Create/Update an item
curl -X "PUT" -H "Content-Type: application/json" \
  -d '{"id": "123", "price": 12345, "name": "myitem"}' \
  YOUR_API_URL/items

# Get all items
curl YOUR_API_URL/items

# Get specific item
curl YOUR_API_URL/items/123

# Delete an item
curl -X "DELETE" YOUR_API_URL/items/123
```

## Cleanup

### Manual Cleanup
1. Delete Lambda function
2. Delete CloudWatch log group
3. Delete IAM role
4. Delete HTTP API
5. Delete DynamoDB table

### Automated Cleanup
```bash
sam delete
```

## Cost Estimate

This project uses AWS Free Tier eligible services:
- DynamoDB: 25 GB storage, 25 WCU, 25 RCU
- Lambda: 1M free requests/month, 400,000 GB-seconds compute
- API Gateway: 1M API calls/month (first 12 months)

## Next Steps

- Add authentication with Amazon Cognito
- Implement request validation
- Add CloudWatch monitoring and alarms
- Set up CI/CD pipeline
- Add unit and integration tests

## References

- [Original AWS Tutorial](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
