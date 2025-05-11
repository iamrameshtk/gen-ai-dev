product-curation-agent/
│
├── .env                            # Environment variables
├── .gitignore                      # Git ignore file
├── package.json                    # Node.js package configuration
├── tsconfig.json                   # TypeScript configuration
├── README.md                       # Project documentation
│
├── src/                            # Source code
│   ├── index.ts                    # Main application entry point
│   ├── agent.ts                    # Product Curation Agent implementation
│   ├── server.ts                   # Express server setup
│   │
│   ├── config/                     # Configuration files
│   │   ├── llm.ts                  # LLM configuration
│   │   └── server.ts               # Server configuration
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── product.ts              # Product data interfaces
│   │   └── state.ts                # Agent state interfaces
│   │
│   ├── services/                   # Service layer
│   │   ├── excel-processor.ts      # Excel data processing
│   │   ├── llm-service.ts          # LLM interaction logic
│   │   └── state-graph.ts          # LangGraph implementation
│   │
│   ├── routes/                     # API routes
│   │   └── agent-routes.ts         # Agent API endpoints
│   │
│   └── utils/                      # Utility functions
│       ├── error-handler.ts        # Error handling utilities
│       └── logging.ts              # Logging utilities
│
├── data/                           # Data files
│   └── product_evaluation.xlsx     # Google Cloud products evaluation data
│
├── docs/                           # Documentation
│   ├── agent.md                    # Detailed agent documentation
│   └── diagrams/                   # Diagram files
│       ├── workflow.mmd            # Mermaid source for workflow
│       └── workflow.svg            # SVG export of workflow diagram
│
└── dist/                           # Compiled TypeScript output
    └── ...                         # (Generated files, not tracked in git)
