# Product Curation Agent - Setup & Validation Guide

## Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Google Cloud account with Vertex AI API enabled
- Postman or similar API testing tool

## Setup Steps

### 1. Project Setup

```bash
# Create a new directory for your project
mkdir product-curation-agent
cd product-curation-agent

# Initialize a new npm project
npm init -y

# Install dependencies
npm install express body-parser xlsx @google-cloud/vertexai langchain typescript ts-node dotenv
npm install --save-dev @types/express @types/node
```

### 2. Create Project Structure

```bash
# Create necessary directories
mkdir src
mkdir data
```

### 3. Create TypeScript Configuration

Create a `tsconfig.json` file in the root directory:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "lib": ["ES2022"],
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 4. Environment Setup

Create a `.env` file in the root directory:

```
PROJECT_ID=your-google-cloud-project-id
LOCATION=us-central1
MODEL_NAME=gemini-1.5-pro
PORT=3000
```

### 5. Google Cloud Authentication

Make sure you have authenticated with Google Cloud:

```bash
# Install Google Cloud SDK if not already installed
# Then authenticate
gcloud auth application-default login
```

### 6. Prepare your Excel File

Place your Google Cloud product evaluation Excel file in the `data` directory with the name `product_evaluation.xlsx`. The file should have at least the following columns:
- productId
- productName
- category
- description
- featureName
- featureDescription
- weightage
- score

### 7. Source Code

Create a file `src/index.ts` and paste the provided TypeScript code from the artifact above.

Update the file path to your Excel file in the code if necessary:

```typescript
const excelFilePath = path.join(__dirname, '../data/product_evaluation.xlsx');
```

### 8. Build and Run

```bash
# Compile TypeScript
npx tsc

# Run the compiled JavaScript
node dist/index.js

# Alternatively, run with ts-node
npx ts-node src/index.ts
```

## Validation with Postman

### 1. Health Check Request

- **Method**: GET
- **URL**: `http://localhost:3000/api/health`
- Click Send
- Expected response: `{ "status": "ok" }`

### 2. Simple Query Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/agent/query`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "query": "What is the highest rated Google Cloud product in the database?"
  }
  ```
- Click Send
- Expected response: JSON with a response field containing the agent's answer

### 3. Comparison Query Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/agent/query`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "query": "Compare the features of BigQuery and Cloud Storage in terms of data management capabilities."
  }
  ```
- Click Send
- Expected response: JSON with a detailed comparison

### 4. Recommendation Query Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/agent/query`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "query": "What Google Cloud product would you recommend for real-time data processing with high scalability needs?"
  }
  ```
- Click Send
- Expected response: JSON with product recommendations based on the evaluation data

## Troubleshooting Common Issues

### 1. Vertex AI API Not Enabled
- Error: "The Cloud Vertex AI API has not been used in project [PROJECT_ID] before..."
- Solution: Enable the Vertex AI API in your Google Cloud Console

### 2. Authentication Issues
- Error: "Could not load the default credentials"
- Solution: Run `gcloud auth application-default login` again

### 3. Excel File Issues
- Error: "Failed to load Excel data"
- Solution: Verify the Excel file path and format; ensure all required columns are present

### 4. Port Already in Use
- Error: "Error: listen EADDRINUSE: address already in use :::3000"
- Solution: Change the PORT in the .env file or kill the process using the port

## Integration with Front-End

To integrate this agent with a front-end application:

1. Enable CORS in your Express server by adding:
   ```typescript
   import cors from 'cors';
   app.use(cors());
   ```

2. Use fetch or axios in your front-end to make API calls to your agent:
   ```javascript
   // Example using fetch
   async function queryAgent(question) {
     const response = await fetch('http://localhost:3000/api/agent/query', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ query: question }),
     });
     const data = await response.json();
     return data.response;
   }
   ```

## Deployment Options

### 1. Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t product-curation-agent .
docker run -p 3000:3000 product-curation-agent
```

### 2. Google Cloud Run Deployment

```bash
# Build the Docker image
docker build -t gcr.io/[PROJECT_ID]/product-curation-agent .

# Push to Google Container Registry
docker push gcr.io/[PROJECT_ID]/product-curation-agent

# Deploy to Cloud Run
gcloud run deploy product-curation-agent \
  --image gcr.io/[PROJECT_ID]/product-curation-agent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```# Product Curation Agent - Setup & Validation Guide

## Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Google Cloud account with Vertex AI API enabled
- Postman or similar API testing tool

## Setup Steps

### 1. Project Setup

```bash
# Create a new directory for your project
mkdir product-curation-agent
cd product-curation-agent

# Initialize a new npm project
npm init -y

# Install dependencies
npm install express body-parser xlsx @google-cloud/vertexai langchain typescript ts-node dotenv
npm install --save-dev @types/express @types/node
```

### 2. Create Project Structure

```bash
# Create necessary directories
mkdir src
mkdir data
```

### 3. Create TypeScript Configuration

Create a `tsconfig.json` file in the root directory:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "lib": ["ES2022"],
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 4. Environment Setup

Create a `.env` file in the root directory:

```
PROJECT_ID=your-google-cloud-project-id
LOCATION=us-central1
MODEL_NAME=gemini-1.5-pro
PORT=3000
```

### 5. Google Cloud Authentication

Make sure you have authenticated with Google Cloud:

```bash
# Install Google Cloud SDK if not already installed
# Then authenticate
gcloud auth application-default login
```

### 6. Prepare your Excel File

Place your Google Cloud product evaluation Excel file in the `data` directory with the name `product_evaluation.xlsx`. The file should have at least the following columns:
- productId
- productName
- category
- description
- featureName
- featureDescription
- weightage
- score

### 7. Source Code

Create a file `src/index.ts` and paste the provided TypeScript code from the artifact above.

Update the file path to your Excel file in the code if necessary:

```typescript
const excelFilePath = path.join(__dirname, '../data/product_evaluation.xlsx');
```

### 8. Build and Run

```bash
# Compile TypeScript
npx tsc

# Run the compiled JavaScript
node dist/index.js

# Alternatively, run with ts-node
npx ts-node src/index.ts
```

## Validation with Postman

### 1. Health Check Request

- **Method**: GET
- **URL**: `http://localhost:3000/api/health`
- Click Send
- Expected response: `{ "status": "ok" }`

### 2. Simple Query Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/agent/query`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "query": "What is the highest rated Google Cloud product in the database?"
  }
  ```
- Click Send
- Expected response: JSON with a response field containing the agent's answer

### 3. Comparison Query Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/agent/query`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "query": "Compare the features of BigQuery and Cloud Storage in terms of data management capabilities."
  }
  ```
- Click Send
- Expected response: JSON with a detailed comparison

### 4. Recommendation Query Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/agent/query`
- **Headers**: 
  - Key: `Content-Type`
  - Value: `application/json`
- **Body** (raw JSON):
  ```json
  {
    "query": "What Google Cloud product would you recommend for real-time data processing with high scalability needs?"
  }
  ```
- Click Send
- Expected response: JSON with product recommendations based on the evaluation data

## Troubleshooting Common Issues

### 1. Vertex AI API Not Enabled
- Error: "The Cloud Vertex AI API has not been used in project [PROJECT_ID] before..."
- Solution: Enable the Vertex AI API in your Google Cloud Console

### 2. Authentication Issues
- Error: "Could not load the default credentials"
- Solution: Run `gcloud auth application-default login` again

### 3. Excel File Issues
- Error: "Failed to load Excel data"
- Solution: Verify the Excel file path and format; ensure all required columns are present

### 4. Port Already in Use
- Error: "Error: listen EADDRINUSE: address already in use :::3000"
- Solution: Change the PORT in the .env file or kill the process using the port

## Integration with Front-End

To integrate this agent with a front-end application:

1. Enable CORS in your Express server by adding:
   ```typescript
   import cors from 'cors';
   app.use(cors());
   ```

2. Use fetch or axios in your front-end to make API calls to your agent:
   ```javascript
   // Example using fetch
   async function queryAgent(question) {
     const response = await fetch('http://localhost:3000/api/agent/query', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ query: question }),
     });
     const data = await response.json();
     return data.response;
   }
   ```

## Deployment Options

### 1. Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t product-curation-agent .
docker run -p 3000:3000 product-curation-agent
```

### 2. Google Cloud Run Deployment

```bash
# Build the Docker image
docker build -t gcr.io/[PROJECT_ID]/product-curation-agent .

# Push to Google Container Registry
docker push gcr.io/[PROJECT_ID]/product-curation-agent

# Deploy to Cloud Run
gcloud run deploy product-curation-agent \
  --image gcr.io/[PROJECT_ID]/product-curation-agent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
