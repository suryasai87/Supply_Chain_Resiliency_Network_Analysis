# Supply Chain Resiliency Network Analysis - Data Model

## Overview

This document describes the logical data model for the Supply Chain Resiliency Network Analysis application. The data model follows the **Medallion Architecture** (Bronze → Silver → Gold) pattern commonly used in Databricks lakehouse implementations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   BRONZE     │───▶│   SILVER     │───▶│    GOLD      │                  │
│  │  Raw Data    │    │  Cleansed &  │    │  Aggregated  │                  │
│  │              │    │  Enriched    │    │  Analytics   │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│        │                    │                   │                           │
│        ▼                    ▼                   ▼                           │
│  - Dimension tables   - Graph nodes      - Network metrics                 │
│  - Fact tables        - Graph edges      - Max-flow results                │
│  - Raw relationships  - Unified graph    - Tier analysis                   │
│                       - Tariff data      - Risk alerts                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

### Bronze Layer - Raw Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BRONZE LAYER - RAW DATA                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐        ┌─────────────────┐        ┌────────────────┐  │
│  │  dim_supplier   │        │  dim_material   │        │  dim_product   │  │
│  ├─────────────────┤        ├─────────────────┤        ├────────────────┤  │
│  │ PK supplier_id  │        │ PK material_id  │        │ PK product_id  │  │
│  │    name         │        │    name         │        │    name        │  │
│  │    country_code │        │    material_type│        │    family      │  │
│  │    tier         │        │    category     │        │    category    │  │
│  │    risk_score   │        │    criticality  │        │    cost        │  │
│  │    latitude     │        │    hs_code      │        │    is_active   │  │
│  │    longitude    │        │    lead_time    │        │                │  │
│  └────────┬────────┘        └────────┬────────┘        └───────┬────────┘  │
│           │                          │                         │           │
│           │    ┌─────────────────────┴─────────────────┐      │           │
│           │    │                                       │      │           │
│           ▼    ▼                                       ▼      ▼           │
│  ┌─────────────────────┐                    ┌────────────────────────┐    │
│  │ fact_supplier_      │                    │ fact_material_         │    │
│  │     material        │                    │     product            │    │
│  ├─────────────────────┤                    ├────────────────────────┤    │
│  │ PK supplier_mat_id  │                    │ PK material_prod_id    │    │
│  │ FK supplier_id      │                    │ FK material_id         │    │
│  │ FK material_id      │                    │ FK product_id          │    │
│  │    supply_share_pct │                    │    quantity_per_unit   │    │
│  │    unit_price       │                    │    is_critical         │    │
│  │    lead_time_days   │                    │                        │    │
│  │    capacity         │                    │                        │    │
│  └─────────────────────┘                    └────────────────────────┘    │
│                                                                             │
│  ┌─────────────────┐        ┌─────────────────────────┐                    │
│  │  dim_customer   │        │ fact_product_customer   │                    │
│  ├─────────────────┤        ├─────────────────────────┤                    │
│  │ PK customer_id  │◀───────│ PK product_customer_id  │                    │
│  │    name         │        │ FK product_id           │                    │
│  │    type         │        │ FK customer_id          │                    │
│  │    country_code │        │    annual_demand        │                    │
│  │    priority     │        │    contracted_price     │                    │
│  └─────────────────┘        └─────────────────────────┘                    │
│                                                                             │
│  ┌─────────────────┐        ┌─────────────────────────┐                    │
│  │  dim_tariff     │        │ fact_supplier_supplier  │                    │
│  ├─────────────────┤        ├─────────────────────────┤                    │
│  │ PK tariff_id    │        │ PK supplier_supplier_id │                    │
│  │    origin_code  │        │ FK parent_supplier_id   │                    │
│  │    dest_code    │        │ FK child_supplier_id    │                    │
│  │    hs_code      │        │    relationship_type    │                    │
│  │    tariff_rate  │        │    is_disclosed         │                    │
│  │    effective_dt │        │    confidence_score     │                    │
│  └─────────────────┘        └─────────────────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Silver Layer - Graph Structures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SILVER LAYER - GRAPH STRUCTURES                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           NODE TABLES                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ node_supplier   │  │ node_material   │  │ node_product    │     │   │
│  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤     │   │
│  │  │ PK node_id      │  │ PK node_id      │  │ PK node_id      │     │   │
│  │  │    node_type    │  │    node_type    │  │    node_type    │     │   │
│  │  │    label        │  │    label        │  │    label        │     │   │
│  │  │    risk_score   │  │    criticality  │  │    complexity   │     │   │
│  │  │    tier         │  │    supplier_cnt │  │    material_cnt │     │   │
│  │  │    centrality   │  │    centrality   │  │    centrality   │     │   │
│  │  │    pagerank     │  │    pagerank     │  │    pagerank     │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐                                                 │   │
│  │  │ node_customer   │                                                 │   │
│  │  ├─────────────────┤                                                 │   │
│  │  │ PK node_id      │                                                 │   │
│  │  │    node_type    │                                                 │   │
│  │  │    label        │                                                 │   │
│  │  │    priority     │                                                 │   │
│  │  │    pagerank     │                                                 │   │
│  │  └─────────────────┘                                                 │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           EDGE TABLES                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌───────────────────────┐     ┌───────────────────────┐            │   │
│  │  │ edge_supplier_material│     │ edge_material_product │            │   │
│  │  ├───────────────────────┤     ├───────────────────────┤            │   │
│  │  │ PK edge_id            │     │ PK edge_id            │            │   │
│  │  │ FK source_node_id     │────▶│ FK source_node_id     │            │   │
│  │  │ FK target_node_id     │     │ FK target_node_id     │────▶       │   │
│  │  │    edge_type          │     │    edge_type          │            │   │
│  │  │    weight             │     │    weight             │            │   │
│  │  │    flow_capacity      │     │    flow_capacity      │            │   │
│  │  │    current_flow       │     │    current_flow       │            │   │
│  │  │    utilization_pct    │     │    is_critical        │            │   │
│  │  └───────────────────────┘     └───────────────────────┘            │   │
│  │                                                                      │   │
│  │  ┌───────────────────────┐     ┌───────────────────────┐            │   │
│  │  │ edge_product_customer │     │ edge_supplier_supplier│            │   │
│  │  ├───────────────────────┤     ├───────────────────────┤            │   │
│  │  │ PK edge_id            │     │ PK edge_id            │            │   │
│  │  │ FK source_node_id     │     │ FK source_node_id     │            │   │
│  │  │ FK target_node_id     │     │ FK target_node_id     │            │   │
│  │  │    edge_type          │     │    edge_type          │            │   │
│  │  │    weight             │     │    weight             │            │   │
│  │  │    annual_demand      │     │    is_disclosed       │            │   │
│  │  └───────────────────────┘     └───────────────────────┘            │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      UNIFIED GRAPH TABLES                            │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌─────────────────────┐         ┌─────────────────────┐            │   │
│  │  │ silver_graph_nodes  │         │ silver_graph_edges  │            │   │
│  │  ├─────────────────────┤         ├─────────────────────┤            │   │
│  │  │ PK node_id          │◀────────│ FK source_node_id   │            │   │
│  │  │    node_type        │         │ FK target_node_id   │────▶       │   │
│  │  │    label            │         │ PK edge_id          │            │   │
│  │  │    risk_category    │         │    edge_type        │            │   │
│  │  │    tier             │         │    weight           │            │   │
│  │  │    latitude         │         │    flow_capacity    │            │   │
│  │  │    longitude        │         │    current_flow     │            │   │
│  │  │    centrality       │         │    is_bottleneck    │            │   │
│  │  │    pagerank         │         │    edge_color       │            │   │
│  │  │    node_size        │         │    edge_width       │            │   │
│  │  │    node_color       │         │                     │            │   │
│  │  │    is_hidden        │         │                     │            │   │
│  │  └─────────────────────┘         └─────────────────────┘            │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Gold Layer - Analytics & Metrics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GOLD LAYER - ANALYTICS & METRICS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      NETWORK ANALYTICS                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌─────────────────────┐         ┌─────────────────────┐            │   │
│  │  │ gold_metrics_node   │         │ gold_metrics_edge   │            │   │
│  │  ├─────────────────────┤         ├─────────────────────┤            │   │
│  │  │ PK node_id          │         │ PK edge_id          │            │   │
│  │  │    node_type        │         │    source_node_id   │            │   │
│  │  │    degree_centrality│         │    target_node_id   │            │   │
│  │  │    betweenness      │         │    flow_capacity    │            │   │
│  │  │    closeness        │         │    current_flow     │            │   │
│  │  │    eigenvector      │         │    utilization_pct  │            │   │
│  │  │    pagerank         │         │    is_bottleneck    │            │   │
│  │  │    risk_score       │         │    is_critical_path │            │   │
│  │  │    revenue_at_risk  │         │    redundancy_count │            │   │
│  │  │    overall_rank     │         │                     │            │   │
│  │  └─────────────────────┘         └─────────────────────┘            │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      MAX-FLOW ANALYSIS                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌─────────────────────────┐     ┌─────────────────────────┐        │   │
│  │  │ gold_maxflow_results    │     │ gold_maxflow_edge_flows │        │   │
│  │  ├─────────────────────────┤     ├─────────────────────────┤        │   │
│  │  │ PK analysis_id          │────▶│ FK analysis_id          │        │   │
│  │  │    source_node_id       │     │ PK edge_id              │        │   │
│  │  │    sink_node_id         │     │    allocated_flow       │        │   │
│  │  │    max_flow_value       │     │    residual_capacity    │        │   │
│  │  │    bottleneck_edges[]   │     │    is_saturated         │        │   │
│  │  │    min_cut_edges[]      │     │    is_bottleneck        │        │   │
│  │  │    min_cut_value        │     │    is_on_critical_path  │        │   │
│  │  └─────────────────────────┘     └─────────────────────────┘        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SUPPLIER & TARIFF ANALYSIS                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌──────────────────────────┐   ┌──────────────────────────┐        │   │
│  │  │ gold_supplier_tier       │   │ gold_tariff_material     │        │   │
│  │  ├──────────────────────────┤   ├──────────────────────────┤        │   │
│  │  │ PK supplier_id           │   │ PK material_id           │        │   │
│  │  │    tier                  │   │    hs_code               │        │   │
│  │  │    direct_customers_cnt  │   │    primary_origin        │        │   │
│  │  │    supply_chain_depth    │   │    weighted_avg_tariff   │        │   │
│  │  │    is_hidden_dependency  │   │    annual_duty_cost      │        │   │
│  │  │    products_impacted     │   │    trade_war_exposure    │        │   │
│  │  │    revenue_at_risk       │   │    products_impacted     │        │   │
│  │  └──────────────────────────┘   └──────────────────────────┘        │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────┐                                        │   │
│  │  │ gold_tariff_country      │                                        │   │
│  │  ├──────────────────────────┤                                        │   │
│  │  │ PK country_code          │                                        │   │
│  │  │    avg_tariff_rate       │                                        │   │
│  │  │    supplier_count        │                                        │   │
│  │  │    annual_duty_cost      │                                        │   │
│  │  │    geopolitical_risk     │                                        │   │
│  │  │    trade_agreements[]    │                                        │   │
│  │  └──────────────────────────┘                                        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DASHBOARD & ALERTS                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌──────────────────────────┐   ┌──────────────────────────┐        │   │
│  │  │ gold_supply_chain_health │   │ gold_risk_alerts         │        │   │
│  │  ├──────────────────────────┤   ├──────────────────────────┤        │   │
│  │  │ PK metric_date           │   │ PK alert_id              │        │   │
│  │  │    total_suppliers       │   │    alert_type            │        │   │
│  │  │    total_materials       │   │    severity              │        │   │
│  │  │    critical_risk_nodes   │   │    title                 │        │   │
│  │  │    bottleneck_count      │   │    affected_nodes[]      │        │   │
│  │  │    overall_health_score  │   │    revenue_at_risk       │        │   │
│  │  │    resilience_score      │   │    recommended_actions[] │        │   │
│  │  │    concentration_risk    │   │    status                │        │   │
│  │  └──────────────────────────┘   └──────────────────────────┘        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Graph Data Model for Visualizations

