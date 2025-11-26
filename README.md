# Supply Chain Resiliency Network Analysis

A comprehensive supply chain risk management platform with network analysis, tariff risk overlay, and AI-powered insights. Built on Databricks with Multi-Agent Supervisor, Knowledge Assistant, and Genie Spaces integration.

## Quick Deploy

```bash
python deploy.py dev
```

## Features

### 9-Page Dashboard
1. **Command Center** - Real-time KPIs, risk alerts, global map
2. **Max-Flow Analysis** - Edmonds-Karp bottleneck detection
3. **Material-Part Network** - Bipartite graph, centrality rankings
4. **Supplier-Material Matrix** - Risk heatmap, geographic concentration
5. **Tariff-Material Analysis** - Tariff exposure, scenario modeling
6. **Supplier-Product Dependencies** - Sankey diagram, product risk
7. **Multi-Tier Supplier Network** - Hidden dependency detection
8. **Recommendations** - AI-generated action items
9. **Executive Briefing** - One-page leadership summary

### AI Integration
- **Multi-Agent Supervisor** (`supply-chain-analysis-mas`) - Complex analysis
- **Knowledge Assistant** (`supplytics-knowledge-assistant`) - Document search
- **Genie Spaces** - Natural language SQL queries:
  - `supplytics_global_supply_chain`
  - `supplytics_supplier_material`
  - `supplytics_product_customer`
  - `supplytics_tariffmaterial_product`
  - `supplytics_material_product`

### Data Sources (Unity Catalog)
- `chris_messer.bronze.*` - Raw dimensions and facts
- `chris_messer.silver.*` - Graph edges and nodes
- `chris_messer.gold.*` - NetworkX-derived metrics

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts, D3.js, Cytoscape.js |
| Backend | FastAPI, NetworkX |
| Database | Databricks Unity Catalog |
| AI | Multi-Agent Supervisor, Genie |
| Deployment | Databricks Apps (Asset Bundle) |

## Project Structure

```
Supply_Chain_Resiliency_Network_Analysis/
├── src/
│   ├── frontend/          # React application
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # 9 dashboard pages
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── services/    # API clients
│   │   └── package.json
│   │
│   └── backend/           # FastAPI application
│       ├── app.py         # Main application
│       ├── routers/       # API endpoints
│       └── services/      # Databricks integration
│
├── sql/                   # SQL stored procedures
├── databricks.yml         # Asset bundle config
├── build.py              # Build script
└── deploy.py             # Deployment script
```

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Databricks CLI configured

### Local Development

1. **Start Backend**
```bash
cd src/backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

2. **Start Frontend**
```bash
cd src/frontend
npm install
npm run dev
```

3. **Access**
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Environment Variables

Create `.env` in `src/backend/`:
```env
DATABRICKS_SERVER_HOSTNAME=fe-vm-hls-amer.cloud.databricks.com
DATABRICKS_TOKEN=your-token
DATABRICKS_WAREHOUSE_ID=your-warehouse-id
MULTI_AGENT_ENDPOINT=supply-chain-analysis-mas
KNOWLEDGE_ENDPOINT=supplytics-knowledge-assistant
```

## Deployment

### One-Command Deploy
```bash
# Development
python deploy.py dev

# Staging
python deploy.py staging

# Production
python deploy.py prod
```

### Manual Build
```bash
python build.py
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/auth/status` | SSO authentication status |
| `GET /api/network/nodes` | Graph nodes by type |
| `GET /api/network/edges` | Graph edges by type |
| `POST /api/analysis/max-flow` | Run max-flow algorithm |
| `POST /api/analysis/what-if` | Disruption simulation |
| `POST /api/chat/multi-agent` | Multi-Agent Supervisor |
| `POST /api/genie/{space}/query` | Genie Space query |

## Competitive Landscape

Competing with:
- **Resilinc** - Agentic AI, multi-tier mapping
- **Interos** - $1B valuation, AI-driven mapping
- **Everstream Analytics** - Predictive risk analytics
- **Kinaxis** - Control tower, RapidResponse
- **o9 Solutions** - Digital Brain platform

### Our Differentiators
1. Native Databricks integration
2. Open architecture (not locked in)
3. SQL-native graph analytics (recursive CTEs)
4. Multi-Agent AI with domain experts
5. Customizable & cost-effective

## License

Internal use only.

## Contact

Supply Chain Analytics Team
