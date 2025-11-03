# 🚀 Lambda Functions

This folder contains two AWS Lambda functions used in the **Dataset Recommendation Chatbot** project.

---

## 📂 Lambda Functions Overview

### **LF0 - Echo Test Function** 🧪

**Purpose:**  
A basic Lambda function designed for **initial testing** of API Gateway and S3 bucket integration. This function acts as an echo bot, returning the same message sent by the user.

**Functionality:**
- Extracts user message from incoming Lex events
- Handles multiple event formats (direct and wrapped in body)
- Returns echo response with proper CORS headers
- Useful for validating API Gateway and chatbot connectivity

**Use Case:**  
- Test API Gateway connectivity
- Verify S3 bucket hosting and integration
- Debug Lex integration with Lambda
- Quick validation of chatbot infrastructure

**File:** `LF0.py`

---

### **LF1 - Main Chatbot Function** 🤖

**Purpose:**  
The **core Lambda function** that powers the chatbot's dataset recommendation capabilities. This function handles user intents, integrates with multiple data sources (HuggingFace & Kaggle), manages DynamoDB interactions, and sends email notifications via SNS.

**Key Features:**
- ✅ User onboarding & existence checks
- ✅ Conversation history retrieval from DynamoDB
- ✅ Multi-source dataset search (HuggingFace & Kaggle APIs)
- ✅ Dynamic filtering by topic, format, and date
- ✅ DynamoDB storage for requests and results
- ✅ SQS integration for asynchronous processing
- ✅ SNS email notifications with formatted dataset results
- ✅ Comprehensive error handling

**Main Functions:**
- `search_huggingface_datasets()` - Query HuggingFace dataset API
- `search_kaggle_datasets()` - Query Kaggle dataset API (requires authentication)
- `store_request_in_dynamodb()` - Save user requests and results
- `send_to_sqs()` - Queue messages for async processing
- `send_email_notification()` - Send formatted email with datasets found

**File:** `LF1.py`

---

## ⚙️ Setup Instructions

### **For LF0 (Echo Test Function):**
1. Deploy `LF0.py` to AWS Lambda.
2. Configure an IAM role (basic Lambda execution role is sufficient).
3. Connect it to your API Gateway endpoint.
4. Test the integration by sending a message through your chatbot interface.
5. Verify CORS headers are properly returned.

---

### **For LF1 (Main Chatbot Function):**

#### **⚠️ CRITICAL: Update Environment Variables**

Before deploying `LF1.py`, you **MUST replace** all environment variable values in the AWS Lambda console with your own custom values:

| Environment Variable | Description | Example |
|---------------------|-------------|---------|
| `HF_TOKEN` | Your HuggingFace API token for dataset queries | `hf_xxxxxxxxxxxxxxxxxxxx` |
| `KAGGLE_USERNAME` | Your Kaggle username for authentication | `your_kaggle_username` |
| `KAGGLE_KEY` | Your Kaggle API key | `your_kaggle_api_key` |
| `SNS_TOPIC_ARN` | ARN of your SNS topic for email notifications | `arn:aws:sns:us-east-1:123456789:ChatbotNotifications` |
| `SQS_QUEUE_URL` | URL of your SQS queue for async processing | `https://sqs.us-east-1.amazonaws.com/123456789/ChatbotQueue` |

#### **Obtaining API Keys:**

**HuggingFace Token:**
- Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
- Create a new token with "read" access
- Copy the token and paste it as `HF_TOKEN`