The application uses a graph data structure for network visualizations. Here's how the data maps to each visualization:

### 1. Network Overview (NetworkGraph)

```
Nodes: silver_graph_nodes (all types)
Edges: silver_graph_edges (all types)
Layout: fcose (force-directed)
```

### 2. Supplier Tier Network (TierNetwork)

```
Nodes: silver_node_supplier (filtered by tier)
Edges: silver_edge_supplier_supplier
Layout: breadthfirst (hierarchical)
```

### 3. Max-Flow Network (FlowNetwork)

```
Nodes: silver_graph_nodes (source, intermediate, sink)
Edges: silver_graph_edges with flow_capacity, current_flow
Metrics: gold_maxflow_results, gold_maxflow_edge_flows
```

### 4. Material-Part Bipartite (BipartiteGraph)

```
Left Nodes: silver_node_material
Right Nodes: silver_node_product
Edges: silver_edge_material_product
Layout: preset (two columns)
```

### 5. Supplier-Material-Product Sankey (SankeyDiagram)

```
Nodes: silver_graph_nodes (supplier, material, product, customer)
Links: silver_graph_edges with weight as value
```

### 6. Supply Chain Map (SupplyChainMap)

```
Markers: silver_node_supplier (latitude, longitude, risk_category)
Flows: silver_edge_supplier_material (for line connections)
```

