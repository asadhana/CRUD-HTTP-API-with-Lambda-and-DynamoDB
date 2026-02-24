# AWS Serverless CRUD Frontend

React-based frontend application for the AWS Serverless CRUD API with Cognito authentication.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Amazon Cognito authentication with JWT tokens
- ✅ Real-time authentication status indicator
- ✅ Secure API calls with JWT authorization
- ✅ Modern, responsive UI with icons
- ✅ Error handling and user feedback

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS Account with:
  - API Gateway HTTP API deployed
  - Lambda function with DynamoDB integration
  - Cognito User Pool configured

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your AWS resources:

```bash
cp .env.example .env
```

Edit `.env` and replace the placeholder values:

```env
# Your API Gateway endpoint
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com

# Your Cognito User Pool ID (found in Cognito console)
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# Your Cognito App Client ID (found in Cognito console)
REACT_APP_COGNITO_CLIENT_ID=your-app-client-id-here

# AWS Region
REACT_APP_COGNITO_REGION=us-east-1

# Test user credentials (create in Cognito User Pool)
REACT_APP_COGNITO_USERNAME=testuser@example.com
REACT_APP_COGNITO_PASSWORD=YourSecurePassword123!
```

### 3. Create Cognito User Pool (if not already created)

1. Go to AWS Console → Amazon Cognito
2. Create a User Pool with email sign-in
3. Create an App Client (without client secret)
4. Create a test user and confirm the account
5. Note down the User Pool ID and App Client ID

### 4. Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Usage

### Authentication

1. Click the "Authenticate" button in the navbar
2. The app will authenticate using the credentials from `.env`
3. Upon success, you'll see a green checkmark with "Authenticated" status
4. Items will automatically load from the API

### CRUD Operations

- **View Items**: Automatically loaded after authentication
- **Add Item**: Click "Add Item" button, fill the form, and submit
- **Update Item**: Select an item, click "Update", modify, and submit
- **Delete Item**: Select an item and click "Delete"
- **Refresh**: Click the refresh icon to reload items

### Authentication Required

All CRUD operations require authentication. If not authenticated:
- All buttons will be disabled
- Clicking any button will prompt you to authenticate first
- The table will show "Please authenticate to view items"

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Key Dependencies

- **react**: UI framework
- **axios**: HTTP client for API calls
- **amazon-cognito-identity-js**: Cognito authentication SDK
- **lucide-react**: Icon library

## API Integration

The app communicates with AWS API Gateway, which:
1. Validates JWT tokens using Cognito authorizer
2. Forwards authenticated requests to Lambda
3. Lambda performs CRUD operations on DynamoDB

### API Endpoints

- `GET /items` - List all items
- `GET /items/{id}` - Get single item
- `PUT /items` - Create or update item
- `DELETE /items/{id}` - Delete item

All endpoints require a valid JWT token in the `Authorization` header.

## Security Notes

- Never commit `.env` file to version control
- JWT tokens are stored in component state (not persisted)
- Tokens expire based on Cognito User Pool settings
- API Gateway validates all tokens before forwarding to Lambda

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Ensure Lambda function returns proper CORS headers
2. Verify OPTIONS routes exist in API Gateway
3. Check that OPTIONS routes point to Lambda (not API Gateway CORS)

### Authentication Fails

If authentication fails:
1. Verify Cognito User Pool ID and App Client ID are correct
2. Ensure the test user is confirmed in Cognito
3. Check that the password meets Cognito password policy
4. Look at browser console for detailed error messages

### 401 Unauthorized Errors

If API calls return 401:
1. Verify the Cognito authorizer is configured in API Gateway
2. Check that the authorizer is attached to the correct routes
3. Ensure OPTIONS routes do NOT have authorization (for CORS)
4. Verify the JWT token is being sent in the Authorization header

## Development

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Environment Variables

All environment variables must be prefixed with `REACT_APP_` to be accessible in the React app.

## License

This project is part of the AWS Serverless CRUD tutorial.
