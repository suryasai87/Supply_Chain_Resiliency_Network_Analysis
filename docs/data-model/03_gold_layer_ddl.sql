-- =============================================================================
-- SUPPLY CHAIN RESILIENCY NETWORK ANALYSIS
-- Gold Layer DDL - Aggregated Analytics Tables
-- Unity Catalog Compatible
-- =============================================================================
-- Gold layer contains business-ready aggregations and metrics
-- Optimized for dashboards, reporting, and ML models
-- =============================================================================

-- -----------------------------------------------------------------------------
-- NETWORK ANALYTICS METRICS
-- -----------------------------------------------------------------------------

-- Node-level supply chain metrics
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_metrics_node (
    node_id STRING NOT NULL COMMENT 'Node identifier',
    node_type STRING NOT NULL COMMENT 'Node type: supplier, material, product, customer',
    label STRING NOT NULL COMMENT 'Display label',
    -- Centrality metrics
    degree_centrality DOUBLE COMMENT 'Degree centrality (0-1)',
    in_degree_centrality DOUBLE COMMENT 'In-degree centrality',
    out_degree_centrality DOUBLE COMMENT 'Out-degree centrality',
    betweenness_centrality DOUBLE COMMENT 'Betweenness centrality (0-1)',
    closeness_centrality DOUBLE COMMENT 'Closeness centrality (0-1)',
    eigenvector_centrality DOUBLE COMMENT 'Eigenvector centrality (0-1)',
    pagerank DOUBLE COMMENT 'PageRank score',
    -- Risk metrics
    risk_score DOUBLE COMMENT 'Overall risk score (0-100)',
    risk_category STRING COMMENT 'Risk category: critical, high, medium, low',
    single_point_of_failure BOOLEAN COMMENT 'True if SPOF',
    concentration_risk DOUBLE COMMENT 'Geographic/supplier concentration (0-100)',
    -- Impact metrics
    downstream_impact_count INT COMMENT 'Number of downstream nodes affected',
    upstream_dependency_count INT COMMENT 'Number of upstream dependencies',
    revenue_at_risk DECIMAL(18,2) COMMENT 'Revenue at risk if node fails',
    currency_code STRING COMMENT 'Currency for monetary values',
    -- Ranking
    overall_rank INT COMMENT 'Overall importance rank',
    risk_rank INT COMMENT 'Risk ranking (1 = highest risk)',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Metrics computation timestamp',
    CONSTRAINT gold_metrics_node_pk PRIMARY KEY (node_id)
)
USING DELTA
COMMENT 'Gold layer - Node-level network analytics metrics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Edge-level supply chain metrics
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_metrics_edge (
    edge_id STRING NOT NULL COMMENT 'Edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node ID',
    target_node_id STRING NOT NULL COMMENT 'Target node ID',
    edge_type STRING NOT NULL COMMENT 'Edge type',
    -- Flow metrics
    flow_capacity DOUBLE COMMENT 'Maximum flow capacity',
    current_flow DOUBLE COMMENT 'Current flow volume',
    utilization_pct DOUBLE COMMENT 'Capacity utilization percentage',
    is_bottleneck BOOLEAN COMMENT 'True if bottleneck (>=95% util)',
    is_critical_path BOOLEAN COMMENT 'True if on critical path',
    -- Cost metrics
    unit_cost DECIMAL(18,4) COMMENT 'Unit cost',
    total_flow_value DECIMAL(18,2) COMMENT 'Total value flowing through edge',
    currency_code STRING COMMENT 'Currency',
    -- Risk metrics
    edge_risk_score DOUBLE COMMENT 'Edge risk score (0-100)',
    redundancy_count INT COMMENT 'Number of alternative paths',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Metrics computation timestamp',
    CONSTRAINT gold_metrics_edge_pk PRIMARY KEY (edge_id)
)
USING DELTA
COMMENT 'Gold layer - Edge-level network analytics metrics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- -----------------------------------------------------------------------------
-- MAX-FLOW ANALYSIS RESULTS
-- -----------------------------------------------------------------------------

