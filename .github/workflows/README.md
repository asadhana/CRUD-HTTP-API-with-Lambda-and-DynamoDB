# GitHub Actions Workflows

Automated deployment and management workflows for the AWS Serverless CRUD application.

## Prerequisites

Before running any workflows, configure these GitHub Secrets in your repository:

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `AWS_REGION` - AWS region (e.g., `us-east-1`)
   - `AWS_ACCOUNT_ID` - Your 12-digit AWS account ID

## Deployment Order

Run the workflows in this order for initial deployment:

### 1. Manage IAM (Workflow 1)
**Purpose:** Create IAM role for Lambda with DynamoDB permissions

**Action:** `deploy`

**What it creates:**
- IAM role: `http-crud-tutorial-role`
- Attached policies:
  - AWSLambdaBasicExecutionRole (for CloudWatch logs)
  - DynamoDBAccess (inline policy for table operations)

---

### 2. Manage DynamoDB (Workflow 2)
**Purpose:** Create DynamoDB table for storing items

**Action:** `deploy`

**What it creates:**
- Table: `http-crud-tutorial-items`
- Partition key: `id` (String)
- Billing mode: PAY_PER_REQUEST (on-demand)

---

### 3. Manage Lambda (Workflow 3)
**Purpose:** Deploy Lambda function with Node.js runtime

**Action:** `deploy`

**What it creates:**
- Function: `http-crud-tutorial-function`
- Runtime: Node.js 20.x
- Handler: `index.handler`
- Environment variable: `TABLE_NAME`
- Packages and deploys code from `lambda/` directory

**Note:** If function exists, it updates the code instead of creating new.

---

### 4. Manage API Gateway (Workflow 4)
**Purpose:** Create HTTP API with routes and Lambda integration

**Action:** `deploy`

**What it creates:**
- HTTP API: `http-crud-tutorial-api`
- Stage: `$default` (with auto-deploy)
- Routes:
  - `GET /items` - List all items
  - `GET /items/{id}` - Get single item
  - `PUT /items` - Create/update item
  - `DELETE /items/{id}` - Delete item
  - `OPTIONS /items` - CORS preflight
  - `OPTIONS /items/{id}` - CORS preflight
- Lambda integration for all routes
- Lambda invoke permission for API Gateway

**Output:** API URL (save this for frontend configuration)

**Note:** CORS is handled by Lambda, not API Gateway configuration.

---

### 5. Manage Cognito (Workflow 5)
**Purpose:** Create Cognito User Pool for authentication

**Action:** `deploy`

**Inputs:**
- `test_user_email` - Email for test user (default: testuser@example.com)
- `test_user_password` - Password for test user (default: TempPass123!)

**What it creates:**
- User Pool: `http-crud-tutorial-users`
- App Client: `http-crud-tutorial-app` (without client secret)
- Test user (confirmed and ready to use)

**Output:** User Pool ID, App Client ID, and credentials for frontend

---

### 6. Configure API Authorization (Workflow 6)
**Purpose:** Secure API with Cognito JWT authentication

**Action:** `enable`

**What it does:**
- Creates JWT authorizer linked to Cognito User Pool
- Attaches authorizer to all CRUD routes (GET, PUT, DELETE)
- Leaves OPTIONS routes public (for CORS preflight)

**Result:** API now requires valid JWT token for all operations

**To disable:** Run with action `disable`

---

### 7. API Tests (Workflow 7)
**Purpose:** Test API endpoints with or without authentication

**Inputs:**
- `api_url` - Your API Gateway URL
- `use_auth` - Whether to use authentication (yes/no)
- `cognito_username` - Username (if using auth)
- `cognito_password` - Password (if using auth)

**What it tests:**
- Create item (PUT)
- List all items (GET)
- Get single item (GET)
- Update item (PUT) - only with auth
- Delete item (DELETE)

**Use cases:**
- Test without auth: Before configuring authorization
- Test with auth: After configuring authorization

---

### 8. Cleanup All Resources (Workflow 8)
**Purpose:** Delete all AWS resources created by this project

**Input:** Type `DELETE` to confirm

**What it deletes:**
1. API Gateway
2. Lambda Function
3. DynamoDB Table
4. Cognito User Pool (including app clients)
5. IAM Role (including policies)

**Warning:** This is irreversible! All data will be lost.

---

## Common Workflows

### Initial Deployment
```
1. Run workflow 1 (Manage IAM) - deploy
2. Run workflow 2 (Manage DynamoDB) - deploy
3. Run workflow 3 (Manage Lambda) - deploy
4. Run workflow 4 (Manage API Gateway) - deploy
5. Update frontend/.env with API URL
6. Test API without auth (workflow 7)
7. Run workflow 5 (Manage Cognito) - deploy
8. Update frontend/.env with Cognito details
9. Run workflow 6 (Configure API Authorization) - enable
10. Test API with auth (workflow 7)
```

### Update Lambda Code
```
1. Commit changes to lambda/index.js
2. Run workflow 3 (Manage Lambda) - deploy
```

### Enable/Disable Authentication
```
Enable: Run workflow 6 - enable
Disable: Run workflow 6 - disable
```

### Complete Cleanup
```
Run workflow 8 (Cleanup All) - type "DELETE"
```

---

## Troubleshooting

### Workflow Fails: "Role not found"
- Run workflow 1 (Manage IAM) first
- Wait 10-15 seconds for IAM role to propagate

### Workflow Fails: "Table not found"
- Run workflow 2 (Manage DynamoDB) first

### Workflow Fails: "Function not found"
- Run workflow 3 (Manage Lambda) first

### Workflow Fails: "User Pool not found"
- Run workflow 5 (Manage Cognito) first

### API Returns 401 Unauthorized
- Ensure workflow 6 (Configure API Authorization) was run
- Verify JWT token is valid and not expired
- Check that Cognito User Pool ID and App Client ID match

### CORS Errors
- Verify Lambda function returns CORS headers
- Ensure OPTIONS routes exist in API Gateway
- Check that OPTIONS routes point to Lambda integration

---

## Resource Naming Convention

All resources use the prefix `http-crud-tutorial-` for easy identification:

- IAM Role: `http-crud-tutorial-role`
- DynamoDB Table: `http-crud-tutorial-items`
- Lambda Function: `http-crud-tutorial-function`
- API Gateway: `http-crud-tutorial-api`
- Cognito User Pool: `http-crud-tutorial-users`
- Cognito App Client: `http-crud-tutorial-app`

---

## Cost Considerations

All resources use serverless/pay-per-use pricing:

- **Lambda:** Free tier includes 1M requests/month
- **DynamoDB:** Free tier includes 25GB storage + 25 RCU/WCU
- **API Gateway:** Free tier includes 1M requests/month
- **Cognito:** Free tier includes 50,000 MAUs

**Estimated cost for testing:** $0-5/month (within free tier limits)

---

## Security Best Practices

1. **Never commit AWS credentials** to the repository
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate AWS access keys** regularly
4. **Use least-privilege IAM policies**
5. **Enable MFA** on AWS account
6. **Delete resources** when not in use (workflow 8)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review workflow logs in GitHub Actions tab
3. Check AWS CloudWatch logs for Lambda errors
4. Verify all prerequisites are met
