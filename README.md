# Dataset-Concierge-Bot

A serverless chatbot application built with AWS services that helps users search for and retrieve datasets from popular data sources like Kaggle and HuggingFace. The chatbot provides an interactive conversational interface to guide users through the dataset discovery and retrieval process.

## 📋 Overview

**Dataset-Concierge-Bot** is a full-stack application that combines cloud infrastructure with an intuitive frontend interface. It uses AWS services for backend processing and a JavaScript-based frontend for user interaction. The chatbot intelligently guides users through searching for datasets, selecting formats, and specifying preferences like data sources and dates.

## ✨ Features

- **Interactive Chatbot Interface**: Conversational UI that guides users through the dataset search process
- **Multi-Source Dataset Integration**: Supports dataset retrieval from:
  - HuggingFace Datasets
  - Kaggle Datasets
- **Multiple Format Support**: Download datasets in CSV, JSON, or multiple formats
- **User Personalization**: Tracks user information and preferences for personalized responses
- **Hyperlinked Dataset Recommendations**: Direct clickable links to dataset sources
- **Serverless Architecture**: Fully scalable AWS-based backend
- **Real-time Notifications**: Email notifications via SNS for dataset retrieval status
- **Asynchronous Processing**: Background job processing with SQS and Lambda

## 🏗️ Architecture

### AWS Services Used

| Service | Purpose |
|---------|---------|
| **Amazon S3** | Dataset storage and file management |
| **AWS Lambda** | Serverless compute for backend logic and API integrations |
| **Amazon API Gateway** | REST API endpoint for frontend-backend communication |
| **Amazon Lex** | Natural Language Understanding for chatbot conversation management |
| **Amazon SNS** | Email notifications for users |
| **Amazon SQS** | Message queue for asynchronous dataset processing tasks |

### Project Structure

```
Dataset-Concierge-Bot/
├── API-Gateway/
│   ├── aics-swagger.yaml          # API Gateway Swagger/OpenAPI definition
│   └── README.md                   # API Gateway documentation
│
├── Chatbot-js/
│   └── chat.js                     # Lex chatbot JavaScript integration
│
├── Frontend/
│   ├── assets/                     # Images, icons, and static files
│   ├── .gitignore                 # Git ignore file
│   ├── index.html                 # Main HTML chatbot interface
│   └── README.md                   # Frontend documentation
│
├── Lambda_Codes/
│   ├── LF0                        # Lambda Function 0 - Lex Intent Fulfillment
│   ├── LF1                        # Lambda Function 1 - API & Data Processing
│   └── README.md                   # Lambda functions documentation
│
├── LexBot/
│   ├── DatasetGatherBot-DRAFT-WGQCU2MNXE-LexJson.zip  # Lex Bot Export
│   └── README.md                   # Lex Bot documentation
│
└── README.md                       # This file (Main Project Documentation)
```

## 🚀 Getting Started

### Prerequisites

- AWS Account with appropriate IAM permissions
- Python 3.9+ (for Lambda functions)
- Git and GitHub account
- Node.js and npm (for local testing)
- Kaggle API credentials
- HuggingFace API token (optional)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Dataset-Concierge-Bot.git
cd Dataset-Concierge-Bot
```

### Step 2: AWS Service Configuration

#### A. Configure Lex Bot

1. Navigate to `LexBot/` directory
2. Go to AWS Lex Console
3. Create a new bot or import from the zip file: `DatasetGatherBot-DRAFT-WGQCU2MNXE-LexJson.zip`
4. Define the following intents:
   - **SearchDataset**: Initiates dataset search
   - **SelectSource**: Choose between Kaggle or HuggingFace
   - **SelectFormat**: Choose data format (CSV, JSON, Any)
   - **GetHelp**: Display help information

#### B. Deploy Lambda Functions

##### Lambda Function 0 (LF0) - Intent Fulfillment
```bash
cd Lambda_Codes/LF0
pip install -r requirements.txt
zip -r LF0.zip .
aws lambda create-function --function-name DatasetBot-LF0 \
  --runtime python3.9 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://LF0.zip
```

##### Lambda Function 1 (LF1) - API Integration & Processing
```bash
cd ../LF1
pip install -r requirements.txt
zip -r LF1.zip .
aws lambda create-function --function-name DatasetBot-LF1 \
  --runtime python3.9 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://LF1.zip
