// Product Curation Agent
// This agent reads Google Cloud product evaluation data from an Excel file
// and responds to user queries about products

import express from 'express';
import bodyParser from 'body-parser';
import * as XLSX from 'xlsx';
import { VertexAI } from '@google-cloud/vertexai';
import { LangChain } from 'langchain/chains';
import { StateGraph, StateGraphExecutor } from 'langchain/graphs';
import fs from 'fs';
import path from 'path';

// Interfaces
interface ProductData {
  productId: string;
  productName: string;
  category: string;
  description: string;
  features: ProductFeature[];
  overallScore: number;
}

interface ProductFeature {
  featureName: string;
  description: string;
  weightage: number;
  score: number;
}

interface AgentState {
  products: ProductData[];
  currentQuery: string;
  currentContext: string[];
  relevantProducts: string[];
  responseRequired: boolean;
  conversation: ConversationItem[];
}

interface ConversationItem {
  role: 'user' | 'assistant';
  content: string;
}

// LLM Configuration
const PROJECT_ID = process.env.PROJECT_ID || 'your-google-cloud-project-id';
const LOCATION = process.env.LOCATION || 'us-central1';
const MODEL_NAME = process.env.MODEL_NAME || 'gemini-1.5-pro';

class ProductCurationAgent {
  private state: AgentState;
  private vertexAI: VertexAI;
  private generationConfig: any;
  private model: any;
  private excelFilePath: string;
  private stateGraph: StateGraph;
  private executor: StateGraphExecutor;