**Kaggle API Key:**
- Go to [Kaggle Settings > API](https://www.kaggle.com/settings/account)
- Click "Create New API Token"
- Extract `username` and `key` from the downloaded `kaggle.json` file

#### **AWS Resources Required:**

Before deployment, ensure you have created:
1. **DynamoDB Table:** `ChatbotData`
   - Primary Key: `RequestID` (String)
   - Additional attributes: `userID`, `timestamp`, `email`, `topic`, `datasets`

2. **SNS Topic:** For email notifications
   - Subscribe email address(es) to the topic

3. **SQS Queue:** For asynchronous message processing

4. **IAM Role:** With permissions for:
   - `dynamodb:Query`, `dynamodb:Scan`, `dynamodb:PutItem`
   - `sns:Publish`
   - `sqs:SendMessage`
   - Basic Lambda execution permissions

#### **Deployment Steps:**
1. Deploy `LF1.py` to AWS Lambda.
2. Configure the environment variables in the Lambda console under **Configuration > Environment variables**.
3. Attach the IAM role with required permissions.
4. Set memory and timeout appropriately:
   - Recommended Memory: 512 MB
   - Recommended Timeout: 30 seconds
5. Connect the Lambda function to Amazon Lex as a fulfillment handler.
6. Test the chatbot functionality through your web interface.

---

## 📋 Input/Output Format

### **LF0 Input (from Lex):**
```json
{
  "messages": [
    {
      "unstructured": {
        "text": "Hello, I need a dataset"
      }
    }
  ]
}
```

### **LF0 Output:**
```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  },
  "body": "{\"response\": \"You said: Hello, I need a dataset\"}"
}
```

### **LF1 Input (from Lex):**
```json
{
  "sessionState": {
    "intent": {
      "slots": {
        "userID": {"value": {"interpretedValue": "user123"}},
        "topic": {"value": {"interpretedValue": "machine learning"}},
        "source": {"value": {"interpretedValue": "huggingface"}},
        "format": {"value": {"interpretedValue": "csv"}},
        "date": {"value": {"interpretedValue": "any"}},
        "name": {"value": {"interpretedValue": "John Doe"}},
        "email": {"value": {"interpretedValue": "john@example.com"}}
      }
    }
  }
}
```

### **LF1 Output:**
```json
{
  "messages": [
    {
      "content": "Found 5 dataset(s) for 'machine learning'. See links below."
    }
  ],
  "datasets": [
    {
      "name": "Dataset Name",
      "url": "https://huggingface.co/datasets/...",
      "downloads": 15000,
      "description": "Dataset description..."
    }
  ]
}
```

---

## 🛠️ Tech Stack

- **AWS Lambda** - Serverless compute
- **Python 3.x** - Programming language
- **Amazon Lex** - Natural language understanding & chatbot interface
- **API Gateway** - REST API endpoint
- **DynamoDB** - NoSQL database for storing requests & history
- **SNS (Simple Notification Service)** - Email notifications
- **SQS (Simple Queue Service)** - Asynchronous message processing
- **S3** - Static file hosting for web interface
- **HuggingFace API** - Primary dataset source
- **Kaggle API** - Secondary dataset source

---

## 🔍 Testing & Debugging

### **Test LF0:**
```bash
aws lambda invoke --function-name LF0 --payload '{"messages":[{"unstructured":{"text":"hello"}}]}' response.json
cat response.json
```

### **Test LF1 (User Check):**
```bash
aws lambda invoke --function-name LF1 --payload '{"checkUser":true,"userID":"user123"}' response.json
cat response.json
```

### **View Logs:**
```bash
aws logs tail /aws/lambda/LF1 --follow
```

---

## 📝 Notes & Best Practices

- ✅ Always test with **LF0** first to ensure your infrastructure is properly configured
- ✅ Keep your API keys and credentials **secure** - never hardcode them in your Lambda code
- ✅ Use environment variables for all sensitive configuration values
- ✅ Monitor Lambda logs in CloudWatch for debugging and error tracking
- ✅ For Kaggle integration, ensure your account has an active API token
- ✅ Test email notifications by subscribing to your SNS topic
- ✅ Monitor DynamoDB for request storage and query performance
- ✅ Set up CloudWatch alarms for Lambda errors and timeouts

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| `HF_TOKEN` not found | Ensure environment variable is set in Lambda > Configuration |
| Kaggle API error | Verify `KAGGLE_USERNAME` and `KAGGLE_KEY` are correct |
| DynamoDB errors | Check table name is `ChatbotData` and IAM role has DynamoDB permissions |
| Email not received | Confirm SNS topic subscription and check spam folder |
| SQS message fails | Verify SQS_QUEUE_URL is correct and IAM has `sqs:SendMessage` permission |

---

## 📧 Contact

For questions or issues, please refer to the main project documentation or reach out to the project maintainer.

---

**Happy Coding!** 💻✨
