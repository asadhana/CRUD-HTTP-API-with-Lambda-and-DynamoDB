# AWS Serverless CRUD Application - Deployment Guide

## Overview

This guide provides complete instructions for deploying and managing the AWS Serverless CRUD application using GitHub Actions workflows.

## What's Been Updated

### GitHub Actions Workflows

All workflows have been updated to match the current implementation:

1. **Workflow 1: Manage IAM** - No changes (already correct)
2. **Workflow 2: Manage DynamoDB** - No changes (already correct)
3. **Workflow 3: Manage Lambda** - No changes (already uses Node.js)
4. **Workflow 4: Manage API Gateway** - Updated:
   - Removed CORS configuration (Lambda handles it)
   - Added OPTIONS routes for CORS preflight
   - Improved output messages
5. **Workflow 5: Manage Cognito** - NEW:
   - Creates Cognito User Pool
   - Creates App Client
   - Creates and confirms test user
6. **Workflow 6: Configure API Authorization** - NEW:
   - Creates JWT authorizer
   - Attaches to CRUD routes
   - Leaves OPTIONS routes public
7. **Workflow 7: API Tests** - Updated:
   - Supports authentication testing
   - Tests with and without JWT tokens
8. **Workflow 8: Cleanup All** - NEW:
   - Deletes all AWS resources
   - Requires confirmation

## Quick Start

### Prerequisites

1. AWS Account with appropriate permissions
2. GitHub repository with the code
3. GitHub Secrets configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_ACCOUNT_ID`

### Deployment Steps

#### Step 1: Deploy Infrastructure (Workflows 1-4)

Run these workflows in order from the GitHub Actions tab:

```
1. Manage IAM → deploy
2. Manage DynamoDB → deploy
3. Manage Lambda → deploy
4. Manage API Gateway → deploy
```

After workflow 4 completes, note the API URL from the output.

#### Step 2: Configure Frontend (Without Auth)

Update `frontend/.env`:
```env
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

Test the application - it should work without authentication.

#### Step 3: Add Authentication (Workflows 5-6)

```
5. Manage Cognito → deploy
   - Enter test user email and password
6. Configure API Authorization → enable
```

After workflow 5 completes, update `frontend/.env` with Cognito details.

#### Step 4: Test Everything

```
7. API Tests → Run with authentication
```

Your application is now fully deployed with authentication!

## Workflow Details

### 1. Manage IAM
- **Purpose:** Create Lambda execution role
- **Resources:** IAM role with DynamoDB permissions
- **Actions:** deploy, delete

### 2. Manage DynamoDB
- **Purpose:** Create items table
- **Resources:** DynamoDB table with on-demand billing
- **Actions:** deploy, delete

### 3. Manage Lambda
- **Purpose:** Deploy Node.js function
- **Resources:** Lambda function with environment variables
- **Actions:** deploy, delete
- **Note:** Automatically packages code from `lambda/` directory

### 4. Manage API Gateway
- **Purpose:** Create HTTP API with routes
- **Resources:** 
  - API Gateway HTTP API
  - 6 routes (4 CRUD + 2 OPTIONS)
  - Lambda integration
- **Actions:** deploy, delete
- **Key Changes:**
  - No CORS configuration (Lambda handles it)
  - OPTIONS routes for preflight requests

### 5. Manage Cognito (NEW)
- **Purpose:** Create user authentication
- **Resources:**
  - Cognito User Pool
  - App Client
  - Test user
- **Actions:** deploy, delete
- **Inputs:**
  - test_user_email (default: testuser@example.com)
  - test_user_password (default: TempPass123!)

### 6. Configure API Authorization (NEW)
- **Purpose:** Secure API with JWT
- **Resources:**
  - JWT Authorizer
  - Route authorization configuration
- **Actions:** enable, disable
- **Note:** OPTIONS routes remain public for CORS