### 7. Tariff Choropleth (TariffChoropleth)

```
Countries: gold_tariff_country_impact
Materials: gold_tariff_material_impact
```

## Table Naming Conventions

| Layer  | Prefix  | Purpose                           |
|--------|---------|-----------------------------------|
| Bronze | bronze_ | Raw, unprocessed data             |
| Silver | silver_ | Cleansed, enriched, graph-ready   |
| Gold   | gold_   | Aggregated metrics and analytics  |

## Data Types

| Concept          | Databricks Type    | Notes                        |
|------------------|--------------------|------------------------------|
| Identifiers      | STRING             | UUID or composite keys       |
| Names/Labels     | STRING             | Display text                 |
| Scores           | DOUBLE             | 0-100 scale                  |
| Percentages      | DECIMAL(5,2)       | 0.00 to 100.00               |
| Currency Amounts | DECIMAL(18,2)      | Financial values             |
| Coordinates      | DOUBLE             | Latitude/Longitude           |
| Timestamps       | TIMESTAMP          | UTC timestamps               |
| Flags            | BOOLEAN            | True/False                   |
| Arrays           | ARRAY<STRING>      | Lists of IDs or values       |
| Key-Value        | MAP<STRING,STRING> | Metadata                     |

## Deployment Parameters

When deploying, replace these placeholders:

| Parameter   | Description                      | Example                          |
|-------------|----------------------------------|----------------------------------|
| ${catalog}  | Unity Catalog name               | supply_chain_analytics           |
| ${schema}   | Schema name                      | network_analysis                 |

## Next Steps

1. Run the DDL scripts in order (01_bronze, 02_silver, 03_gold)
2. Populate sample data using the provided scripts
3. Configure the application to point to your Unity Catalog tables
4. Deploy the application using Databricks Apps or Asset Bundles

See the main README.md for complete deployment instructions.
