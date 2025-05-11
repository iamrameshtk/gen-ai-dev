# Product Curation Agent - Project Structure Explanation

## Root Directory

- **`.env`**: Contains environment variables such as Google Cloud credentials, API endpoints, and configuration settings
- **`package.json`**: Defines your project dependencies, scripts, and metadata
- **`tsconfig.json`**: TypeScript compiler configuration
- **`README.md`**: Overview documentation for the project

## Source Code Organization (`src/`)

### Core Files

- **`index.ts`**: The entry point that initializes and starts the application
- **`agent.ts`**: The main Product Curation Agent class implementation
- **`server.ts`**: Express server setup and configuration

### Modular Components

- **`config/`**: Configuration modules
  - **`llm.ts`**: Settings for Vertex AI and model parameters
  - **`server.ts`**: Express server and API configuration

- **`types/`**: TypeScript interfaces and type definitions
  - **`product.ts`**: Product and feature data structures
  - **`state.ts`**: Agent state management interfaces

- **`services/`**: Core functionality services
  - **`excel-processor.ts`**: Excel file reading and data transformation
  - **`llm-service.ts`**: LLM interaction and prompt construction
  - **`state-graph.ts`**: LangGraph state management implementation

- **`routes/`**: API endpoint definitions
  - **`agent-routes.ts`**: Product Curation Agent API handlers

- **`utils/`**: Helper utilities
  - **`error-handler.ts`**: Centralized error handling
  - **`logging.ts`**: Logging configuration and utilities

## Data and Documentation

- **`data/`**: Resource files
  - **`product_evaluation.xlsx`**: The Excel data source for product information

- **`docs/`**: Project documentation
  - **`agent.md`**: Detailed breakdown of the agent implementation
  - **`diagrams/`**: Visual representations
    - **`workflow.mmd`**: Mermaid source code for the workflow diagram
    - **`workflow.svg`**: Rendered SVG of the workflow for presentations

## Build Output

- **`dist/`**: Compiled JavaScript files (generated)

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Scalability**: Easy to add new components as the project grows
3. **Maintainability**: Smaller, focused files are easier to understand and modify
4. **Testability**: Modular structure facilitates unit testing
5. **Documentation**: Organized documentation with both code explanations and visual diagrams

## Code Organization Approach

This structure follows the principles of:

- **Modularity**: Breaking functionality into cohesive units
- **Single Responsibility**: Each file has a clear, specific purpose
- **Clear Dependencies**: Explicit import/export relationships between modules
- **Logical Grouping**: Related functionality is grouped together

These organizational principles will make it easier to onboard new developers, maintain the codebase, and extend functionality as requirements evolve.
