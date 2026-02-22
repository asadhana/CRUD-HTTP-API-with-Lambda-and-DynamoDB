# Automated Deployment Guide

Deploy the entire stack using AWS SAM CLI.

## Prerequisites

1. Install AWS CLI:
   ```bash
   # macOS
   brew install awscli
   
   # Or download from https://aws.amazon.com/cli/
   ```

2. Configure AWS credentials:
   ```bash
   aws configure
   ```

3. Install AWS SAM CLI:
   ```bash
   # macOS
   brew install aws-sam-cli
   
   # Or follow: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

## Deployment Steps

### 1. Build the Application

```bash
cd infrastructure
sam build
```

### 2. Deploy (First Time)

```bash
sam deploy --guided
```

You'll be prompted for:
- Stack Name: `http-crud-tutorial-stack`
- AWS Region: Your preferred region (e.g., `us-east-1`)
- Runtime: `nodejs20.x` or `python3.12`
- Confirm changes before deploy: Y
- Allow SAM CLI IAM role creation: Y
- Disable rollback: N
- Save arguments to configuration file: Y

### 3. Deploy (Subsequent Times)

```bash
sam deploy
```

### 4. Get API URL

After deployment, the API URL is displayed in the outputs:

```bash
# Or retrieve it with:
aws cloudformation describe-stacks \
  --stack-name http-crud-tutorial-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

## Testing

```bash
# Store API URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name http-crud-tutorial-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

# Create item
curl -X "PUT" -H "Content-Type: application/json" \
  -d '{"id": "test-1", "price": 999, "name": "Test Item"}' \
  $API_URL/items

# Get all items
curl $API_URL/items

# Get specific item
curl $API_URL/items/test-1

# Delete item
curl -X "DELETE" $API_URL/items/test-1
```

## View Logs

```bash
sam logs -n CrudFunction --stack-name http-crud-tutorial-stack --tail
```

## Local Testing (Optional)

### Start Local API

```bash
sam local start-api
```

### Test Locally

```bash
# Create item
curl -X "PUT" -H "Content-Type: application/json" \
  -d '{"id": "local-1", "price": 100, "name": "Local Test"}' \
  http://localhost:3000/items

# Get all items
curl http://localhost:3000/items
```

Note: Local testing requires Docker and won't actually write to DynamoDB unless configured.

## Update Function Code

1. Modify code in `lambda/index.js` or `lambda/index.py`
2. Rebuild and deploy:
   ```bash
   sam build
   sam deploy
   ```

## Cleanup

Delete all resources:

```bash
sam delete --stack-name http-crud-tutorial-stack
```

Or use CloudFormation:

```bash
aws cloudformation delete-stack --stack-name http-crud-tutorial-stack
```

## Troubleshooting

### Build fails
- Ensure you're in the `infrastructure` directory
- Check that `../lambda/` path is correct

### Deploy fails with IAM errors
- Ensure your AWS credentials have sufficient permissions
- You need permissions to create: Lambda, API Gateway, DynamoDB, IAM roles, CloudFormation

### Function errors after deployment
- Check logs: `sam logs -n CrudFunction --stack-name http-crud-tutorial-stack --tail`
- Verify DynamoDB table was created
- Check IAM permissions in CloudFormation console

## Advanced Configuration

### Change Runtime

Edit `infrastructure/template.yaml`:

```yaml
Parameters:
  Runtime:
    Default: python3.12  # Change to nodejs20.x or python3.12
```

### Enable CORS

Already configured in template. To modify, edit the `HttpApi` resource:

```yaml
CorsConfiguration:
  AllowOrigins:
    - "https://yourdomain.com"  # Restrict to specific domain
```

### Add Custom Domain

Add to `template.yaml`:

```yaml
HttpApi:
  Type: AWS::Serverless::HttpApi
  Properties:
    Domain:
      DomainName: api.yourdomain.com
      CertificateArn: arn:aws:acm:region:account:certificate/id
```
