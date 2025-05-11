# Product Curation Agent - Setup Guide

This guide provides step-by-step instructions for setting up and running the Product Curation Agent.

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Google Cloud account with Vertex AI API enabled
- Your Google Cloud product evaluation data in Excel format

## 1. Project Setup

Create the project structure and initialize:

```bash
# Create project directory
mkdir product-curation-agent
cd product-curation-agent

# Initialize Git repository
git init

# Initialize npm project
npm init -y
```

## 2. Install Dependencies

```bash
# Install production dependencies
npm install express body-parser xlsx @google-cloud/vertexai dotenv cors langchain

# Install development dependencies
npm install --save-dev typescript ts-node @types/express @types/node @types/xlsx nodemon
```

## 3. TypeScript Configuration

Create a `tsconfig.json` file in the root directory:

```bash
# Generate tsconfig.json
npx tsc --init
```

Then update the `tsconfig.json` with these settings:

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

## 4. Directory Structure

Create the project directories:

```bash
# Create directories
mkdir -p src/config src/types src/services src/routes src/utils
mkdir -p data docs/diagrams dist
```

## 5. Environment Configuration

Create a `.env` file in the root directory:

```
PROJECT_ID=your-google-cloud-project-id
LOCATION=us-central1
MODEL_NAME=gemini-1.5-pro
PORT=3000
```

## 6. Google Cloud Authentication

Configure authentication for Google Cloud:

```bash
# Install Google Cloud SDK (if not already installed)
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth application-default login

# Set your project
gcloud config set project your-google-cloud-project-id

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

## 7. Add Your Excel Data

Place your Google Cloud product evaluation Excel file in the `data` directory:

```bash
cp /path/to/your/excel/file.xlsx data/product_evaluation.xlsx
```

Ensure your Excel file has the required columns:
- productId
- productName
- category
- description
- featureName
- featureDescription
- weightage
- score

## 8. Implement Core Files

Create the following files using the code provided in the artifacts:

1. `src/types/product.ts` - Product data interfaces
2. `src/types/state.ts` - Agent state interfaces
3. `src/config/llm.ts` - LLM configuration
4. `src/services/excel-processor.ts` - Excel data processing
5. `src/services/llm-service.ts` - LLM interaction logic
6. `src/services/state-graph.ts` - LangGraph implementation
7. `src/routes/agent-routes.ts` - Agent API endpoints
8. `src/agent.ts` - Product Curation Agent implementation
9. `src/server.ts` - Express server setup
10. `src/index.ts` - Application entry point

## 9. Create npm Scripts

Update your `package.json` to include these scripts:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "nodemon --exec ts-node src/index.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## 10. Build and Start the Server

```bash
# Build the TypeScript code
npm run build

# Run the server
npm start

# Alternatively, run in development mode with hot reloading
npm run dev
```

## 11. Verify Installation

Test the agent with a health check:

```bash
curl http://localhost:3000/api/health
```

You should receive: `{"status":"ok"}`

## 12. Test with Postman

1. Open Postman
2. Create a new POST request to `http://localhost:3000/api/agent/query`
3. Set the request body to raw JSON:
   ```json
   {
     "query": "What is the highest rated Google Cloud product in your database?"
   }
   ```
4. Send the request
5. You should receive a response with the agent's answer

## 13. Integration with Front-End

To call the API from a front-end application:

```javascript
async function queryProductAgent(question) {
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

## Troubleshooting

### Common Issues:

1. **Authentication Error**:
   - Error: "Could not load the default credentials"
   - Solution: Run `gcloud auth application-default login` again

2. **Excel File Error**:
   - Error: "Failed to load Excel data"
   - Solution: Check that your Excel file has the required columns and format

3. **Vertex AI API Error**:
   - Error: "API not enabled"
   - Solution: Enable the Vertex AI API in Google Cloud Console

4. **Port Already in Use**:
   - Error: "EADDRINUSE: address already in use :::3000"
   - Solution: Change the PORT in the .env file or terminate the process using port 3000

## Next Steps

1. Enhance error handling for robustness
2. Add unit tests for each module
3. Implement caching for improved performance
4. Create a user interface for interacting with the agent
5. Set up CI/CD pipeline for automated deployment
