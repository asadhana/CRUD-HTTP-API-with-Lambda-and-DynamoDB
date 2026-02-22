# Manual Setup Guide

This guide walks through creating the serverless CRUD API using the AWS Console.

## Prerequisites

- AWS Account
- AWS Console access
- Basic understanding of AWS services

## Step 1: Create DynamoDB Table

1. Open the [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click "Create table"
3. Configure:
   - Table name: `http-crud-tutorial-items`
   - Partition key: `id` (String)
4. Leave other settings as default
5. Click "Create table"

## Step 2: Create Lambda Function

1. Open the [Lambda Console](https://console.aws.amazon.com/lambda)
2. Click "Create function"
3. Configure:
   - Function name: `http-crud-tutorial-function`
   - Runtime: Node.js 20.x or Python 3.12
4. Under "Permissions":
   - Select "Create a new role from AWS policy templates"
   - Role name: `http-crud-tutorial-role`
   - Policy templates: "Simple microservice permissions"
5. Click "Create function"
6. Replace the function code:
   - For Node.js: Copy code from `lambda/index.js`
   - For Python: Copy code from `lambda/index.py`
7. Click "Deploy"

### Add Environment Variable

1. In the Lambda function configuration
2. Go to "Configuration" → "Environment variables"
3. Click "Edit" → "Add environment variable"
4. Key: `TABLE_NAME`, Value: `http-crud-tutorial-items`
5. Click "Save"

## Step 3: Create HTTP API

1. Open the [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Click "Create API"
3. Under "HTTP API", click "Build"
4. Configure:
   - API name: `http-crud-tutorial-api`
   - IP address type: IPv4
5. Click "Next"
6. Skip route creation (click "Next")
7. Review stage and click "Next"
8. Click "Create"

## Step 4: Create Routes

Create each of these routes:

1. Click "Routes" in the left menu
2. Click "Create" for each route:

| Method | Path |
|--------|------|
| GET | /items |
| GET | /items/{id} |
| PUT | /items |
| DELETE | /items/{id} |

## Step 5: Create Integration

1. Click "Integrations" in the left menu
2. Click "Manage integrations" → "Create"
3. Configure:
   - Integration type: Lambda function
   - Lambda function: `http-crud-tutorial-function`
4. Click "Create"

## Step 6: Attach Integration to Routes

For each route:

1. Click "Integrations"
2. Select a route
3. Under "Choose an existing integration", select `http-crud-tutorial-function`
4. Click "Attach integration"
5. Repeat for all routes

## Step 7: Test Your API

1. In API Gateway console, go to your API
2. Copy the "Invoke URL" from the Details page
3. Test with curl:

```bash
# Set your API URL
API_URL="https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com"

# Create an item
curl -X "PUT" -H "Content-Type: application/json" \
  -d '{"id": "123", "price": 12345, "name": "myitem"}' \
  $API_URL/items

# Get all items
curl $API_URL/items

# Get specific item
curl $API_URL/items/123

# Delete item
curl -X "DELETE" $API_URL/items/123
```

## Troubleshooting

### Lambda returns 500 error
- Check CloudWatch Logs for the Lambda function
- Verify IAM role has DynamoDB permissions
- Verify TABLE_NAME environment variable is set

### API Gateway returns 403
- Check Lambda resource policy allows API Gateway to invoke it
- Verify integration is attached to routes

### Items not appearing in DynamoDB
- Check Lambda CloudWatch logs for errors
- Verify table name matches in Lambda code
- Check IAM permissions for DynamoDB operations

## Cleanup

To avoid ongoing charges:

1. Delete HTTP API (API Gateway console)
2. Delete Lambda function (Lambda console)
3. Delete CloudWatch log group: `/aws/lambda/http-crud-tutorial-function`
4. Delete IAM role: `http-crud-tutorial-role`
5. Delete DynamoDB table: `http-crud-tutorial-items`