### 7. API Tests (UPDATED)
- **Purpose:** Test API endpoints
- **Inputs:**
  - api_url (required)
  - use_auth (yes/no)
  - cognito_username (if using auth)
  - cognito_password (if using auth)
- **Tests:**
  - Create, Read, Update, Delete operations
  - With and without authentication

### 8. Cleanup All (NEW)
- **Purpose:** Delete all resources
- **Input:** Type "DELETE" to confirm
- **Deletes:**
  - API Gateway
  - Lambda Function
  - DynamoDB Table
  - Cognito User Pool
  - IAM Role
- **Warning:** Irreversible!

## Common Scenarios

### Scenario 1: Fresh Deployment
```
Run workflows 1 → 2 → 3 → 4 → 5 → 6
Update frontend/.env
Test with workflow 7
```

### Scenario 2: Update Lambda Code
```
Commit changes to lambda/index.js
Run workflow 3 (Manage Lambda) → deploy
```

### Scenario 3: Disable Authentication
```
Run workflow 6 (Configure API Authorization) → disable
```

### Scenario 4: Complete Cleanup
```
Run workflow 8 (Cleanup All) → type "DELETE"
```

## Frontend Configuration

### Without Authentication
```env
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

### With Authentication
```env
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_CLIENT_ID=your-app-client-id
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USERNAME=testuser@example.com
REACT_APP_COGNITO_PASSWORD=YourPassword123!
```

## Troubleshooting

### Workflow Fails: "Role not found"
- Ensure workflow 1 (Manage IAM) completed successfully
- Wait 10-15 seconds for IAM propagation

### Workflow Fails: "Table not found"
- Ensure workflow 2 (Manage DynamoDB) completed successfully

### API Returns 401 Unauthorized
- Verify workflow 6 (Configure API Authorization) was run
- Check JWT token is valid
- Ensure Cognito credentials are correct

### CORS Errors in Browser
- Verify Lambda returns CORS headers
- Check OPTIONS routes exist in API Gateway
- Ensure OPTIONS routes point to Lambda

### Authentication Fails
- Verify Cognito User Pool ID and App Client ID
- Check test user is confirmed
- Ensure password meets requirements

## Architecture

```
Browser (React App)
    ↓
    ↓ (HTTPS + JWT Token)
    ↓
API Gateway (HTTP API)
    ↓ (JWT Validation via Cognito Authorizer)
    ↓
Lambda Function (Node.js)
    ↓
DynamoDB Table
    
Cognito User Pool
    ↓ (Authentication)
    ↓ (Returns JWT Token)
Browser (React App)
```

## Cost Estimate

All services use pay-per-use pricing:

- **Lambda:** $0.20 per 1M requests (Free tier: 1M requests/month)
- **DynamoDB:** $1.25 per million write requests (Free tier: 25GB + 25 RCU/WCU)
- **API Gateway:** $1.00 per million requests (Free tier: 1M requests/month)
- **Cognito:** Free for up to 50,000 MAUs

**Estimated monthly cost for testing:** $0-5 (within free tier)

## Security Best Practices

1. ✅ Use GitHub Secrets for AWS credentials
2. ✅ Never commit `.env` file with real credentials
3. ✅ Rotate AWS access keys regularly
4. ✅ Use least-privilege IAM policies
5. ✅ Enable MFA on AWS account
6. ✅ Delete resources when not in use (workflow 8)
7. ✅ Use strong passwords for Cognito users
8. ✅ Monitor CloudWatch logs for suspicious activity

## Next Steps

1. **Push the updated workflows to GitHub:**
   ```bash
   git push origin main
   ```
   Note: You may need to update your GitHub token with `workflow` scope.

2. **Configure GitHub Secrets** in your repository

3. **Run the workflows** in the order specified above

4. **Update frontend configuration** with the output values

5. **Test the application** locally and via workflows

## Support

For detailed workflow documentation, see `.github/workflows/README.md`

For frontend setup instructions, see `frontend/README.md`

For issues or questions, check the troubleshooting sections in this guide.
