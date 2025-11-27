# Supply Chain Resiliency Network Analysis

A comprehensive supply chain risk management platform with network analysis, tariff risk overlay, and AI-powered insights. Built on Databricks with Multi-Agent Supervisor, Knowledge Assistant, and Genie Spaces integration.

**Live Demo:** https://supply-chain-resiliency-1602460480284688.aws.databricksapps.com

**GitHub:** https://github.com/suryasai87/Supply_Chain_Resiliency_Network_Analysis

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

## Data Model & Deployment Guide

This application uses a **Medallion Architecture** (Bronze → Silver → Gold) for supply chain network data.

### Data Model Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   BRONZE     │───▶│   SILVER     │───▶│    GOLD      │
│  Raw Data    │    │  Graph-Ready │    │  Analytics   │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Bronze Layer (10 tables):**
- `bronze_dim_supplier` - Supplier master data with risk scores
- `bronze_dim_material` - Material/component data with HS codes
- `bronze_dim_product` - Finished goods catalog
- `bronze_dim_customer` - Customer master data
- `bronze_dim_tariff` - Tariff rates by country/HS code
- `bronze_fact_supplier_material` - Supplier-material relationships
- `bronze_fact_material_product` - Bill of materials (BOM)
- `bronze_fact_product_customer` - Sales relationships
- `bronze_fact_supplier_supplier` - Multi-tier supplier relationships

**Silver Layer (9 tables):**
- `silver_graph_nodes` - Unified graph nodes (all entity types)
- `silver_graph_edges` - Unified graph edges (all relationship types)
- `silver_node_supplier/material/product/customer` - Type-specific nodes
- `silver_edge_*` - Type-specific edges with flow attributes

**Gold Layer (8 tables):**
- `gold_metrics_node` - Centrality metrics (PageRank, betweenness)
- `gold_metrics_edge` - Edge-level flow metrics
- `gold_maxflow_results` - Max-flow analysis results
- `gold_supplier_tier_analysis` - Hidden dependency analysis
- `gold_tariff_material/country_impact` - Tariff exposure
- `gold_supply_chain_health` - Daily health metrics
- `gold_risk_alerts` - Actionable alerts

### Deploy Your Own Instance

#### Prerequisites
- Databricks workspace with Unity Catalog enabled
- Databricks CLI installed and configured
- Python 3.9+, Node.js 18+

#### Step 1: Clone and Configure

```bash
git clone https://github.com/suryasai87/Supply_Chain_Resiliency_Network_Analysis.git
cd Supply_Chain_Resiliency_Network_Analysis
```

Edit `databricks.yml` to set your catalog:
```yaml
variables:
  catalog:
    default: your_catalog_name
  schema:
    default: supply_chain_network
```

#### Step 2: Create Tables (Option A - DAB)

```bash
# Deploy with Databricks Asset Bundles
databricks bundle deploy --target dev

# Run the table creation job
databricks bundle run create_tables_job --target dev
```

#### Step 2: Create Tables (Option B - Manual)

Run the DDL scripts in Databricks SQL:
```sql
-- Set your catalog/schema
SET var.catalog = your_catalog;
SET var.schema = supply_chain_network;

-- Run in order:
-- 1. docs/data-model/01_bronze_layer_ddl.sql
-- 2. docs/data-model/02_silver_layer_ddl.sql
-- 3. docs/data-model/03_gold_layer_ddl.sql
-- 4. docs/data-model/04_sample_data.sql
```

#### Step 3: Configure Environment

Create `src/backend/.env`:
```env
DATABRICKS_SERVER_HOSTNAME=your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-token
DATABRICKS_WAREHOUSE_ID=your-warehouse-id
UNITY_CATALOG=your_catalog
UNITY_SCHEMA=supply_chain_network
MULTI_AGENT_ENDPOINT=supply-chain-analysis-mas
KNOWLEDGE_ENDPOINT=supplytics-knowledge-assistant
```

#### Step 4: Deploy Application

```bash
# Build and deploy
python deploy.py dev
```

### Hydrating Your Own Data

To use your own supply chain data:

1. **Map your data** to the Bronze layer schema (see `docs/data-model/01_bronze_layer_ddl.sql`)
2. **Load Bronze tables** via Databricks SQL, Spark, or Auto Loader
3. **Run Silver transformations** - Copy nodes/edges to graph tables:
   ```sql
   -- Example: Create supplier nodes
   INSERT INTO silver_graph_nodes
   SELECT supplier_id, 'supplier', supplier_name, ...
   FROM bronze_dim_supplier;
   ```
4. **Compute Gold metrics** - Run notebook `05_compute_graph_metrics.py`
5. **Schedule daily refresh** - Enable the `graph_metrics_refresh` job

### Graph Visualizations

| Page | Visualization | Data Source |
|------|---------------|-------------|
| Overview | Supply Chain Map | `silver_graph_nodes` (suppliers with lat/lng) |
| Max-Flow | Flow Network | `silver_graph_edges` with flow_capacity |
| Material-Part | Bipartite Graph | `silver_node_material` + `silver_node_product` |
| Supplier-Material | Network + Map | `silver_graph_nodes/edges` |
| Tariff-Material | Choropleth Map | `gold_tariff_country_impact` |
| Supplier-Product | Sankey Diagram | `silver_graph_edges` (full chain) |
| Supplier Tier | Tier Network | `silver_edge_supplier_supplier` |

### Documentation

- [Data Model Documentation](docs/data-model/DATA_MODEL.md) - ER diagrams and table definitions
- [Bronze Layer DDL](docs/data-model/01_bronze_layer_ddl.sql) - Raw data tables
- [Silver Layer DDL](docs/data-model/02_silver_layer_ddl.sql) - Graph structures
- [Gold Layer DDL](docs/data-model/03_gold_layer_ddl.sql) - Analytics tables
- [Sample Data](docs/data-model/04_sample_data.sql) - Demo data

## License

Internal use only.

## Contact

Supply Chain Analytics Team