-- Max-flow computation results
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_maxflow_results (
    analysis_id STRING NOT NULL COMMENT 'Analysis run identifier',
    source_node_id STRING NOT NULL COMMENT 'Flow source node',
    sink_node_id STRING NOT NULL COMMENT 'Flow sink node',
    source_label STRING COMMENT 'Source node label',
    sink_label STRING COMMENT 'Sink node label',
    -- Max flow results
    max_flow_value DOUBLE NOT NULL COMMENT 'Maximum flow value',
    unit_of_measure STRING COMMENT 'Flow unit of measure',
    -- Bottleneck analysis
    bottleneck_edges ARRAY<STRING> COMMENT 'List of bottleneck edge IDs',
    bottleneck_count INT COMMENT 'Number of bottlenecks',
    min_cut_edges ARRAY<STRING> COMMENT 'Minimum cut edge IDs',
    min_cut_value DOUBLE COMMENT 'Minimum cut value',
    -- Path analysis
    total_paths INT COMMENT 'Total number of paths',
    critical_path_edges ARRAY<STRING> COMMENT 'Critical path edge IDs',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Computation timestamp',
    computation_time_ms BIGINT COMMENT 'Computation time in milliseconds',
    CONSTRAINT gold_maxflow_results_pk PRIMARY KEY (analysis_id)
)
USING DELTA
COMMENT 'Gold layer - Max-flow analysis results'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Max-flow edge details
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_maxflow_edge_flows (
    analysis_id STRING NOT NULL COMMENT 'Analysis run identifier',
    edge_id STRING NOT NULL COMMENT 'Edge identifier',
    source_node_id STRING NOT NULL COMMENT 'Source node',
    target_node_id STRING NOT NULL COMMENT 'Target node',
    source_label STRING COMMENT 'Source label',
    target_label STRING COMMENT 'Target label',
    -- Flow values
    flow_capacity DOUBLE COMMENT 'Edge capacity',
    allocated_flow DOUBLE COMMENT 'Flow allocated in max-flow',
    utilization_pct DOUBLE COMMENT 'Utilization percentage',
    residual_capacity DOUBLE COMMENT 'Remaining capacity',
    -- Flags
    is_saturated BOOLEAN COMMENT 'True if fully utilized',
    is_bottleneck BOOLEAN COMMENT 'True if bottleneck',
    is_on_critical_path BOOLEAN COMMENT 'True if on critical path',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Computation timestamp',
    CONSTRAINT gold_maxflow_edge_flows_pk PRIMARY KEY (analysis_id, edge_id)
)
USING DELTA
COMMENT 'Gold layer - Max-flow edge-level details'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- -----------------------------------------------------------------------------
-- SUPPLIER TIER ANALYSIS
-- -----------------------------------------------------------------------------

-- Supplier tier hierarchy analysis
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_supplier_tier_analysis (
    supplier_id STRING NOT NULL COMMENT 'Supplier identifier',
    supplier_name STRING NOT NULL COMMENT 'Supplier name',
    tier INT NOT NULL COMMENT 'Supplier tier level',
    -- Tier metrics
    direct_customers_count INT COMMENT 'Direct downstream customers (tier-1)',
    indirect_customers_count INT COMMENT 'Indirect downstream (all tiers)',
    direct_suppliers_count INT COMMENT 'Direct upstream suppliers',
    indirect_suppliers_count INT COMMENT 'Indirect upstream (all tiers)',
    supply_chain_depth INT COMMENT 'Max depth in supply chain',
    -- Risk analysis
    risk_score DOUBLE COMMENT 'Risk score (0-100)',
    risk_category STRING COMMENT 'Risk category',
    is_hidden_dependency BOOLEAN COMMENT 'True if hidden/undisclosed',
    discovery_confidence DOUBLE COMMENT 'Discovery confidence (0-100)',
    -- Impact analysis
    products_impacted INT COMMENT 'Number of products affected',
    revenue_at_risk DECIMAL(18,2) COMMENT 'Revenue at risk',
    currency_code STRING COMMENT 'Currency',
    -- Geographic
    country_code STRING COMMENT 'Country code',
    region STRING COMMENT 'Geographic region',
    latitude DOUBLE COMMENT 'Latitude',
    longitude DOUBLE COMMENT 'Longitude',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Computation timestamp',
    CONSTRAINT gold_supplier_tier_pk PRIMARY KEY (supplier_id)
)
USING DELTA
COMMENT 'Gold layer - Supplier tier hierarchy analysis'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- -----------------------------------------------------------------------------
-- TARIFF IMPACT ANALYSIS
-- -----------------------------------------------------------------------------