```

#### C. Configure API Gateway

1. Navigate to `API-Gateway/` directory
2. Go to AWS API Gateway Console
3. Import the API from `aics-swagger.yaml`:
   ```bash
   aws apigateway import-rest-api \
     --body file://aics-swagger.yaml
   ```
4. Create resources and methods:
   - `POST /chat` → Lambda Integration (LF0)
   - `GET /datasets` → Lambda Integration (LF1)
4. Enable CORS for frontend communication
5. Deploy to a stage (e.g., `prod`)

#### D. Set Up SNS for Email Notifications

```bash
# Create SNS Topic
aws sns create-topic --name dataset-bot-notifications

# Subscribe to receive emails
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:dataset-bot-notifications \
  --protocol email \
  --notification-endpoint your-email@example.com
```

#### E. Configure SQS Queue

```bash
# Create SQS Queue for async processing
aws sqs create-queue --queue-name dataset-processing-queue

# Get queue URL (needed for Lambda environment variables)
aws sqs get-queue-url --queue-name dataset-processing-queue
```

#### F. Create S3 Bucket

```bash
# Create bucket
aws s3api create-bucket --bucket dataset-concierge-bot-data \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket dataset-concierge-bot-data \
  --versioning-configuration Status=Enabled
```

### Step 3: Lambda Environment Variables

Set these environment variables for both Lambda functions:

```
KAGGLE_API_KEY=your_kaggle_api_key
KAGGLE_USERNAME=your_kaggle_username
HUGGINGFACE_API_KEY=your_huggingface_token
S3_BUCKET_NAME=dataset-concierge-bot-data
SNS_TOPIC_ARN=arn:aws:sns:region:account-id:dataset-bot-notifications
SQS_QUEUE_URL=https://sqs.region.amazonaws.com/account-id/dataset-processing-queue
LEX_BOT_NAME=DatasetGatherBot
LEX_BOT_ALIAS=PROD
```

### Step 4: Frontend Setup

1. Navigate to `Frontend/` directory
2. Update `index.html` with your API Gateway endpoint:
```html
<script>
  const API_ENDPOINT = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/chat';
  const LEX_BOT_NAME = 'DatasetGatherBot';
  const LEX_BOT_ALIAS = 'PROD';
</script>
```

3. Add your chatbot screenshots to `Frontend/assets/images/`

4. Deploy frontend to AWS S3:
```bash
aws s3 sync . s3://your-frontend-bucket/ --exclude ".git*"
aws s3 website s3://your-frontend-bucket/ \
  --index-document index.html \
  --error-document index.html
```

5. Local testing:
```bash
cd Frontend
python -m http.server 8000
# Visit http://localhost:8000
```

## 📁 Detailed Component Documentation

### API-Gateway Directory
Contains the API Gateway configuration:
- **aics-swagger.yaml**: OpenAPI/Swagger definition for all API endpoints
- **README.md**: Detailed API documentation with endpoint descriptions

### Chatbot-js Directory
- **chat.js**: JavaScript client library for integrating AWS Lex bot into frontend

### Frontend Directory
- **index.html**: Main chat interface HTML
- **assets/**: Folder for images and static resources
- **.gitignore**: Files to exclude from git tracking
- **README.md**: Frontend-specific setup and customization guide

### Lambda_Codes Directory
- **LF0**: Primary Lambda function handling Lex intent fulfillment and conversation logic
- **LF1**: Secondary Lambda function handling API calls to HuggingFace and Kaggle
- **README.md**: Lambda function implementation details

### LexBot Directory
- **DatasetGatherBot-DRAFT-WGQCU2MNXE-LexJson.zip**: Exported Lex bot definition (can be imported to AWS console)
- **README.md**: Lex bot intents and conversation flow documentation

## 💬 Chatbot Usage Guide

### Example Conversation Flow

### 1: Main Chatbot Interface

![Chatbot Main Interface](./images/Screenshot%202025-11-14%20at%2010.56.08 AM.png)


### 2: Dataset Search Flow

![Dataset Search Flow](./images/Screenshot%202025-11-14%20at%2010.56.17 AM.png)

### 3: Dataset Results with Links

![Dataset Results with Hyperlinks](./images/Screenshot%202025-11-14%20at%2010.56.27 AM.png)

### Commands

| Command | Function |
|---------|----------|
| `search for a dataset` | Initiate dataset search |
| `show my saved links` | View previous search results |
| `about` | Learn what the bot can do |
| `restart` | Start conversation over |
| `help` | Display available commands |
| `change [slot]` | Edit previous responses |

## 🔗 API Integration Details

### HuggingFace Datasets Integration

**Setup**:
1. Create HuggingFace account at [huggingface.co](https://huggingface.co)
2. Generate API token from Settings → Access Tokens
3. Set environment variable: `HUGGINGFACE_API_KEY=your_token`

**Features**:
- Search datasets by keyword
- Access community-contributed datasets
- Download in multiple formats (Parquet, CSV, JSON)

**Lambda Implementation** (LF1):
```python
import requests

