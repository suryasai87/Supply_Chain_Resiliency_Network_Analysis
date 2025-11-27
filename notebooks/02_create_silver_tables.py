# Databricks notebook source
# MAGIC %md
# MAGIC # Create Silver Layer Tables
# MAGIC Supply Chain Resiliency Network Analysis
# MAGIC
# MAGIC This notebook creates Silver layer tables (cleansed, graph-ready)

# COMMAND ----------

# Get parameters
dbutils.widgets.text("catalog", "supply_chain_analytics")
dbutils.widgets.text("schema", "network_analysis")

catalog = dbutils.widgets.get("catalog")
schema = dbutils.widgets.get("schema")

print(f"Creating Silver tables in {catalog}.{schema}")

spark.sql(f"USE CATALOG {catalog}")
spark.sql(f"USE SCHEMA {schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Unified Graph Tables (for Cytoscape visualization)

# COMMAND ----------

# Unified Graph Nodes
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_graph_nodes (
    node_id STRING NOT NULL COMMENT 'Unique node identifier',
    node_type STRING NOT NULL COMMENT 'Node type: supplier, material, product, customer',
    label STRING NOT NULL COMMENT 'Display label',
    name STRING COMMENT 'Entity name',
    risk_category STRING COMMENT 'Risk category: critical, high, medium, low',
    tier INT COMMENT 'Tier level (for suppliers)',
    country_code STRING COMMENT 'Country code',
    latitude DOUBLE COMMENT 'Latitude',
    longitude DOUBLE COMMENT 'Longitude',
    degree_centrality DOUBLE COMMENT 'Degree centrality',
    betweenness_centrality DOUBLE COMMENT 'Betweenness centrality',
    pagerank DOUBLE COMMENT 'PageRank score',
    node_size DOUBLE COMMENT 'Node size for visualization',
    node_color STRING COMMENT 'Node color hex code',
    is_hidden BOOLEAN DEFAULT false COMMENT 'Hidden dependency flag',
    metadata MAP<STRING, STRING> COMMENT 'Additional node metadata',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Unified graph nodes for visualization'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_graph_nodes")

# COMMAND ----------

# Unified Graph Edges
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_graph_edges (
    edge_id STRING NOT NULL COMMENT 'Unique edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node ID',
    target_node_id STRING NOT NULL COMMENT 'Target node ID',
    edge_type STRING NOT NULL COMMENT 'Edge type: supplies, used_in, sold_to, sources_from',
    weight DOUBLE COMMENT 'Edge weight',
    label STRING COMMENT 'Edge label for display',
    flow_capacity DOUBLE COMMENT 'Flow capacity',
    current_flow DOUBLE COMMENT 'Current flow',
    utilization_pct DOUBLE COMMENT 'Utilization percentage',
    is_bottleneck BOOLEAN DEFAULT false COMMENT 'Bottleneck flag (>=100% util)',
    edge_width DOUBLE COMMENT 'Edge width for visualization',
    edge_color STRING COMMENT 'Edge color hex code',
    is_hidden BOOLEAN DEFAULT false COMMENT 'Hidden relationship flag',
    metadata MAP<STRING, STRING> COMMENT 'Additional edge metadata',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Unified graph edges for visualization'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_graph_edges")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Node Type Tables

# COMMAND ----------

# Supplier Nodes
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_node_supplier (
    node_id STRING NOT NULL COMMENT 'Graph node identifier (supplier_id)',
    node_type STRING NOT NULL DEFAULT 'supplier' COMMENT 'Node type: supplier',
    label STRING NOT NULL COMMENT 'Display label for visualization',
    supplier_id STRING NOT NULL COMMENT 'Source supplier_id',
    supplier_name STRING NOT NULL COMMENT 'Supplier name',
    country_code STRING COMMENT 'ISO country code',
    country_name STRING COMMENT 'Country name',
    region STRING COMMENT 'Geographic region',
    latitude DOUBLE COMMENT 'Latitude coordinate',
    longitude DOUBLE COMMENT 'Longitude coordinate',
    tier INT COMMENT 'Supplier tier (1, 2, 3)',
    risk_score DOUBLE COMMENT 'Risk score (0-100)',
    risk_category STRING COMMENT 'Risk category: critical, high, medium, low',
    is_single_source BOOLEAN COMMENT 'Single source flag',
    is_critical BOOLEAN COMMENT 'Critical supplier flag',
    financial_stability_score DOUBLE COMMENT 'Financial stability (0-100)',
    quality_rating DOUBLE COMMENT 'Quality rating (0-5)',
    on_time_delivery_rate DOUBLE COMMENT 'OTD rate (0-100)',
    lead_time_days INT COMMENT 'Average lead time',
    degree_centrality DOUBLE COMMENT 'Degree centrality score',
    betweenness_centrality DOUBLE COMMENT 'Betweenness centrality score',
    pagerank DOUBLE COMMENT 'PageRank score',
    connected_materials_count INT COMMENT 'Number of materials supplied',
    connected_products_count INT COMMENT 'Number of products impacted',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Supplier nodes for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_node_supplier")

# COMMAND ----------

# Material Nodes
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_node_material (
    node_id STRING NOT NULL COMMENT 'Graph node identifier (material_id)',
    node_type STRING NOT NULL DEFAULT 'material' COMMENT 'Node type: material',
    label STRING NOT NULL COMMENT 'Display label for visualization',
    material_id STRING NOT NULL COMMENT 'Source material_id',
    material_name STRING NOT NULL COMMENT 'Material name',
    material_type STRING COMMENT 'Material type',
    category STRING COMMENT 'Material category',
    criticality STRING COMMENT 'Criticality: critical, high, medium, low',
    standard_cost DECIMAL(18,4) COMMENT 'Standard cost',
    currency_code STRING COMMENT 'Currency',
    lead_time_days INT COMMENT 'Lead time days',
    hs_code STRING COMMENT 'HS tariff code',
    country_of_origin STRING COMMENT 'Primary origin country',
    supplier_count INT COMMENT 'Number of suppliers',
    single_source_risk BOOLEAN COMMENT 'True if single source',
    geographic_concentration_risk DOUBLE COMMENT 'Geographic concentration (0-100)',
    avg_supplier_risk_score DOUBLE COMMENT 'Average supplier risk',
    degree_centrality DOUBLE COMMENT 'Degree centrality score',
    betweenness_centrality DOUBLE COMMENT 'Betweenness centrality score',
    pagerank DOUBLE COMMENT 'PageRank score',
    connected_suppliers_count INT COMMENT 'Number of suppliers',
    connected_products_count INT COMMENT 'Number of products using material',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Material nodes for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_node_material")

# COMMAND ----------

# Product Nodes
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_node_product (
    node_id STRING NOT NULL COMMENT 'Graph node identifier (product_id)',
    node_type STRING NOT NULL DEFAULT 'product' COMMENT 'Node type: product',
    label STRING NOT NULL COMMENT 'Display label for visualization',
    product_id STRING NOT NULL COMMENT 'Source product_id',
    product_name STRING NOT NULL COMMENT 'Product name',
    product_family STRING COMMENT 'Product family',
    product_category STRING COMMENT 'Product category',
    standard_cost DECIMAL(18,4) COMMENT 'Standard cost',
    list_price DECIMAL(18,4) COMMENT 'List price',
    currency_code STRING COMMENT 'Currency',
    is_active BOOLEAN COMMENT 'Active flag',
    material_count INT COMMENT 'Number of materials (BOM complexity)',
    critical_material_count INT COMMENT 'Critical materials count',
    single_source_material_count INT COMMENT 'Single source materials',
    supply_chain_depth INT COMMENT 'Max supplier tier depth',
    total_supplier_count INT COMMENT 'Total suppliers (all tiers)',
    avg_material_risk_score DOUBLE COMMENT 'Average material risk',
    degree_centrality DOUBLE COMMENT 'Degree centrality score',
    betweenness_centrality DOUBLE COMMENT 'Betweenness centrality score',
    pagerank DOUBLE COMMENT 'PageRank score',
    connected_materials_count INT COMMENT 'Number of materials',
    connected_customers_count INT COMMENT 'Number of customers',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Product nodes for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_node_product")

# COMMAND ----------

# Customer Nodes
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_node_customer (
    node_id STRING NOT NULL COMMENT 'Graph node identifier (customer_id)',
    node_type STRING NOT NULL DEFAULT 'customer' COMMENT 'Node type: customer',
    label STRING NOT NULL COMMENT 'Display label for visualization',
    customer_id STRING NOT NULL COMMENT 'Source customer_id',
    customer_name STRING NOT NULL COMMENT 'Customer name',
    customer_type STRING COMMENT 'Customer type',
    country_code STRING COMMENT 'ISO country code',
    country_name STRING COMMENT 'Country name',
    region STRING COMMENT 'Geographic region',
    latitude DOUBLE COMMENT 'Latitude coordinate',
    longitude DOUBLE COMMENT 'Longitude coordinate',
    annual_revenue DECIMAL(18,2) COMMENT 'Annual revenue',
    currency_code STRING COMMENT 'Currency',
    priority STRING COMMENT 'Priority tier',
    degree_centrality DOUBLE COMMENT 'Degree centrality score',
    pagerank DOUBLE COMMENT 'PageRank score',
    connected_products_count INT COMMENT 'Number of products purchased',
    supply_chain_risk_exposure DOUBLE COMMENT 'Risk exposure score',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Customer nodes for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_node_customer")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Edge Type Tables

# COMMAND ----------

# Supplier-Material Edges
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_edge_supplier_material (
    edge_id STRING NOT NULL COMMENT 'Unique edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node (supplier)',
    target_node_id STRING NOT NULL COMMENT 'Target node (material)',
    edge_type STRING NOT NULL DEFAULT 'supplies' COMMENT 'Edge type',
    supplier_id STRING NOT NULL COMMENT 'Supplier ID',
    material_id STRING NOT NULL COMMENT 'Material ID',
    weight DOUBLE COMMENT 'Edge weight (supply share)',
    supply_share_pct DECIMAL(5,2) COMMENT 'Supply share percentage',
    is_primary BOOLEAN COMMENT 'Primary supplier flag',
    unit_price DECIMAL(18,4) COMMENT 'Unit price',
    currency_code STRING COMMENT 'Currency',
    lead_time_days INT COMMENT 'Lead time',
    capacity_per_month DECIMAL(18,4) COMMENT 'Monthly capacity',
    quality_score DOUBLE COMMENT 'Quality score',
    on_time_delivery_rate DOUBLE COMMENT 'OTD rate',
    flow_capacity DOUBLE COMMENT 'Max flow capacity',
    current_flow DOUBLE COMMENT 'Current flow volume',
    utilization_pct DOUBLE COMMENT 'Capacity utilization %',
    is_active BOOLEAN COMMENT 'Active flag',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Supplier-Material edges for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_edge_supplier_material")

# COMMAND ----------

# Material-Product Edges
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_edge_material_product (
    edge_id STRING NOT NULL COMMENT 'Unique edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node (material)',
    target_node_id STRING NOT NULL COMMENT 'Target node (product)',
    edge_type STRING NOT NULL DEFAULT 'used_in' COMMENT 'Edge type',
    material_id STRING NOT NULL COMMENT 'Material ID',
    product_id STRING NOT NULL COMMENT 'Product ID',
    weight DOUBLE COMMENT 'Edge weight (quantity)',
    quantity_per_unit DECIMAL(18,6) COMMENT 'Quantity per product unit',
    unit_of_measure STRING COMMENT 'Unit of measure',
    scrap_rate DECIMAL(5,4) COMMENT 'Scrap rate',
    is_critical BOOLEAN COMMENT 'Critical component flag',
    substitution_allowed BOOLEAN COMMENT 'Substitution allowed flag',
    flow_capacity DOUBLE COMMENT 'Max flow capacity',
    current_flow DOUBLE COMMENT 'Current flow volume',
    utilization_pct DOUBLE COMMENT 'Capacity utilization %',
    is_active BOOLEAN COMMENT 'Active flag',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Material-Product edges for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_edge_material_product")

# COMMAND ----------

# Product-Customer Edges
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_edge_product_customer (
    edge_id STRING NOT NULL COMMENT 'Unique edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node (product)',
    target_node_id STRING NOT NULL COMMENT 'Target node (customer)',
    edge_type STRING NOT NULL DEFAULT 'sold_to' COMMENT 'Edge type',
    product_id STRING NOT NULL COMMENT 'Product ID',
    customer_id STRING NOT NULL COMMENT 'Customer ID',
    weight DOUBLE COMMENT 'Edge weight (demand)',
    annual_demand DECIMAL(18,4) COMMENT 'Annual demand quantity',
    unit_of_measure STRING COMMENT 'Unit of measure',
    contracted_price DECIMAL(18,4) COMMENT 'Contracted price',
    currency_code STRING COMMENT 'Currency',
    lead_time_days INT COMMENT 'Promised lead time',
    service_level_target DECIMAL(5,2) COMMENT 'Service level target %',
    flow_capacity DOUBLE COMMENT 'Max flow capacity (demand)',
    current_flow DOUBLE COMMENT 'Current flow (fulfilled)',
    utilization_pct DOUBLE COMMENT 'Fulfillment rate %',
    is_active BOOLEAN COMMENT 'Active flag',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Product-Customer edges for graph analytics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_edge_product_customer")

# COMMAND ----------

# Supplier-Supplier Edges (Tier)
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_edge_supplier_supplier (
    edge_id STRING NOT NULL COMMENT 'Unique edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node (parent supplier)',
    target_node_id STRING NOT NULL COMMENT 'Target node (child supplier)',
    edge_type STRING NOT NULL DEFAULT 'sources_from' COMMENT 'Edge type',
    parent_supplier_id STRING NOT NULL COMMENT 'Parent supplier ID',
    child_supplier_id STRING NOT NULL COMMENT 'Child supplier ID',
    weight DOUBLE COMMENT 'Edge weight (supply share)',
    relationship_type STRING COMMENT 'Relationship type',
    supply_share_pct DECIMAL(5,2) COMMENT 'Supply share',
    is_disclosed BOOLEAN COMMENT 'Disclosed relationship flag',
    confidence_score DOUBLE COMMENT 'Confidence score',
    is_active BOOLEAN COMMENT 'Active flag',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Supplier tier relationship edges'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_edge_supplier_supplier")

# COMMAND ----------

# Material-Tariff Table
spark.sql(f"""
CREATE TABLE IF NOT EXISTS {catalog}.{schema}.silver_material_tariff (
    material_tariff_id STRING NOT NULL COMMENT 'Unique identifier',
    material_id STRING NOT NULL COMMENT 'Material ID',
    material_name STRING COMMENT 'Material name',
    hs_code STRING NOT NULL COMMENT 'HS code',
    origin_country_code STRING NOT NULL COMMENT 'Origin country',
    destination_country_code STRING NOT NULL COMMENT 'Destination country',
    tariff_rate DECIMAL(8,4) COMMENT 'Base tariff rate',
    total_duty_rate DECIMAL(8,4) COMMENT 'Total duty rate (all duties)',
    trade_agreement STRING COMMENT 'Applicable trade agreement',
    duty_amount_per_unit DECIMAL(18,4) COMMENT 'Duty per unit',
    currency_code STRING COMMENT 'Currency',
    annual_import_volume DECIMAL(18,4) COMMENT 'Annual import volume',
    annual_duty_cost DECIMAL(18,2) COMMENT 'Annual duty cost',
    effective_date DATE COMMENT 'Rate effective date',
    updated_at TIMESTAMP COMMENT 'Last update timestamp'
)
USING DELTA
COMMENT 'Silver layer - Material tariff impact analysis'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'silver'
)
""")

print("Created silver_material_tariff")

# COMMAND ----------

print(f"Silver layer tables created successfully in {catalog}.{schema}")