-- Tariff impact by material
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_tariff_material_impact (
    material_id STRING NOT NULL COMMENT 'Material identifier',
    material_name STRING NOT NULL COMMENT 'Material name',
    hs_code STRING COMMENT 'HS tariff code',
    -- Origin analysis
    primary_origin_country STRING COMMENT 'Primary origin country',
    origin_countries ARRAY<STRING> COMMENT 'All origin countries',
    origin_country_count INT COMMENT 'Number of origin countries',
    -- Tariff rates
    min_tariff_rate DECIMAL(8,4) COMMENT 'Minimum tariff rate',
    max_tariff_rate DECIMAL(8,4) COMMENT 'Maximum tariff rate',
    weighted_avg_tariff_rate DECIMAL(8,4) COMMENT 'Weighted average tariff',
    -- Cost impact
    annual_import_value DECIMAL(18,2) COMMENT 'Annual import value',
    annual_duty_cost DECIMAL(18,2) COMMENT 'Annual duty cost',
    duty_cost_pct DECIMAL(8,4) COMMENT 'Duty as % of value',
    currency_code STRING COMMENT 'Currency',
    -- Risk metrics
    tariff_volatility_score DOUBLE COMMENT 'Tariff volatility (0-100)',
    trade_war_exposure DOUBLE COMMENT 'Trade war exposure (0-100)',
    -- Products impacted
    products_impacted INT COMMENT 'Number of products affected',
    product_ids ARRAY<STRING> COMMENT 'Affected product IDs',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Computation timestamp',
    CONSTRAINT gold_tariff_material_pk PRIMARY KEY (material_id)
)
USING DELTA
COMMENT 'Gold layer - Tariff impact by material'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Tariff impact by country
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_tariff_country_impact (
    country_code STRING NOT NULL COMMENT 'Country ISO code',
    country_name STRING NOT NULL COMMENT 'Country name',
    -- Geographic
    region STRING COMMENT 'Geographic region',
    latitude DOUBLE COMMENT 'Country centroid latitude',
    longitude DOUBLE COMMENT 'Country centroid longitude',
    -- Tariff summary
    avg_tariff_rate DECIMAL(8,4) COMMENT 'Average tariff rate',
    max_tariff_rate DECIMAL(8,4) COMMENT 'Maximum tariff rate',
    -- Import analysis
    material_count INT COMMENT 'Number of materials sourced',
    supplier_count INT COMMENT 'Number of suppliers',
    annual_import_value DECIMAL(18,2) COMMENT 'Annual import value',
    annual_duty_cost DECIMAL(18,2) COMMENT 'Annual duty cost',
    currency_code STRING COMMENT 'Currency',
    -- Risk metrics
    concentration_risk DOUBLE COMMENT 'Concentration risk (0-100)',
    geopolitical_risk DOUBLE COMMENT 'Geopolitical risk (0-100)',
    overall_risk_score DOUBLE COMMENT 'Overall risk score (0-100)',
    risk_category STRING COMMENT 'Risk category',
    -- Trade agreements
    trade_agreements ARRAY<STRING> COMMENT 'Active trade agreements',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Computation timestamp',
    CONSTRAINT gold_tariff_country_pk PRIMARY KEY (country_code)
)
USING DELTA
COMMENT 'Gold layer - Tariff impact by country'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- -----------------------------------------------------------------------------
-- AGGREGATED DASHBOARD METRICS
-- -----------------------------------------------------------------------------