def search_huggingface_datasets(topic, num_results=10):
    headers = {'Authorization': f'Bearer {HUGGINGFACE_API_KEY}'}
    url = 'https://huggingface.co/api/datasets'
    params = {'search': topic, 'sort': 'downloads', 'direction': -1}
    response = requests.get(url, headers=headers, params=params)
    datasets = response.json()
    return [
        {
            'name': d['name'],
            'description': d.get('description', ''),
            'url': f"https://huggingface.co/datasets/{d['name']}",
            'downloads': d.get('downloads', 0)
        }
        for d in datasets[:num_results]
    ]
```

### Kaggle API Integration

**Setup**:
1. Create Kaggle account at [kaggle.com](https://www.kaggle.com)
2. Download API credentials from Account → API
3. Place `kaggle.json` in `~/.kaggle/` directory
4. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`
5. Set environment variables:
   ```
   KAGGLE_USERNAME=your_username
   KAGGLE_API_KEY=your_api_key
   ```

**Features**:
- Search for datasets by topic
- Filter by file size, rating, and recency
- Batch download datasets
- Access competition datasets

**Lambda Implementation** (LF1):
```python
from kaggle.api.kaggle_api_extended import KaggleApi

def search_kaggle_datasets(topic, num_results=10):
    api = KaggleApi()
    api.authenticate()
    datasets = api.dataset_list(search=topic, sort_by='votes')
    return [
        {
            'name': d.name,
            'description': d.title,
            'url': f"https://www.kaggle.com/datasets/{d.ref}",
            'size': d.size
        }
        for d in datasets[:num_results]
    ]
```

## 📸 Adding Screenshots to Your Project

### Step 1: Organize Your Images

```bash
# Navigate to Frontend folder
cd Frontend

# Create images directory
mkdir -p assets/images

# Copy your screenshots
cp ~/Downloads/Screenshot*.jpg assets/images/
cp ~/Downloads/chatbot_interface.jpg assets/images/
```

### Step 2: Add Images to README

Update this README with image references:

```markdown
## 🎨 Chatbot Interface Screenshots

### Main Chat Interface
![Chatbot Main Interface](./Frontend/assets/images/Screenshot-2025-11-14-at-10.56.08-AM.jpg)

### Dataset Search Flow
![Dataset Search](./Frontend/assets/images/Screenshot-2025-11-14-at-10.56.17-AM.jpg)

### Dataset Results with Links
![Dataset Results](./Frontend/assets/images/Screenshot-2025-11-14-at-10.56.27-AM.jpg)
```

### Step 3: Commit to Git

```bash
git add Frontend/assets/images/
git commit -m "Add chatbot interface screenshots"
git push origin main
```

## 🗂️ Supported Dataset Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| CSV | `.csv` | Tabular data, spreadsheets |
| JSON | `.json` | Semi-structured data, APIs |
| Parquet | `.parquet` | Big data, analytics |
| Any | Multiple | All available formats |

## 🛠️ Development & Deployment

### Local Development

```bash
# Install dependencies for Lambda functions
cd Lambda_Codes/LF0
pip install -r requirements.txt

cd ../LF1
pip install -r requirements.txt

# Test Lambda functions locally
sam local start-api

# Frontend development
cd ../../Frontend
python -m http.server 8000
```

### Deployment Checklist

- [ ] All Lambda functions deployed and tested
- [ ] API Gateway endpoints configured and CORS enabled
- [ ] Lex bot trained and published
- [ ] SNS topic created and subscriptions confirmed
- [ ] SQS queue configured
- [ ] S3 bucket created with proper permissions
- [ ] Environment variables set in Lambda
- [ ] Frontend API endpoint updated
- [ ] Frontend deployed to S3 or hosting service

