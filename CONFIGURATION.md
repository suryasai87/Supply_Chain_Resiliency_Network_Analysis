# Supply Chain Resiliency AI Assist - Configuration Guide

This document explains all configuration changes, credentials, grants, and setup required for the Supply Chain Resiliency AI Assist application.

---

## Table of Contents

1. [Overview](#overview)
2. [Databricks App Configuration](#databricks-app-configuration)
3. [AI/ML Endpoint Configuration](#aiml-endpoint-configuration)
4. [Genie Space Configuration](#genie-space-configuration)
5. [Resource Bindings and Grants](#resource-bindings-and-grants)
6. [Environment Variables](#environment-variables)
7. [Authentication](#authentication)
8. [Local Development Setup](#local-development-setup)
9. [Deployment](#deployment)

---

## Overview

The Supply Chain Resiliency AI Assist application is deployed as a Databricks App that integrates with:
- **Multi-Agent Supervisor (MAS)**: AI agent for complex supply chain analysis
- **Knowledge Assistant**: RAG-based document Q&A
- **Genie Spaces**: Natural language SQL queries on supply chain data

**App URL**: `https://supplychain-ai-assist-1602460480284688.aws.databricksapps.com`

**Workspace**: `fe-vm-hls-amer.cloud.databricks.com`

---

## Databricks App Configuration

### app.yaml

The `app.yaml` file in the repository root defines the Databricks App configuration:

```yaml
name: supplychain-ai-assist
version: 1.0.0
runtime:
  type: custom
compute:
  size: LARGE
```

| Setting | Value | Description |
|---------|-------|-------------|
| `name` | `supplychain-ai-assist` | Unique app identifier in the workspace |
| `version` | `1.0.0` | App version |
| `runtime.type` | `custom` | Custom Python runtime |
| `compute.size` | `LARGE` | Compute resources allocated |

### Health Check

```yaml
health_check:
  path: /api/health
  port: 8000
  interval: 30
  timeout: 10
```

### Networking

```yaml
networking:
  ingress:
    enabled: true
    port: 8000
```

---

## AI/ML Endpoint Configuration

### Multi-Agent Supervisor (MAS)

The Multi-Agent Supervisor is a Databricks Model Serving endpoint that orchestrates multiple AI agents for supply chain analysis.

| Configuration | Value |
|--------------|-------|
| **Endpoint Name** | `mas-0ad68bad-endpoint` |
| **Resource Name** | `multi-agent-endpoint` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `MULTI_AGENT_ENDPOINT` |

**Capabilities**:
- Network graph analysis (betweenness centrality, hub identification)
- Financial impact assessment
- Supply resilience evaluation
- Strategic action recommendations

### Knowledge Assistant

The Knowledge Assistant is a RAG (Retrieval-Augmented Generation) endpoint for document-based Q&A.

| Configuration | Value |
|--------------|-------|
| **Endpoint Name** | `ka-0445f231-endpoint` |
| **Resource Name** | `knowledge-endpoint` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `KNOWLEDGE_ENDPOINT` |

**Capabilities**:
- Document search and retrieval
- Context-aware answers from uploaded documents
- Supply chain knowledge base queries

---

## Genie Space Configuration

Five Genie Spaces are configured for natural language SQL queries on different supply chain data domains:

### 1. Global Supply Chain

| Configuration | Value |
|--------------|-------|
| **Space ID** | `supplytics_global_supply_chain` |
| **Resource Name** | `genie-global-supply-chain` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `GENIE_SPACE_GLOBAL_SUPPLY_CHAIN` |

**Data Domain**: Overall supply chain metrics, KPIs, and cross-functional analytics

### 2. Supplier Material

| Configuration | Value |
|--------------|-------|
| **Space ID** | `supplytics_supplier_material` |
| **Resource Name** | `genie-supplier-material` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `GENIE_SPACE_SUPPLIER_MATERIAL` |

**Data Domain**: Supplier-to-material relationships, supplier performance, sourcing data

### 3. Product Customer

| Configuration | Value |
|--------------|-------|
| **Space ID** | `supplytics_product_customer` |
| **Resource Name** | `genie-product-customer` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `GENIE_SPACE_PRODUCT_CUSTOMER` |

**Data Domain**: Product-to-customer relationships, demand data, customer analytics

### 4. Tariff Material

| Configuration | Value |
|--------------|-------|
| **Space ID** | `supplytics_tariffmaterial_product` |
| **Resource Name** | `genie-tariff-material` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `GENIE_SPACE_TARIFF_MATERIAL` |

**Data Domain**: Tariff exposure, material origin, trade compliance data

### 5. Material Product

| Configuration | Value |
|--------------|-------|
| **Space ID** | `supplytics_material_product` |
| **Resource Name** | `genie-material-product` |
| **Permission** | `CAN_QUERY` |
| **Environment Variable** | `GENIE_SPACE_MATERIAL_PRODUCT` |

**Data Domain**: Material-to-product BOM relationships, component dependencies

---

## Resource Bindings and Grants

### Grant Summary

The app.yaml `resources` section defines all permissions granted to the application:

| Resource Type | Resource Name | Permission | Purpose |
|--------------|---------------|------------|---------|
| `serving_endpoint` | `mas-0ad68bad-endpoint` | `CAN_QUERY` | Query Multi-Agent Supervisor |
| `serving_endpoint` | `ka-0445f231-endpoint` | `CAN_QUERY` | Query Knowledge Assistant |
| `genie_space` | `supplytics_global_supply_chain` | `CAN_QUERY` | Query global supply chain data |
| `genie_space` | `supplytics_supplier_material` | `CAN_QUERY` | Query supplier-material data |
| `genie_space` | `supplytics_product_customer` | `CAN_QUERY` | Query product-customer data |
| `genie_space` | `supplytics_tariffmaterial_product` | `CAN_QUERY` | Query tariff-material data |
| `genie_space` | `supplytics_material_product` | `CAN_QUERY` | Query material-product data |

### How Grants Work

When the app is deployed, Databricks automatically:
1. Creates a service principal for the app
2. Grants the specified permissions to that service principal
3. Provides authentication tokens automatically via the runtime

**No manual credential management required** - the Databricks Apps runtime handles authentication.

---

## Environment Variables

### Production (Databricks Apps)

These are set in `app.yaml` and automatically available at runtime:

| Variable | Value | Description |
|----------|-------|-------------|
| `ENV` | `production` | Environment indicator |
| `DEBUG` | `False` | Debug mode disabled |
| `MULTI_AGENT_ENDPOINT` | `mas-0ad68bad-endpoint` | MAS endpoint name |
| `KNOWLEDGE_ENDPOINT` | `ka-0445f231-endpoint` | Knowledge endpoint name |
| `GENIE_SPACE_GLOBAL_SUPPLY_CHAIN` | `supplytics_global_supply_chain` | Genie space ID |
| `GENIE_SPACE_SUPPLIER_MATERIAL` | `supplytics_supplier_material` | Genie space ID |
| `GENIE_SPACE_PRODUCT_CUSTOMER` | `supplytics_product_customer` | Genie space ID |
| `GENIE_SPACE_TARIFF_MATERIAL` | `supplytics_tariffmaterial_product` | Genie space ID |
| `GENIE_SPACE_MATERIAL_PRODUCT` | `supplytics_material_product` | Genie space ID |

### Auto-Provided by Databricks Runtime

These credentials are **automatically injected** by Databricks Apps - do not set manually:

| Variable | Description |
|----------|-------------|
| `DATABRICKS_HOST` | Workspace URL |
| `DATABRICKS_CLIENT_ID` | OAuth client ID (if using OAuth) |
| `DATABRICKS_CLIENT_SECRET` | OAuth client secret (if using OAuth) |
| `DATABRICKS_TOKEN` | Personal access token (if using PAT) |

### Local Development (.env)

For local development, create `src/backend/.env`:

```bash
# Databricks Configuration
DATABRICKS_HOST=https://fe-vm-hls-amer.cloud.databricks.com
DATABRICKS_TOKEN=<your-personal-access-token>

# Or use OAuth (preferred for production-like testing)
# DATABRICKS_CLIENT_ID=<oauth-client-id>
# DATABRICKS_CLIENT_SECRET=<oauth-client-secret>

# Endpoint Configuration
MULTI_AGENT_ENDPOINT=mas-0ad68bad-endpoint
KNOWLEDGE_ENDPOINT=ka-0445f231-endpoint

# Genie Spaces
GENIE_SPACE_GLOBAL_SUPPLY_CHAIN=supplytics_global_supply_chain
GENIE_SPACE_SUPPLIER_MATERIAL=supplytics_supplier_material
GENIE_SPACE_PRODUCT_CUSTOMER=supplytics_product_customer
GENIE_SPACE_TARIFF_MATERIAL=supplytics_tariffmaterial_product
GENIE_SPACE_MATERIAL_PRODUCT=supplytics_material_product

# Local Settings
ENV=development
DEBUG=True
```

**Important**: Never commit `.env` files to version control!

---

## Authentication

### In Databricks Apps (Production)

Authentication is handled automatically:
1. App runs with a service principal identity
2. Databricks SDK auto-detects credentials from the runtime
3. Resource bindings grant necessary permissions

**No tokens or secrets needed in code.**

### For Local Development

Option 1: **Personal Access Token (PAT)**
```bash
# Generate at: Workspace > User Settings > Developer > Access Tokens
export DATABRICKS_HOST=https://fe-vm-hls-amer.cloud.databricks.com
export DATABRICKS_TOKEN=dapi123...
```

Option 2: **Databricks CLI Profile**
```bash
# Configure profile
databricks configure --profile fe-vm-hls-amer

# Use in deployment
python deploy_to_databricks.py --profile fe-vm-hls-amer
```

Option 3: **OAuth (M2M)**
```bash
# Create OAuth app in Workspace > Admin Settings > App connections
export DATABRICKS_CLIENT_ID=<client-id>
export DATABRICKS_CLIENT_SECRET=<client-secret>
```

---

## Local Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Databricks CLI configured
- Access to the Databricks workspace

### Backend Setup

```bash
cd src/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with credentials (see Environment Variables section)

# Run backend
uvicorn app:app --host 0.0.0.0 --port 60359 --reload
```

### Frontend Setup

```bash
cd src/frontend

# Install dependencies
npm install

# Run development server
npm run dev -- --port 59817
```

### Local URLs

- Frontend: http://localhost:59817
- Backend API: http://localhost:60359
- API Docs: http://localhost:60359/docs

---

## Deployment

### Using the Deployment Script

```bash
# Deploy using CLI profile
python deploy_to_databricks.py --profile fe-vm-hls-amer
```

The script:
1. Builds the React frontend (`npm run build`)
2. Copies static files to backend
3. Packages the application
4. Imports to Databricks workspace
5. Deploys/updates the app

### Manual Deployment Steps

If needed, manual deployment can be done via:

```bash
# 1. Build frontend
cd src/frontend && npm run build

# 2. Import to workspace
databricks workspace import-dir ./deploy /Workspace/Users/<email>/supplychain-ai-assist --profile fe-vm-hls-amer

# 3. Deploy app
databricks apps deploy supplychain-ai-assist --source-code-path /Workspace/Users/<email>/supplychain-ai-assist --profile fe-vm-hls-amer
```

### Verifying Deployment

After deployment:
1. Check app status: `databricks apps get supplychain-ai-assist --profile fe-vm-hls-amer`
2. View logs: Databricks UI > Compute > Apps > supplychain-ai-assist > Logs
3. Access app: https://supplychain-ai-assist-1602460480284688.aws.databricksapps.com

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Endpoint not found" | Verify endpoint names in app.yaml match actual endpoints |
| "Permission denied" | Check resource bindings have correct permissions |
| "Authentication failed" | For local dev, verify .env credentials; for prod, check app service principal |
| "Genie space error" | Verify space IDs exist and app has CAN_QUERY permission |

### Checking Permissions

```bash
# List serving endpoints
databricks serving-endpoints list --profile fe-vm-hls-amer

# Check specific endpoint
databricks serving-endpoints get mas-0ad68bad-endpoint --profile fe-vm-hls-amer
```

### Logs

- **Local**: Check terminal output
- **Production**: Databricks UI > Compute > Apps > Logs

---

## Security Notes

1. **Never commit credentials** - Use environment variables or Databricks secrets
2. **Use least privilege** - Only grant `CAN_QUERY`, not `CAN_MANAGE`
3. **Rotate tokens regularly** - PATs should be rotated every 90 days
4. **Use OAuth for production** - Prefer OAuth over PATs for service accounts

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-04 | Initial deployment with MAS, Knowledge Assistant, 5 Genie Spaces |
| 1.1.0 | 2025-12-05 | Added streaming support, agent thinking display, multi-country tariff analysis |

---

## Contact

For questions about this configuration, contact the Databricks platform team or refer to:
- [Databricks Apps Documentation](https://docs.databricks.com/en/dev-tools/databricks-apps/index.html)
- [Model Serving Documentation](https://docs.databricks.com/en/machine-learning/model-serving/index.html)
- [Genie Spaces Documentation](https://docs.databricks.com/en/genie/index.html)
