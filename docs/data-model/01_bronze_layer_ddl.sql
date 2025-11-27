-- =============================================================================
-- SUPPLY CHAIN RESILIENCY NETWORK ANALYSIS
-- Bronze Layer DDL - Raw Data Tables
-- Unity Catalog Compatible
-- =============================================================================
-- Bronze layer contains raw, unprocessed data as ingested from source systems
-- These tables serve as the landing zone for all supply chain data
-- =============================================================================

-- -----------------------------------------------------------------------------
-- DIMENSION TABLES
-- -----------------------------------------------------------------------------

-- Supplier dimension - stores supplier master data
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_dim_supplier (
    supplier_id STRING NOT NULL COMMENT 'Unique identifier for the supplier',
    supplier_name STRING NOT NULL COMMENT 'Legal name of the supplier',
    supplier_code STRING COMMENT 'Internal supplier code',
    country_code STRING COMMENT 'ISO 3166-1 alpha-2 country code',
    country_name STRING COMMENT 'Full country name',
    region STRING COMMENT 'Geographic region (APAC, EMEA, AMER)',
    city STRING COMMENT 'City where supplier is headquartered',
    latitude DOUBLE COMMENT 'Geographic latitude coordinate',
    longitude DOUBLE COMMENT 'Geographic longitude coordinate',
    tier INT COMMENT 'Supplier tier level (1=direct, 2=tier2, 3=tier3)',
    risk_score DOUBLE COMMENT 'Overall risk score (0-100)',
    risk_category STRING COMMENT 'Risk category: critical, high, medium, low',
    financial_stability_score DOUBLE COMMENT 'Financial health score (0-100)',
    quality_rating DOUBLE COMMENT 'Quality performance rating (0-5)',
    on_time_delivery_rate DOUBLE COMMENT 'On-time delivery percentage (0-100)',
    lead_time_days INT COMMENT 'Average lead time in days',
    certification_status STRING COMMENT 'Certification status (ISO, etc.)',
    is_single_source BOOLEAN COMMENT 'True if single source supplier',
    is_critical BOOLEAN COMMENT 'True if critical supplier',
    contract_start_date DATE COMMENT 'Contract start date',
    contract_end_date DATE COMMENT 'Contract end date',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_dim_supplier_pk PRIMARY KEY (supplier_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw supplier master data'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Material dimension - stores material/component master data
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_dim_material (
    material_id STRING NOT NULL COMMENT 'Unique identifier for the material',
    material_name STRING NOT NULL COMMENT 'Material name/description',
    material_code STRING COMMENT 'Internal material code (SKU)',
    material_type STRING COMMENT 'Type: raw_material, component, subassembly',
    category STRING COMMENT 'Material category',
    subcategory STRING COMMENT 'Material subcategory',
    unit_of_measure STRING COMMENT 'Unit of measure (EA, KG, L, etc.)',
    standard_cost DECIMAL(18,4) COMMENT 'Standard unit cost',
    currency_code STRING COMMENT 'Currency code (USD, EUR, etc.)',
    criticality STRING COMMENT 'Criticality level: critical, high, medium, low',
    lead_time_days INT COMMENT 'Standard lead time in days',
    safety_stock_days INT COMMENT 'Safety stock in days of supply',
    min_order_quantity DECIMAL(18,4) COMMENT 'Minimum order quantity',
    shelf_life_days INT COMMENT 'Shelf life in days (if applicable)',
    is_hazardous BOOLEAN COMMENT 'True if hazardous material',
    hs_code STRING COMMENT 'Harmonized System tariff code',
    country_of_origin STRING COMMENT 'Primary country of origin',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_dim_material_pk PRIMARY KEY (material_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw material/component master data'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Product dimension - stores finished goods master data
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_dim_product (
    product_id STRING NOT NULL COMMENT 'Unique identifier for the product',
    product_name STRING NOT NULL COMMENT 'Product name/description',
    product_code STRING COMMENT 'Internal product code (SKU)',
    product_family STRING COMMENT 'Product family/line',
    product_category STRING COMMENT 'Product category',
    unit_of_measure STRING COMMENT 'Unit of measure',
    standard_cost DECIMAL(18,4) COMMENT 'Standard unit cost',
    list_price DECIMAL(18,4) COMMENT 'List price',
    currency_code STRING COMMENT 'Currency code',
    is_active BOOLEAN COMMENT 'True if product is active',
    launch_date DATE COMMENT 'Product launch date',
    end_of_life_date DATE COMMENT 'End of life date',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_dim_product_pk PRIMARY KEY (product_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw finished goods master data'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Customer dimension - stores customer master data
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_dim_customer (
    customer_id STRING NOT NULL COMMENT 'Unique identifier for the customer',
    customer_name STRING NOT NULL COMMENT 'Customer name',
    customer_code STRING COMMENT 'Internal customer code',
    customer_type STRING COMMENT 'Type: distributor, oem, retailer, direct',
    country_code STRING COMMENT 'ISO 3166-1 alpha-2 country code',
    country_name STRING COMMENT 'Full country name',
    region STRING COMMENT 'Geographic region',
    city STRING COMMENT 'City',
    latitude DOUBLE COMMENT 'Geographic latitude coordinate',
    longitude DOUBLE COMMENT 'Geographic longitude coordinate',
    annual_revenue DECIMAL(18,2) COMMENT 'Annual revenue with customer',
    currency_code STRING COMMENT 'Currency code',
    priority STRING COMMENT 'Priority: platinum, gold, silver, bronze',
    is_active BOOLEAN COMMENT 'True if customer is active',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_dim_customer_pk PRIMARY KEY (customer_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw customer master data'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Tariff dimension - stores tariff rates by country and HS code
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_dim_tariff (
    tariff_id STRING NOT NULL COMMENT 'Unique identifier for tariff record',
    origin_country_code STRING NOT NULL COMMENT 'Origin country ISO code',
    destination_country_code STRING NOT NULL COMMENT 'Destination country ISO code',
    hs_code STRING NOT NULL COMMENT 'Harmonized System code',
    hs_description STRING COMMENT 'HS code description',
    tariff_rate DECIMAL(8,4) COMMENT 'Tariff rate as percentage',
    additional_duty DECIMAL(8,4) COMMENT 'Additional duty rate',
    anti_dumping_duty DECIMAL(8,4) COMMENT 'Anti-dumping duty rate',
    countervailing_duty DECIMAL(8,4) COMMENT 'Countervailing duty rate',
    effective_date DATE COMMENT 'Tariff effective date',
    expiry_date DATE COMMENT 'Tariff expiry date',
    trade_agreement STRING COMMENT 'Applicable trade agreement',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_dim_tariff_pk PRIMARY KEY (tariff_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw tariff/duty rates data'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- -----------------------------------------------------------------------------
-- FACT TABLES - Relationships
-- -----------------------------------------------------------------------------

-- Supplier-Material relationship fact
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_fact_supplier_material (
    supplier_material_id STRING NOT NULL COMMENT 'Unique identifier for relationship',
    supplier_id STRING NOT NULL COMMENT 'Foreign key to supplier',
    material_id STRING NOT NULL COMMENT 'Foreign key to material',
    is_primary_supplier BOOLEAN COMMENT 'True if primary supplier for this material',
    supply_share_pct DECIMAL(5,2) COMMENT 'Percentage of material supplied',
    unit_price DECIMAL(18,4) COMMENT 'Negotiated unit price',
    currency_code STRING COMMENT 'Price currency',
    min_order_quantity DECIMAL(18,4) COMMENT 'Minimum order quantity',
    lead_time_days INT COMMENT 'Lead time in days',
    capacity_per_month DECIMAL(18,4) COMMENT 'Monthly supply capacity',
    quality_score DOUBLE COMMENT 'Quality score (0-100)',
    on_time_delivery_rate DOUBLE COMMENT 'On-time delivery rate (0-100)',
    relationship_start_date DATE COMMENT 'Relationship start date',
    relationship_end_date DATE COMMENT 'Relationship end date',
    contract_id STRING COMMENT 'Contract reference',
    is_active BOOLEAN COMMENT 'True if relationship is active',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_fact_supplier_material_pk PRIMARY KEY (supplier_material_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw supplier-material relationships'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Material-Product relationship fact (Bill of Materials)
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_fact_material_product (
    material_product_id STRING NOT NULL COMMENT 'Unique identifier for BOM line',
    material_id STRING NOT NULL COMMENT 'Foreign key to material',
    product_id STRING NOT NULL COMMENT 'Foreign key to product',
    quantity_per_unit DECIMAL(18,6) COMMENT 'Quantity of material per product unit',
    unit_of_measure STRING COMMENT 'Unit of measure',
    scrap_rate DECIMAL(5,4) COMMENT 'Expected scrap rate',
    is_critical_component BOOLEAN COMMENT 'True if critical to product',
    substitution_allowed BOOLEAN COMMENT 'True if substitution allowed',
    substitute_material_id STRING COMMENT 'Approved substitute material ID',
    effective_date DATE COMMENT 'BOM effective date',
    expiry_date DATE COMMENT 'BOM expiry date',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_fact_material_product_pk PRIMARY KEY (material_product_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw material-product relationships (BOM)'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Product-Customer relationship fact
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_fact_product_customer (
    product_customer_id STRING NOT NULL COMMENT 'Unique identifier for relationship',
    product_id STRING NOT NULL COMMENT 'Foreign key to product',
    customer_id STRING NOT NULL COMMENT 'Foreign key to customer',
    annual_demand DECIMAL(18,4) COMMENT 'Annual demand quantity',
    unit_of_measure STRING COMMENT 'Unit of measure',
    contracted_price DECIMAL(18,4) COMMENT 'Contracted unit price',
    currency_code STRING COMMENT 'Price currency',
    min_order_quantity DECIMAL(18,4) COMMENT 'Minimum order quantity',
    lead_time_days INT COMMENT 'Promised lead time',
    service_level_target DECIMAL(5,2) COMMENT 'Target service level %',
    contract_start_date DATE COMMENT 'Contract start date',
    contract_end_date DATE COMMENT 'Contract end date',
    is_active BOOLEAN COMMENT 'True if relationship is active',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_fact_product_customer_pk PRIMARY KEY (product_customer_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw product-customer relationships'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);

-- Supplier-Supplier relationship fact (for tier mapping)
CREATE TABLE IF NOT EXISTS ${catalog}.${schema}.bronze_fact_supplier_supplier (
    supplier_supplier_id STRING NOT NULL COMMENT 'Unique identifier for relationship',
    parent_supplier_id STRING NOT NULL COMMENT 'Parent/buyer supplier ID',
    child_supplier_id STRING NOT NULL COMMENT 'Child/vendor supplier ID',
    relationship_type STRING COMMENT 'Type: tier2, tier3, subcontractor',
    supply_share_pct DECIMAL(5,2) COMMENT 'Share of supply',
    is_disclosed BOOLEAN COMMENT 'True if relationship is disclosed',
    discovery_date DATE COMMENT 'Date relationship was discovered',
    confidence_score DOUBLE COMMENT 'Confidence in relationship (0-100)',
    is_active BOOLEAN COMMENT 'True if relationship is active',
    created_at TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP COMMENT 'Last update timestamp',
    source_system STRING COMMENT 'Source system identifier',
    CONSTRAINT bronze_fact_supplier_supplier_pk PRIMARY KEY (supplier_supplier_id)
)
USING DELTA
COMMENT 'Bronze layer - Raw supplier-supplier tier relationships'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'bronze'
);