### CI/CD Pipeline (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Lambda
        run: |
          cd Lambda_Codes/LF0 && zip -r ../LF0.zip . && cd ../..
          aws lambda update-function-code --function-name DatasetBot-LF0 --zip-file fileb://Lambda_Codes/LF0.zip
```

## 🐛 Troubleshooting

### Issue: Chatbot Not Responding
**Cause**: Lex bot not published or API endpoint incorrect
**Solution**:
```bash
# Verify Lex bot is published
aws lex-models get-bot --name DatasetGatherBot --version-or-alias PROD

# Check API Gateway is deployed
aws apigateway get-rest-apis
```

### Issue: Lambda Timeout (504 error)
**Cause**: Timeout too short for API calls
**Solution**:
```bash
# Increase timeout to 60 seconds
aws lambda update-function-configuration \
  --function-name DatasetBot-LF1 \
  --timeout 60
```

### Issue: SNS Emails Not Received
**Cause**: Subscription not confirmed
**Solution**:
1. Check email spam folder
2. Confirm subscription link in email
3. Verify topic ARN is correct:
```bash
aws sns get-topic-attributes \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:dataset-bot-notifications \
  --attribute-names All
```

### Issue: Kaggle/HuggingFace API Errors
**Cause**: Invalid credentials or rate limiting
**Solution**:
```bash
# Verify Kaggle credentials
kaggle datasets list -v

# Check HuggingFace token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://huggingface.co/api/datasets
```

### Issue: CORS Error in Frontend
**Cause**: API Gateway CORS not configured
**Solution**:
```bash
# Enable CORS in API Gateway
aws apigateway put-integration-response \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-templates '{"application/json": ""}'
```

## 📚 Dataset Sources

### HuggingFace Hub
- **URL**: [https://huggingface.co/datasets](https://huggingface.co/datasets)
- **Categories**: NLP, Computer Vision, Audio, Tabular Data, Multimodal
- **Community**: 100K+ datasets
- **License**: Open Source & Commercial

### Kaggle Datasets
- **URL**: [https://www.kaggle.com/datasets](https://www.kaggle.com/datasets)
- **Categories**: Finance, Sports, Social Media, Images, Time Series
- **Community**: 500K+ datasets
- **Access**: Free & Paid datasets

## 🚀 Performance Optimization

### Lambda Function Optimization
```python
# Use connection pooling for API calls
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry_strategy = Retry(total=3, backoff_factor=1)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)
```

### Frontend Caching
```javascript
// Cache frequently accessed datasets
localStorage.setItem('recentSearches', JSON.stringify(searches));
localStorage.setItem('savedDatasets', JSON.stringify(datasets));
```

### S3 Optimization
```bash
# Enable S3 Transfer Acceleration
aws s3api put-bucket-accelerate-configuration \
  --bucket dataset-concierge-bot-data \
  --accelerate-configuration Status=Enabled
```

## 🔒 Security Best Practices

- **API Keys**: Store in AWS Secrets Manager, not in code
- **Lambda Execution Role**: Use least privilege IAM policy
- **API Gateway**: Enable API keys and usage plans for rate limiting
- **CORS**: Restrict to trusted domains only
- **S3 Bucket**: Enable encryption and versioning
- **Lex**: Enable conversation logs for audit trail

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Future Enhancements

- [ ] Add support for Google Dataset Search
- [ ] Implement advanced data filtering and preprocessing
- [ ] User authentication with Cognito
- [ ] Dataset preview before download
- [ ] Batch dataset downloads
- [ ] Data quality metrics dashboard
- [ ] Machine learning model recommendations
- [ ] Multi-language support
- [ ] Private dataset support
- [ ] Dataset versioning and history

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Yatin Kande**
- Email: yatinrags@gmail.com
- GitHub: [@YatinKande](https://github.com/YatinKande)
- LinkedIn: [Yatin Kande](https://www.linkedin.com/in/yatin-kande)

## 🙏 Acknowledgments

- AWS Documentation for serverless best practices
- HuggingFace for comprehensive dataset APIs
- Kaggle for competition-driven datasets
- Open-source community for supporting libraries

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

For issues and questions, please open an [Issue](https://github.com/yourusername/Dataset-Concierge-Bot/issues) or contact via email.
