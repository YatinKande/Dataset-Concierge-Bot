# 🔐 AWS SDK Configuration - JavaScript Setup Guide

This guide provides step-by-step instructions on how to generate an SDK from AWS API Gateway and integrate it with your web application by replacing the existing SDK file in `assets → js → sdk.js`.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Generate SDK from API Gateway](#generate-sdk-from-api-gateway)
3. [Replace SDK Files](#replace-sdk-files)
4. [Alternative Methods](#alternative-methods)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

| Step | Action |
|------|--------|
| 1️⃣ | Go to API Gateway Console → select API → Stages |
| 2️⃣ | Click **Stage actions** → **Generate SDK** → Select **JavaScript** |
| 3️⃣ | Download ZIP file |
| 4️⃣ | Extract and copy `apigClient.js` to `assets/js/sdk.js` |
| 5️⃣ | Update HTML script tag to reference new SDK |
| 6️⃣ | Test API calls in your application |

---

## 🔧 Generate SDK from API Gateway

### **Method 1: Using AWS Console (Easiest)**

#### Step 1: Open API Gateway Console

1. Log in to [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to **API Gateway** service
3. Select your REST API from the list

#### Step 2: Navigate to Stages

1. In the left sidebar, click **Stages**
2. Select your deployment stage (e.g., `prod`, `dev`, `test`)
3. You should see your stage listed with methods

#### Step 3: Generate JavaScript SDK

1. Click the **Stage actions** dropdown button
2. Select **Generate SDK**
3. In the dialog:
   - **Platform:** Select `JavaScript`
   - Leave other settings as default
4. Click **Generate SDK**

#### Step 4: Download the ZIP File

1. A ZIP file will start downloading automatically
2. Typical filename: `apigateway-js-sdk.zip`
3. Save to a known location on your computer

---

### **Method 2: Using AWS CLI (Faster)**

#### Step 1: Get Your API ID

```bash
# List all APIs to find yours
aws apigateway get-rest-apis --query 'items[*].[id,name]'

# Output example:
# udpuvvzbkc    MyDatasetChatbotAPI
# YOUR_API_ID is "udpuvvzbkc"
```

#### Step 2: Generate SDK via CLI

```bash
# Generate and download SDK directly
aws apigateway get-sdk \
  --rest-api-id YOUR_API_ID \
  --stage-name prod \
  --sdk-type javascript \
  sdk.zip

# Replace YOUR_API_ID with your actual API ID
# Replace prod with your stage name (dev, test, etc.)
```

#### Step 3: Extract the ZIP

```bash
unzip sdk.zip
```

---

## 📂 Replace SDK Files

### **Step 1: Backup Original File**

```bash
# Navigate to your project
cd your-project-directory

# Backup existing SDK
cp assets/js/sdk.js assets/js/sdk.js.backup
```

### **Step 2: Extract Generated SDK**

```bash
# Unzip the downloaded SDK
unzip apigateway-js-sdk.zip

# Directory structure:
# apigateway-js-sdk/
# ├── lib/
# │   ├── apigClient.js        ← Main SDK file
# │   └── AWS files
# ├── README.md
# └── package.json
```

### **Step 3: Copy SDK to Project**

**Option A: Copy main SDK file only**
```bash
cp apigateway-js-sdk/lib/apigClient.js assets/js/sdk.js
```

**Option B: Copy all SDK files**
```bash
cp -r apigateway-js-sdk/lib/* assets/js/
```

### **Step 4: Update HTML File**

**Before (Old SDK):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Chatbot</title>
    <script src="assets/js/old-sdk.js"></script>
</head>
<body>
    <!-- Your chatbot UI -->
</body>
</html>
```

**After (New SDK):**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Chatbot</title>
    <script src="assets/js/sdk.js"></script>
    <!-- Or if using apigClient.js -->
    <script src="assets/js/apigClient.js"></script>
</head>
<body>
    <!-- Your chatbot UI -->
</body>
</html>
```

### **Step 5: Verify File Structure**

```
your-project/
├── index.html
├── assets/
│   ├── js/
│   │   ├── sdk.js                    ← NEW API Gateway SDK
│   │   ├── sdk.js.backup             ← OLD SDK (backup)
│   │   ├── chatbot.js                ← Your chatbot code
│   │   └── apigClient.js             ← Alternative SDK file
│   └── css/
│       └── style.css
└── README.md
```

---

## 🔄 Alternative Methods

### **Method 3: Direct File Copy (No CLI)**

1. Generate SDK from console (Method 1)
2. Extract ZIP file on your computer
3. Manually copy `apigateway-js-sdk/lib/apigClient.js` to `assets/js/`
4. Rename to `sdk.js` if needed
5. Update HTML references

### **Method 4: Using npm (If Using Node.js)**

```bash
# If your project uses npm
npm install apigateway-js-sdk

# Then import in your JavaScript:
const apigClient = require('apigateway-js-sdk');
```

---

## 💻 Usage Examples

### **Initialize the SDK Client**

```javascript
// Create a new API Gateway client instance
var apigClient = apigClientFactory.newClient();
```

### **Make a POST Request to Your API**

```javascript
// Call your API endpoint
var params = {
  // Path parameters (if your API has them)
  // Example: resourceId: '12345'
};

var body = {
  // Your request payload
  userMessage: "Hello chatbot",
  userId: "user123"
};

var additionalParams = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// Send request to your API
apigClient.yourEndpointPost(params, body, additionalParams)
  .then(function(result) {
    console.log("API Response:", result);
    console.log("Status:", result.status);
    console.log("Data:", result.data);
  })
  .catch(function(error) {
    console.error("API Error:", error);
  });
```

### **Make a GET Request**

```javascript
var params = {
  // Query parameters (if any)
  userId: "user123"
};

apigClient.yourEndpointGet(params)
  .then(function(result) {
    console.log("Response:", result.data);
  })
  .catch(function(error) {
    console.error("Error:", error);
  });
```

### **Example: Send Message to Chatbot API**

```javascript
function sendMessageToChatbot(userMessage, userId) {
  var apigClient = apigClientFactory.newClient();
  
  var params = {};
  
  var body = {
    message: userMessage,
    userId: userId,
    timestamp: new Date().toISOString()
  };
  
  var additionalParams = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  apigClient.chatbotPost(params, body, additionalParams)
    .then(function(result) {
      console.log("Chatbot Response:", result.data);
      displayChatbotMessage(result.data.response);
    })
    .catch(function(error) {
      console.error("Chatbot Error:", error);
      displayErrorMessage("Failed to get response from chatbot");
    });
}
```

---

## 🐛 Troubleshooting

### **Issue: "apigClientFactory is not defined"**

**Solution:**
- Ensure `sdk.js` is loaded **before** your chatbot code
- Check HTML script tag:
  ```html
  <!-- Load SDK FIRST -->
  <script src="assets/js/sdk.js"></script>
  <!-- Then load your code -->
  <script src="assets/js/chatbot.js"></script>
  ```

### **Issue: "404 Resource Not Found"**

**Solution:**
- SDK file path may not exist in `assets/js/`
- Verify file was copied correctly:
  ```bash
  ls -la assets/js/sdk.js
  ```
- Check HTML file path matches actual file location

### **Issue: "CORS Error" in Browser Console**

**Solution:**
- Go to API Gateway Console → Your API → select stage
- Click **Method Response** → check status codes
- Click **Integration Response** → add CORS headers:
  ```
  Access-Control-Allow-Headers: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
  Access-Control-Allow-Methods: 'GET,POST,PUT,DELETE,OPTIONS'
  Access-Control-Allow-Origin: '*'
  ```

### **Issue: "Unauthorized" or "403 Forbidden"**

**Solution:**
- Check API Gateway authorization settings
- Verify API key in requests if required
- Check IAM permissions for Cognito Identity (if using)

### **Issue: SDK Methods Not Available**

**Solution:**
- Regenerate SDK after adding new API endpoints
- The SDK auto-generates methods based on your API resources
- Clear browser cache after updating SDK:
  ```bash
  # Browser dev tools: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
  # Select "Cookies and other site data"
  ```

---

## 📝 Important Notes

### ⚠️ After Every API Change:

1. **Update your API** (add/modify endpoints)
2. **Deploy to a stage** (e.g., `prod`, `dev`)
3. **Regenerate the SDK** from API Gateway
4. **Replace** the old `sdk.js` file
5. **Clear browser cache** before testing

### ✅ Best Practices:

- ✅ Always backup old SDK before replacing
- ✅ Version control your SDK (commit to Git)
- ✅ Test in development environment first
- ✅ Keep SDK file separate from your code
- ✅ Document API endpoints in your project README

### 🔗 API Endpoint Naming:

Your generated SDK methods follow this pattern:

```
{resourceName}{httpMethod}

Examples:
- chatbotPost()       → POST /chatbot
- datasetGet()        → GET /dataset
- userPut()           → PUT /user
- chatbotDelete()     → DELETE /chatbot
```

---

## 📚 Files to Keep Organized

```
assets/
├── js/
│   ├── sdk.js                    ← Generated API Gateway SDK
│   ├── chatbot.js                ← Your chatbot logic
│   ├── utils.js                  ← Utility functions
│   └── config.js                 ← Configuration (API base URL, etc.)
└── css/
    └── style.css
```

---


**For your Dataset Recommendation Chatbot**, this SDK will enable your web interface to communicate with your API Gateway endpoints, which trigger your Lambda functions (LF0 & LF1) and interact with Lex, DynamoDB, SNS, and other AWS services.

**Last Updated:** November 3, 2025