-- Overall supply chain health metrics
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_supply_chain_health (
    metric_date DATE NOT NULL COMMENT 'Metric date',
    -- Network statistics
    total_suppliers INT COMMENT 'Total supplier count',
    tier1_suppliers INT COMMENT 'Tier 1 supplier count',
    tier2_suppliers INT COMMENT 'Tier 2 supplier count',
    tier3_suppliers INT COMMENT 'Tier 3 supplier count',
    hidden_suppliers INT COMMENT 'Hidden/discovered suppliers',
    total_materials INT COMMENT 'Total material count',
    total_products INT COMMENT 'Total product count',
    total_customers INT COMMENT 'Total customer count',
    -- Relationship statistics
    total_edges INT COMMENT 'Total relationships',
    supplier_material_edges INT COMMENT 'Supplier-material relationships',
    material_product_edges INT COMMENT 'Material-product relationships',
    product_customer_edges INT COMMENT 'Product-customer relationships',
    -- Risk summary
    critical_risk_nodes INT COMMENT 'Critical risk node count',
    high_risk_nodes INT COMMENT 'High risk node count',
    medium_risk_nodes INT COMMENT 'Medium risk node count',
    low_risk_nodes INT COMMENT 'Low risk node count',
    single_source_materials INT COMMENT 'Single source materials',
    -- Flow metrics
    total_max_flow DOUBLE COMMENT 'Total max flow capacity',
    bottleneck_count INT COMMENT 'Number of bottlenecks',
    avg_utilization_pct DOUBLE COMMENT 'Average utilization',
    -- Cost metrics
    total_supply_chain_value DECIMAL(18,2) COMMENT 'Total supply chain value',
    total_tariff_exposure DECIMAL(18,2) COMMENT 'Total tariff exposure',
    currency_code STRING COMMENT 'Currency',
    -- Health scores
    overall_health_score DOUBLE COMMENT 'Overall health (0-100)',
    resilience_score DOUBLE COMMENT 'Resilience score (0-100)',
    concentration_risk_score DOUBLE COMMENT 'Concentration risk (0-100)',
    -- Metadata
    computed_at TIMESTAMP COMMENT 'Computation timestamp',
    CONSTRAINT gold_supply_chain_health_pk PRIMARY KEY (metric_date)
)
USING DELTA
COMMENT 'Gold layer - Overall supply chain health metrics'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- Risk alerts and recommendations
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.gold_risk_alerts (
    alert_id STRING NOT NULL COMMENT 'Alert identifier',
    alert_date TIMESTAMP NOT NULL COMMENT 'Alert timestamp',
    alert_type STRING NOT NULL COMMENT 'Alert type: risk, bottleneck, concentration, tariff',
    severity STRING NOT NULL COMMENT 'Severity: critical, high, medium, low',
    -- Alert details
    title STRING NOT NULL COMMENT 'Alert title',
    description STRING COMMENT 'Alert description',
    -- Affected entities
    affected_node_ids ARRAY<STRING> COMMENT 'Affected node IDs',
    affected_node_type STRING COMMENT 'Node type affected',
    affected_edge_ids ARRAY<STRING> COMMENT 'Affected edge IDs',
    -- Impact assessment
    revenue_at_risk DECIMAL(18,2) COMMENT 'Revenue at risk',
    products_impacted INT COMMENT 'Products impacted',
    customers_impacted INT COMMENT 'Customers impacted',
    currency_code STRING COMMENT 'Currency',
    -- Recommendations
    recommended_actions ARRAY<STRING> COMMENT 'Recommended actions',
    alternative_suppliers ARRAY<STRING> COMMENT 'Alternative supplier IDs',
    -- Status
    status STRING DEFAULT 'open' COMMENT 'Status: open, acknowledged, resolved',
    acknowledged_by STRING COMMENT 'Acknowledged by user',
    acknowledged_at TIMESTAMP COMMENT 'Acknowledged timestamp',
    resolved_at TIMESTAMP COMMENT 'Resolution timestamp',
    -- Metadata
    created_at TIMESTAMP COMMENT 'Alert creation timestamp',
    CONSTRAINT gold_risk_alerts_pk PRIMARY KEY (alert_id)
)
USING DELTA
COMMENT 'Gold layer - Risk alerts and recommendations'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);