  constructor(excelFilePath: string) {
    this.excelFilePath = excelFilePath;
    
    // Initialize state
    this.state = {
      products: [],
      currentQuery: '',
      currentContext: [],
      relevantProducts: [],
      responseRequired: false,
      conversation: []
    };
    
    // Initialize Vertex AI
    this.vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION
    });
    
    this.generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048
    };
    
    this.model = this.vertexAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: this.generationConfig
    });
    
    // Create state graph
    this.stateGraph = this.buildStateGraph();
    this.executor = new StateGraphExecutor(this.stateGraph);
  }
  
  private buildStateGraph(): StateGraph {
    const graph = new StateGraph();
    
    // Define nodes
    graph.addNode("loadData", async (state: AgentState) => {
      console.log("Loading Excel data...");
      state.products = await this.loadExcelData();
      return { state };
    });
    
    graph.addNode("processQuery", async (state: AgentState) => {
      console.log("Processing query:", state.currentQuery);
      
      // Generate context for the query
      state.currentContext = await this.generateQueryContext(state.currentQuery, state.products);
      
      // Find relevant products for the query
      state.relevantProducts = await this.findRelevantProducts(state.currentQuery, state.products);
      
      return { state };
    });
    
    graph.addNode("generateResponse", async (state: AgentState) => {
      console.log("Generating response...");
      
      const response = await this.generateLLMResponse(
        state.currentQuery,
        state.currentContext,
        state.relevantProducts,
        state.products,
        state.conversation
      );
      
      // Update conversation history
      state.conversation.push({ role: 'user', content: state.currentQuery });
      state.conversation.push({ role: 'assistant', content: response });
      
      // Reset for next query
      state.currentQuery = '';
      state.responseRequired = false;
      
      return { state, response };
    });
    
    // Define edges
    graph.addEdge("start", "loadData");
    graph.addEdge("loadData", "processQuery");
    graph.addEdge("processQuery", "generateResponse");
    graph.addEdge("generateResponse", "end");
    
    graph.setEntryPoint("start");
    
    return graph;
  }
  
  private async loadExcelData(): Promise<ProductData[]> {
    try {
      console.log(`Reading Excel file: ${this.excelFilePath}`);
      const workbook = XLSX.readFile(this.excelFilePath);
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      console.log(`Loaded ${rawData.length} rows of data`);
      
      // Process into structured product data
      const products: ProductData[] = [];
      const productMap = new Map<string, ProductData>();
      
      for (const row of rawData) {
        // Assuming the Excel has columns: productId, productName, category, description, featureName, featureDescription, weightage, score
        const productId = row['productId'] as string;
        
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            productName: row['productName'] as string,
            category: row['category'] as string,
            description: row['description'] as string,
            features: [],
            overallScore: 0
          });
        }
        
        const product = productMap.get(productId)!;
        
        // Add feature
        if (row['featureName']) {
          const feature: ProductFeature = {
            featureName: row['featureName'] as string,
            description: row['featureDescription'] as string,
            weightage: parseFloat(row['weightage'] as string) || 0,
            score: parseFloat(row['score'] as string) || 0
          };
          
          product.features.push(feature);
        }
      }
      
      // Calculate overall scores and finalize products
      for (const [_, product] of productMap.entries()) {
        let totalWeightedScore = 0;
        let totalWeightage = 0;
        
        for (const feature of product.features) {
          totalWeightedScore += feature.score * feature.weightage;
          totalWeightage += feature.weightage;
        }
        
        product.overallScore = totalWeightage > 0 ? totalWeightedScore / totalWeightage : 0;
        products.push(product);
      }
      
      console.log(`Processed ${products.length} products with their features`);
      return products;
    } catch (error) {
      console.error("Error loading Excel data:", error);
      throw new Error(`Failed to load Excel data: ${error}`);
    }
  }
  
  private async generateQueryContext(query: string, products: ProductData[]): Promise<string[]> {
    // Analyze the query to determine what context is needed
    const prompt = `
      Given the following user query about Google Cloud products:
      "${query}"
      
      Identify what types of information would be most relevant to provide helpful context.
      Consider:
      1. Product categories mentioned
      2. Features or functionality referenced
      3. Comparison requirements
      4. Recommendation needs
      
      Return a list of 3-5 key information types needed to answer this query accurately.
    `;
    
    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const responseText = result.response.candidates[0].content.parts[0].text;
    
    // Extract context types
    const contextTypes = responseText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    
    return contextTypes;
  }
  
  private async findRelevantProducts(query: string, products: ProductData[]): Promise<string[]> {
    // Create a product summary for the LLM to reason over
    const productSummaries = products.map(p => 
      `- ${p.productName} (ID: ${p.productId}): ${p.description.substring(0, 100)}... [Category: ${p.category}, Score: ${p.overallScore.toFixed(2)}]`
    ).join('\n');
    
    const prompt = `
      Given the following user query about Google Cloud products:
      "${query}"
      
      And this list of available products:
      ${productSummaries}
      
      Return ONLY the product IDs that are most relevant to the query, separated by commas.
      If no specific products are relevant, return "ALL".
    `;
    
    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    const responseText = result.response.candidates[0].content.parts[0].text.trim();
    
    if (responseText === "ALL") {
      return products.map(p => p.productId);
    }
    
    return responseText.split(',').map(id => id.trim());
  }
  
  private async generateLLMResponse(
    query: string, 
    context: string[], 
    relevantProductIds: string[],
    allProducts: ProductData[],
    conversationHistory: ConversationItem[]
  ): Promise<string> {
    // Get relevant products
    const relevantProducts = allProducts.filter(p => relevantProductIds.includes(p.productId));
    
    // Format product details for the prompt
    const productDetails = relevantProducts.map(p => {
      const featureDetails = p.features.map(f => 
        `    - ${f.featureName} (Weight: ${f.weightage.toFixed(2)}, Score: ${f.score.toFixed(2)}): ${f.description}`
      ).join('\n');
      
      return `
Product: ${p.productName} (ID: ${p.productId})
Category: ${p.category}
Overall Score: ${p.overallScore.toFixed(2)}
Description: ${p.description}
Features:
${featureDetails}
      `;
    }).join('\n\n');
    
    // Format conversation history
    const historyText = conversationHistory.map(item => 
      `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`
    ).join('\n\n');
    
    const systemPrompt = `
You are a Product Curation Agent specializing in Google Cloud products. 
You have access to detailed evaluation data for these products, including features, weightage scores, and overall ratings.
Your goal is to provide helpful, accurate information about these products based on the evaluation data provided.

IMPORTANT GUIDELINES:
- Base your responses strictly on the product data provided
- Be concise and specific in your answers
- If comparing products, highlight key differences in features and scores
- If recommending products, explain the reasoning based on evaluation scores
- If a query is unclear, ask for clarification
- Do not fabricate information about products not in the data provided
- Use score and weightage data to support your statements

CURRENT CONTEXT NEEDS: ${context.join(', ')}
    `;
    
    const userPrompt = `
CONVERSATION HISTORY:
${historyText}

PRODUCT DATA:
${productDetails}

USER QUERY: ${query}

Please provide a helpful response to the user query based on the product evaluation data.
    `;
    
    const result = await this.model.generateContent({
      contents: [
        { role: "system", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ]
    });
    
    return result.response.candidates[0].content.parts[0].text;
  }
  
  public async processQuery(query: string): Promise<string> {
    // Set the query in state
    this.state.currentQuery = query;
    this.state.responseRequired = true;
    
    // Execute the state graph
    const result = await this.executor.execute({
      state: this.state
    });
    
    return result.response as string;
  }
  
  public async initialize(): Promise<void> {
    // Load data on initialization
    this.state.products = await this.loadExcelData();
    console.log(`Initialized with ${this.state.products.length} products`);
  }
}

// Express server setup
const app = express();
app.use(bodyParser.json());

// Create the agent
const excelFilePath = path.join(__dirname, 'product_evaluation.xlsx');
const productAgent = new ProductCurationAgent(excelFilePath);

// Initialize the agent before starting the server
(async () => {
  try {
    await productAgent.initialize();
    console.log('Product Curation Agent initialized successfully');
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    process.exit(1);
  }
})();

// API Routes
app.post('/api/agent/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }
    
    const response = await productAgent.processQuery(query);
    return res.json({ response });
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({ error: 'Failed to process query' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Product Curation Agent server running on port ${PORT}`);
});

export { ProductCurationAgent };
