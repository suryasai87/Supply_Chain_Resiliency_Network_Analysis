# Instructions for Claude Code

## Deploying This Application

**IMPORTANT**: This project includes a custom deployment script for Databricks Apps.

### Quick Deploy (One Command!)

```bash
# Deploy to development
python deploy.py dev

# Deploy to staging
python deploy.py staging

# Deploy to production
python deploy.py prod
```

### What the Script Does

1. Builds the React frontend (Vite)
2. Packages the FastAPI backend
3. Creates app.yaml for Databricks Apps
4. Uploads to Databricks workspace
5. Deploys the app
6. Shows the app URL

### Prerequisites

- Databricks CLI installed: `pip install databricks-cli`
- Databricks CLI configured: `databricks configure --token`
- Node.js 18+ for frontend build

### DO NOT

- Do NOT try to deploy using other methods
- Do NOT write new deployment scripts
- Do NOT modify the dbappsbundle scaffolding

### Key Integrations

- **Multi-Agent Supervisor**: `supply-chain-analysis-mas`
- **Knowledge Assistant**: `supplytics-knowledge-assistant`
- **Genie Spaces**: 5 configured spaces for SQL queries
- **Unity Catalog**: `chris_messer.bronze/silver/gold`

### Data Model

- Bronze: Raw dimension/fact tables
- Silver: Graph edges and nodes (materialized views)
- Gold: NetworkX-derived metrics (centrality, PageRank, etc.)

### UI Pages (9 Total)

1. Command Center (Overview)
2. Max-Flow Analysis
3. Material-Part Network
4. Supplier-Material Matrix
5. Tariff-Material Analysis
6. Supplier-Product Dependencies
7. Multi-Tier Supplier Network
8. Recommendations
9. Executive Briefing
