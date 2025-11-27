# Databricks notebook source
# MAGIC %md
# MAGIC # Populate Sample Data
# MAGIC Supply Chain Resiliency Network Analysis
# MAGIC
# MAGIC This notebook populates all tables with sample data for demonstration

# COMMAND ----------

# Get parameters
dbutils.widgets.text("catalog", "supply_chain_analytics")
dbutils.widgets.text("schema", "network_analysis")

catalog = dbutils.widgets.get("catalog")
schema = dbutils.widgets.get("schema")

print(f"Populating sample data in {catalog}.{schema}")

spark.sql(f"USE CATALOG {catalog}")
spark.sql(f"USE SCHEMA {schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bronze Layer - Dimension Tables

# COMMAND ----------

# Insert Suppliers
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_dim_supplier VALUES
  ('SUPP-001', 'Acme Electronics', 'ACM001', 'US', 'United States', 'AMER', 'San Jose', 37.3382, -121.8863, 1, 45.0, 'medium', 78.5, 4.2, 94.5, 14, 'ISO-9001', false, false, '2020-01-01', '2025-12-31', current_timestamp(), current_timestamp(), 'ERP'),
  ('SUPP-002', 'Global Components Ltd', 'GCL002', 'DE', 'Germany', 'EMEA', 'Munich', 48.1351, 11.5820, 1, 72.0, 'high', 82.3, 4.5, 91.2, 21, 'ISO-9001', false, true, '2019-06-15', '2024-06-14', current_timestamp(), current_timestamp(), 'ERP'),
  ('SUPP-003', 'Pacific Materials Inc', 'PMI003', 'JP', 'Japan', 'APAC', 'Tokyo', 35.6762, 139.6503, 1, 28.0, 'low', 91.2, 4.8, 98.1, 10, 'ISO-9001', false, false, '2021-03-01', '2026-02-28', current_timestamp(), current_timestamp(), 'ERP'),
  ('SUPP-004', 'Euro Parts GmbH', 'EPG004', 'DE', 'Germany', 'EMEA', 'Stuttgart', 48.7758, 9.1829, 1, 35.0, 'low', 85.7, 4.3, 95.8, 18, 'ISO-9001', false, false, '2020-09-01', '2025-08-31', current_timestamp(), current_timestamp(), 'ERP'),
  ('SUPP-005', 'Shenzhen Semiconductor', 'SZS005', 'CN', 'China', 'APAC', 'Shenzhen', 22.5431, 114.0579, 2, 88.0, 'critical', 65.2, 3.9, 87.3, 28, 'ISO-9001', true, true, '2018-01-01', '2025-12-31', current_timestamp(), current_timestamp(), 'Manual'),
  ('SUPP-006', 'Taiwan Foundry Corp', 'TFC006', 'TW', 'Taiwan', 'APAC', 'Hsinchu', 24.8138, 120.9675, 2, 85.0, 'critical', 88.9, 4.6, 92.1, 35, 'ISO-9001', true, true, '2017-04-01', '2024-03-31', current_timestamp(), current_timestamp(), 'Manual'),
  ('SUPP-007', 'Korea Chemical Co', 'KCC007', 'KR', 'South Korea', 'APAC', 'Seoul', 37.5665, 126.9780, 2, 68.0, 'high', 79.4, 4.1, 89.5, 21, 'ISO-9001', false, false, '2019-07-01', '2024-06-30', current_timestamp(), current_timestamp(), 'Manual'),
  ('SUPP-008', 'Vietnam Assembly Ltd', 'VAL008', 'VN', 'Vietnam', 'APAC', 'Ho Chi Minh', 10.8231, 106.6297, 2, 52.0, 'medium', 71.8, 3.8, 86.7, 25, 'ISO-9001', false, false, '2020-02-01', '2025-01-31', current_timestamp(), current_timestamp(), 'Manual'),
  ('SUPP-009', 'India Tech Solutions', 'ITS009', 'IN', 'India', 'APAC', 'Bangalore', 12.9716, 77.5946, 2, 48.0, 'medium', 74.3, 4.0, 88.2, 30, 'ISO-9001', false, false, '2021-01-01', '2026-12-31', current_timestamp(), current_timestamp(), 'Manual'),
  ('SUPP-010', 'Rare Earth Mining Co', 'REM010', 'CN', 'China', 'APAC', 'Baotou', 40.6571, 109.8403, 3, 95.0, 'critical', 55.1, 3.5, 78.9, 45, null, true, true, '2015-01-01', '2025-12-31', current_timestamp(), current_timestamp(), 'Discovery'),
  ('SUPP-011', 'Mining Corporation', 'MNC011', 'AU', 'Australia', 'APAC', 'Perth', -31.9505, 115.8605, 3, 62.0, 'high', 82.6, 4.2, 91.3, 35, 'ISO-9001', false, false, '2018-06-01', '2025-05-31', current_timestamp(), current_timestamp(), 'Discovery'),
  ('SUPP-012', 'Chemical Base Industries', 'CBI012', 'SA', 'Saudi Arabia', 'EMEA', 'Jubail', 27.0046, 49.6586, 3, 55.0, 'medium', 78.9, 4.0, 89.7, 28, 'ISO-9001', false, false, '2019-03-01', '2024-02-28', current_timestamp(), current_timestamp(), 'Discovery'),
  ('SUPP-013', 'Raw Materials Corp', 'RMC013', 'BR', 'Brazil', 'AMER', 'Sao Paulo', -23.5505, -46.6333, 3, 42.0, 'low', 72.4, 3.9, 85.6, 32, null, false, false, '2020-01-01', '2025-12-31', current_timestamp(), current_timestamp(), 'Discovery'),
  ('SUPP-014', 'Single Source Minerals', 'SSM014', 'CN', 'China', 'APAC', 'Ganzhou', 25.8292, 114.9336, 4, 98.0, 'critical', 48.2, 3.2, 72.1, 60, null, true, true, '2010-01-01', '2030-12-31', current_timestamp(), current_timestamp(), 'Discovery')
""")
print("Inserted suppliers")

# COMMAND ----------

# Insert Materials
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_dim_material VALUES
  ('MAT-001', 'Semiconductor IC - ARM Cortex', 'IC-ARM-M4', 'component', 'Electronics', 'Integrated Circuits', 'EA', 45.00, 'USD', 'critical', 35, 14, 1000, null, false, '8542.31', 'TW', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-002', 'PCB Substrate FR-4', 'PCB-FR4-6L', 'component', 'Electronics', 'PCB', 'EA', 12.50, 'USD', 'high', 21, 10, 500, null, false, '8534.00', 'CN', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-003', 'Capacitor Array MLCC', 'CAP-MLCC-100', 'component', 'Electronics', 'Passive', 'EA', 0.85, 'USD', 'medium', 14, 7, 10000, null, false, '8532.24', 'JP', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-004', 'Aluminum Housing 6061-T6', 'ALU-6061-ENC', 'raw_material', 'Metals', 'Aluminum', 'EA', 8.25, 'USD', 'low', 18, 10, 200, null, false, '7616.99', 'US', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-005', 'Lithium Ion Battery Cell', 'BAT-LI-3000', 'component', 'Energy', 'Battery', 'EA', 22.00, 'USD', 'high', 28, 14, 500, 365, true, '8507.60', 'CN', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-006', 'Rare Earth Magnets NdFeB', 'MAG-NDFEB-N52', 'raw_material', 'Magnetics', 'Rare Earth', 'EA', 15.00, 'USD', 'critical', 45, 21, 1000, null, false, '8505.11', 'CN', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-007', 'Display Module OLED', 'DSP-OLED-5IN', 'component', 'Electronics', 'Display', 'EA', 35.00, 'USD', 'high', 28, 14, 200, null, false, '8524.91', 'KR', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-008', 'Thermal Compound', 'THM-PASTE-HQ', 'raw_material', 'Chemicals', 'Thermal', 'KG', 125.00, 'USD', 'medium', 14, 7, 10, 180, false, '3824.99', 'DE', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-009', 'Copper Wire 99.9%', 'COP-WIRE-AWG22', 'raw_material', 'Metals', 'Copper', 'KG', 12.00, 'USD', 'low', 21, 10, 100, null, false, '7408.11', 'CL', current_timestamp(), current_timestamp(), 'PLM'),
  ('MAT-010', 'Stainless Steel 316L', 'SS-316L-SHEET', 'raw_material', 'Metals', 'Steel', 'KG', 8.50, 'USD', 'low', 18, 10, 500, null, false, '7219.31', 'JP', current_timestamp(), current_timestamp(), 'PLM')
""")
print("Inserted materials")

# COMMAND ----------

# Insert Products
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_dim_product VALUES
  ('PROD-001', 'Industrial Controller Unit X500', 'ICU-X500', 'Controllers', 'Industrial Automation', 'EA', 285.00, 450.00, 'USD', true, '2022-01-15', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('PROD-002', 'Smart Sensor Module S200', 'SSM-S200', 'Sensors', 'Industrial Automation', 'EA', 125.00, 195.00, 'USD', true, '2021-06-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('PROD-003', 'Power Supply Unit PSU-1000', 'PSU-1000W', 'Power', 'Power Electronics', 'EA', 175.00, 275.00, 'USD', true, '2020-03-15', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('PROD-004', 'Display Assembly DA-7', 'DA-7-TOUCH', 'Displays', 'HMI', 'EA', 210.00, 325.00, 'USD', true, '2022-09-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('PROD-005', 'Battery Pack BP-5000', 'BP-5000-48V', 'Energy Storage', 'Power Electronics', 'EA', 485.00, 750.00, 'USD', true, '2023-01-01', null, current_timestamp(), current_timestamp(), 'PLM')
""")
print("Inserted products")

# COMMAND ----------

# Insert Customers
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_dim_customer VALUES
  ('CUST-001', 'TechCorp Industries', 'TC001', 'oem', 'US', 'United States', 'AMER', 'Detroit', 42.3314, -83.0458, 12500000.00, 'USD', 'platinum', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('CUST-002', 'Manufacturing Excellence Co', 'MEC002', 'oem', 'DE', 'Germany', 'EMEA', 'Frankfurt', 50.1109, 8.6821, 8750000.00, 'EUR', 'gold', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('CUST-003', 'Pacific Automation Ltd', 'PAL003', 'distributor', 'JP', 'Japan', 'APAC', 'Osaka', 34.6937, 135.5023, 5200000.00, 'JPY', 'gold', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('CUST-004', 'Smart Factory Solutions', 'SFS004', 'oem', 'CN', 'China', 'APAC', 'Shanghai', 31.2304, 121.4737, 6800000.00, 'CNY', 'silver', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('CUST-005', 'EuroTech Systems', 'ETS005', 'distributor', 'FR', 'France', 'EMEA', 'Paris', 48.8566, 2.3522, 3500000.00, 'EUR', 'silver', true, current_timestamp(), current_timestamp(), 'CRM')
""")
print("Inserted customers")

# COMMAND ----------

# Insert Tariffs
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_dim_tariff VALUES
  ('TAR-001', 'CN', 'US', '8542.31', 'Electronic integrated circuits', 25.0000, 0.0000, 0.0000, 0.0000, '2018-07-06', null, null, current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-002', 'TW', 'US', '8542.31', 'Electronic integrated circuits', 0.0000, 0.0000, 0.0000, 0.0000, '2020-01-01', null, 'ITA', current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-003', 'CN', 'US', '8507.60', 'Lithium-ion batteries', 7.5000, 0.0000, 0.0000, 0.0000, '2018-09-24', null, null, current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-004', 'JP', 'US', '8532.24', 'Multilayer ceramic capacitors', 0.0000, 0.0000, 0.0000, 0.0000, '2020-01-01', null, 'ITA', current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-005', 'KR', 'US', '8524.91', 'Display modules', 0.0000, 0.0000, 0.0000, 0.0000, '2012-03-15', null, 'KORUS', current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-006', 'CN', 'US', '8505.11', 'Permanent magnets', 25.0000, 0.0000, 0.0000, 0.0000, '2018-08-23', null, null, current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-007', 'DE', 'US', '3824.99', 'Chemical products', 0.0000, 0.0000, 0.0000, 0.0000, '2020-01-01', null, null, current_timestamp(), current_timestamp(), 'Trade'),
  ('TAR-008', 'CN', 'DE', '8542.31', 'Electronic integrated circuits', 0.0000, 0.0000, 0.0000, 0.0000, '2020-01-01', null, 'EU-CN', current_timestamp(), current_timestamp(), 'Trade')
""")
print("Inserted tariffs")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bronze Layer - Fact Tables

# COMMAND ----------

# Insert Supplier-Material relationships
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_fact_supplier_material VALUES
  ('SM-001', 'SUPP-001', 'MAT-001', true, 60.00, 42.00, 'USD', 1000, 30, 50000, 92.5, 94.2, '2020-01-01', null, 'CON-001', true, current_timestamp(), current_timestamp(), 'ERP'),
  ('SM-002', 'SUPP-002', 'MAT-001', false, 40.00, 48.00, 'USD', 500, 35, 30000, 89.8, 91.5, '2020-06-01', null, 'CON-002', true, current_timestamp(), current_timestamp(), 'ERP'),
  ('SM-003', 'SUPP-002', 'MAT-002', true, 70.00, 11.50, 'USD', 500, 21, 80000, 94.1, 93.2, '2019-06-15', null, 'CON-002', true, current_timestamp(), current_timestamp(), 'ERP'),
  ('SM-004', 'SUPP-003', 'MAT-003', true, 80.00, 0.80, 'USD', 5000, 14, 500000, 98.2, 98.5, '2021-03-01', null, 'CON-003', true, current_timestamp(), current_timestamp(), 'ERP'),
  ('SM-005', 'SUPP-004', 'MAT-004', true, 100.00, 8.00, 'USD', 200, 18, 25000, 95.5, 96.1, '2020-09-01', null, 'CON-004', true, current_timestamp(), current_timestamp(), 'ERP'),
  ('SM-006', 'SUPP-005', 'MAT-001', false, 0.00, 38.00, 'USD', 2000, 35, 100000, 85.2, 87.1, '2018-01-01', null, 'CON-005', true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SM-007', 'SUPP-006', 'MAT-001', false, 0.00, 40.00, 'USD', 1500, 42, 80000, 91.5, 92.8, '2017-04-01', null, 'CON-006', true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SM-008', 'SUPP-007', 'MAT-008', true, 100.00, 120.00, 'USD', 5, 18, 500, 88.9, 89.5, '2019-07-01', null, 'CON-007', true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SM-009', 'SUPP-005', 'MAT-005', true, 55.00, 20.00, 'USD', 500, 30, 40000, 82.1, 85.6, '2018-01-01', null, 'CON-005', true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SM-010', 'SUPP-008', 'MAT-005', false, 45.00, 21.50, 'USD', 500, 25, 35000, 84.5, 86.2, '2020-02-01', null, 'CON-008', true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SM-011', 'SUPP-010', 'MAT-006', true, 100.00, 12.00, 'USD', 1000, 60, 20000, 72.5, 78.9, '2015-01-01', null, null, true, current_timestamp(), current_timestamp(), 'Discovery'),
  ('SM-012', 'SUPP-003', 'MAT-007', true, 100.00, 32.00, 'USD', 200, 28, 15000, 96.8, 97.2, '2021-03-01', null, 'CON-003', true, current_timestamp(), current_timestamp(), 'ERP')
""")
print("Inserted supplier-material relationships")

# COMMAND ----------

# Insert Material-Product relationships (BOM)
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_fact_material_product VALUES
  ('MP-001', 'MAT-001', 'PROD-001', 2.0, 'EA', 0.02, true, false, null, '2022-01-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-002', 'MAT-002', 'PROD-001', 1.0, 'EA', 0.01, true, false, null, '2022-01-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-003', 'MAT-003', 'PROD-001', 25.0, 'EA', 0.03, false, true, 'MAT-003B', '2022-01-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-004', 'MAT-004', 'PROD-001', 1.0, 'EA', 0.01, false, false, null, '2022-01-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-005', 'MAT-001', 'PROD-002', 1.0, 'EA', 0.02, true, false, null, '2021-06-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-006', 'MAT-003', 'PROD-002', 15.0, 'EA', 0.03, false, true, 'MAT-003B', '2021-06-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-007', 'MAT-006', 'PROD-002', 2.0, 'EA', 0.01, true, false, null, '2021-06-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-008', 'MAT-002', 'PROD-003', 1.0, 'EA', 0.01, true, false, null, '2020-03-15', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-009', 'MAT-003', 'PROD-003', 50.0, 'EA', 0.03, false, true, 'MAT-003B', '2020-03-15', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-010', 'MAT-005', 'PROD-003', 4.0, 'EA', 0.02, true, false, null, '2020-03-15', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-011', 'MAT-008', 'PROD-003', 0.05, 'KG', 0.05, false, false, null, '2020-03-15', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-012', 'MAT-007', 'PROD-004', 1.0, 'EA', 0.01, true, false, null, '2022-09-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-013', 'MAT-002', 'PROD-004', 1.0, 'EA', 0.01, false, false, null, '2022-09-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-014', 'MAT-005', 'PROD-005', 8.0, 'EA', 0.02, true, false, null, '2023-01-01', null, current_timestamp(), current_timestamp(), 'PLM'),
  ('MP-015', 'MAT-004', 'PROD-005', 1.0, 'EA', 0.01, false, false, null, '2023-01-01', null, current_timestamp(), current_timestamp(), 'PLM')
""")
print("Inserted material-product relationships (BOM)")

# COMMAND ----------

# Insert Product-Customer relationships
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_fact_product_customer VALUES
  ('PC-001', 'PROD-001', 'CUST-001', 15000.0, 'EA', 425.00, 'USD', 100, 21, 98.5, '2022-01-15', '2025-01-14', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-002', 'PROD-001', 'CUST-002', 8000.0, 'EA', 435.00, 'EUR', 50, 28, 97.0, '2022-03-01', '2025-02-28', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-003', 'PROD-002', 'CUST-001', 25000.0, 'EA', 185.00, 'USD', 200, 14, 99.0, '2021-06-01', '2024-05-31', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-004', 'PROD-002', 'CUST-003', 12000.0, 'EA', 190.00, 'USD', 100, 21, 97.5, '2021-09-01', '2024-08-31', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-005', 'PROD-003', 'CUST-001', 5000.0, 'EA', 260.00, 'USD', 50, 14, 98.0, '2020-03-15', '2025-03-14', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-006', 'PROD-003', 'CUST-004', 8000.0, 'EA', 265.00, 'USD', 100, 21, 96.5, '2021-01-01', '2024-12-31', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-007', 'PROD-004', 'CUST-002', 6000.0, 'EA', 315.00, 'EUR', 50, 21, 97.5, '2022-09-01', '2025-08-31', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-008', 'PROD-004', 'CUST-005', 4000.0, 'EA', 320.00, 'EUR', 25, 28, 96.0, '2023-01-01', '2025-12-31', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-009', 'PROD-005', 'CUST-001', 3000.0, 'EA', 725.00, 'USD', 25, 21, 98.5, '2023-01-01', '2026-12-31', true, current_timestamp(), current_timestamp(), 'CRM'),
  ('PC-010', 'PROD-005', 'CUST-004', 5000.0, 'EA', 735.00, 'USD', 50, 28, 97.0, '2023-03-01', '2026-02-28', true, current_timestamp(), current_timestamp(), 'CRM')
""")
print("Inserted product-customer relationships")

# COMMAND ----------

# Insert Supplier-Supplier tier relationships
spark.sql(f"""
INSERT INTO {catalog}.{schema}.bronze_fact_supplier_supplier VALUES
  ('SS-001', 'SUPP-001', 'SUPP-005', 'tier2', 65.00, true, '2018-06-01', 95.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-002', 'SUPP-001', 'SUPP-006', 'tier2', 35.00, true, '2018-06-01', 95.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-003', 'SUPP-002', 'SUPP-006', 'tier2', 70.00, true, '2019-01-01', 90.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-004', 'SUPP-002', 'SUPP-007', 'tier2', 30.00, true, '2019-01-01', 90.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-005', 'SUPP-003', 'SUPP-008', 'tier2', 50.00, true, '2021-06-01', 85.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-006', 'SUPP-003', 'SUPP-009', 'tier2', 50.00, true, '2021-06-01', 85.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-007', 'SUPP-004', 'SUPP-009', 'tier2', 100.00, true, '2020-12-01', 80.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-008', 'SUPP-005', 'SUPP-010', 'tier3', 100.00, false, '2022-03-15', 75.0, true, current_timestamp(), current_timestamp(), 'Discovery'),
  ('SS-009', 'SUPP-005', 'SUPP-011', 'tier3', 40.00, false, '2022-03-15', 70.0, true, current_timestamp(), current_timestamp(), 'Discovery'),
  ('SS-010', 'SUPP-006', 'SUPP-010', 'tier3', 80.00, false, '2022-04-01', 72.0, true, current_timestamp(), current_timestamp(), 'Discovery'),
  ('SS-011', 'SUPP-007', 'SUPP-011', 'tier3', 60.00, true, '2020-01-01', 88.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-012', 'SUPP-007', 'SUPP-012', 'tier3', 40.00, true, '2020-01-01', 88.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-013', 'SUPP-008', 'SUPP-012', 'tier3', 50.00, false, '2022-06-01', 65.0, true, current_timestamp(), current_timestamp(), 'Discovery'),
  ('SS-014', 'SUPP-009', 'SUPP-013', 'tier3', 100.00, true, '2021-03-01', 82.0, true, current_timestamp(), current_timestamp(), 'Manual'),
  ('SS-015', 'SUPP-010', 'SUPP-014', 'tier4', 100.00, false, '2023-01-01', 60.0, true, current_timestamp(), current_timestamp(), 'Discovery'),
  ('SS-016', 'SUPP-011', 'SUPP-014', 'tier4', 65.00, false, '2023-01-01', 55.0, true, current_timestamp(), current_timestamp(), 'Discovery')
""")
print("Inserted supplier tier relationships")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Silver Layer - Graph Tables

# COMMAND ----------

# Populate unified graph nodes from suppliers
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_nodes
SELECT
  supplier_id as node_id,
  'supplier' as node_type,
  supplier_name as label,
  supplier_name as name,
  risk_category,
  tier,
  country_code,
  latitude,
  longitude,
  null as degree_centrality,
  null as betweenness_centrality,
  null as pagerank,
  CASE tier WHEN 1 THEN 50.0 WHEN 2 THEN 45.0 WHEN 3 THEN 40.0 ELSE 55.0 END as node_size,
  CASE tier WHEN 1 THEN '#3b82f6' WHEN 2 THEN '#8b5cf6' WHEN 3 THEN '#f97316' ELSE '#ef4444' END as node_color,
  CASE WHEN tier >= 3 AND is_single_source THEN true ELSE false END as is_hidden,
  map('financial_stability', cast(financial_stability_score as string), 'quality_rating', cast(quality_rating as string)) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_dim_supplier
""")
print("Inserted supplier nodes")

# COMMAND ----------

# Populate unified graph nodes from materials
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_nodes
SELECT
  material_id as node_id,
  'material' as node_type,
  material_name as label,
  material_name as name,
  criticality as risk_category,
  null as tier,
  country_of_origin as country_code,
  null as latitude,
  null as longitude,
  null as degree_centrality,
  null as betweenness_centrality,
  null as pagerank,
  40.0 as node_size,
  '#8b5cf6' as node_color,
  false as is_hidden,
  map('category', category, 'hs_code', hs_code) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_dim_material
""")
print("Inserted material nodes")

# COMMAND ----------

# Populate unified graph nodes from products
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_nodes
SELECT
  product_id as node_id,
  'product' as node_type,
  product_name as label,
  product_name as name,
  null as risk_category,
  null as tier,
  null as country_code,
  null as latitude,
  null as longitude,
  null as degree_centrality,
  null as betweenness_centrality,
  null as pagerank,
  45.0 as node_size,
  '#06b6d4' as node_color,
  false as is_hidden,
  map('family', product_family, 'category', product_category) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_dim_product
""")
print("Inserted product nodes")

# COMMAND ----------

# Populate unified graph nodes from customers
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_nodes
SELECT
  customer_id as node_id,
  'customer' as node_type,
  customer_name as label,
  customer_name as name,
  null as risk_category,
  null as tier,
  country_code,
  latitude,
  longitude,
  null as degree_centrality,
  null as betweenness_centrality,
  null as pagerank,
  50.0 as node_size,
  '#10b981' as node_color,
  false as is_hidden,
  map('type', customer_type, 'priority', priority) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_dim_customer
""")
print("Inserted customer nodes")

# COMMAND ----------

# Populate supplier-material edges
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_edges
SELECT
  supplier_material_id as edge_id,
  supplier_id as source_node_id,
  material_id as target_node_id,
  'supplies' as edge_type,
  supply_share_pct as weight,
  concat(cast(supply_share_pct as string), '%') as label,
  capacity_per_month as flow_capacity,
  capacity_per_month * (supply_share_pct / 100) as current_flow,
  supply_share_pct as utilization_pct,
  supply_share_pct >= 95 as is_bottleneck,
  GREATEST(1.0, LEAST(8.0, supply_share_pct / 12.5)) as edge_width,
  CASE
    WHEN supply_share_pct >= 100 THEN '#ef4444'
    WHEN supply_share_pct >= 90 THEN '#f97316'
    WHEN supply_share_pct >= 70 THEN '#eab308'
    ELSE '#22c55e'
  END as edge_color,
  false as is_hidden,
  map('unit_price', cast(unit_price as string), 'lead_time', cast(lead_time_days as string)) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_fact_supplier_material
WHERE is_active = true
""")
print("Inserted supplier-material edges")

# COMMAND ----------

# Populate material-product edges
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_edges
SELECT
  material_product_id as edge_id,
  material_id as source_node_id,
  product_id as target_node_id,
  'used_in' as edge_type,
  quantity_per_unit * 10 as weight,
  concat(cast(quantity_per_unit as string), ' ', unit_of_measure) as label,
  quantity_per_unit * 10000 as flow_capacity,
  quantity_per_unit * 8000 as current_flow,
  80.0 as utilization_pct,
  false as is_bottleneck,
  GREATEST(1.0, LEAST(6.0, quantity_per_unit)) as edge_width,
  CASE WHEN is_critical_component THEN '#ef4444' ELSE '#94a3b8' END as edge_color,
  false as is_hidden,
  map('is_critical', cast(is_critical_component as string), 'scrap_rate', cast(scrap_rate as string)) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_fact_material_product
""")
print("Inserted material-product edges")

# COMMAND ----------

# Populate product-customer edges
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_edges
SELECT
  product_customer_id as edge_id,
  product_id as source_node_id,
  customer_id as target_node_id,
  'sold_to' as edge_type,
  annual_demand / 100 as weight,
  concat(cast(annual_demand as string), ' units/yr') as label,
  annual_demand as flow_capacity,
  annual_demand * (service_level_target / 100) as current_flow,
  service_level_target as utilization_pct,
  false as is_bottleneck,
  GREATEST(2.0, LEAST(10.0, annual_demand / 2500)) as edge_width,
  '#10b981' as edge_color,
  false as is_hidden,
  map('contracted_price', cast(contracted_price as string), 'lead_time', cast(lead_time_days as string)) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_fact_product_customer
WHERE is_active = true
""")
print("Inserted product-customer edges")

# COMMAND ----------

# Populate supplier-supplier edges
spark.sql(f"""
INSERT INTO {catalog}.{schema}.silver_graph_edges
SELECT
  supplier_supplier_id as edge_id,
  parent_supplier_id as source_node_id,
  child_supplier_id as target_node_id,
  'sources_from' as edge_type,
  supply_share_pct as weight,
  concat(relationship_type, ' ', cast(supply_share_pct as string), '%') as label,
  100.0 as flow_capacity,
  supply_share_pct as current_flow,
  supply_share_pct as utilization_pct,
  false as is_bottleneck,
  GREATEST(1.0, LEAST(6.0, supply_share_pct / 20)) as edge_width,
  CASE WHEN is_disclosed THEN '#94a3b8' ELSE '#ef4444' END as edge_color,
  NOT is_disclosed as is_hidden,
  map('relationship_type', relationship_type, 'confidence', cast(confidence_score as string)) as metadata,
  current_timestamp() as updated_at
FROM {catalog}.{schema}.bronze_fact_supplier_supplier
WHERE is_active = true
""")
print("Inserted supplier-supplier edges")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Gold Layer - Initial Metrics

# COMMAND ----------

# Insert initial supply chain health metrics
spark.sql(f"""
INSERT INTO {catalog}.{schema}.gold_supply_chain_health VALUES (
  current_date(),
  14, 4, 5, 4, 1, 10, 5, 5, 52, 12, 15, 10, 16,
  4, 3, 4, 3, 2,
  5420.0, 3, 78.5,
  125000000.00, 3500000.00, 'USD',
  72.5, 68.0, 45.0,
  current_timestamp()
)
""")
print("Inserted supply chain health metrics")

# COMMAND ----------

# Insert initial risk alerts
spark.sql(f"""
INSERT INTO {catalog}.{schema}.gold_risk_alerts VALUES
  ('ALERT-001', current_timestamp(), 'concentration', 'critical', 'Single Source Critical Material', 'MAT-006 (Rare Earth Magnets) is single-sourced from China with no alternative suppliers', array('SUPP-010', 'MAT-006'), 'material', null, 2500000.00, 2, 1, 'USD', array('Qualify alternative supplier', 'Increase safety stock', 'Explore recycling programs'), array(), 'open', null, null, null, current_timestamp()),
  ('ALERT-002', current_timestamp(), 'risk', 'high', 'High Tier-2 Concentration in Taiwan', 'Semiconductor supply chain has 85% concentration in Taiwan foundries', array('SUPP-006'), 'supplier', null, 8500000.00, 3, 3, 'USD', array('Diversify to alternative foundries', 'Qualify Korean suppliers', 'Consider on-shoring options'), array('SUPP-005'), 'open', null, null, null, current_timestamp()),
  ('ALERT-003', current_timestamp(), 'tariff', 'high', 'Section 301 Tariff Impact', '25% tariffs on Chinese semiconductors affecting MAT-001', array('MAT-001', 'SUPP-005'), 'material', null, 1200000.00, 2, 2, 'USD', array('Explore tariff exclusion', 'Shift sourcing to Taiwan/Korea', 'Review pricing strategy'), array('SUPP-006', 'SUPP-003'), 'open', null, null, null, current_timestamp()),
  ('ALERT-004', current_timestamp(), 'bottleneck', 'medium', 'Capacity Bottleneck Detected', 'MAT-002 PCB supply at 95% utilization, risk of allocation', array('SUPP-002'), 'supplier', array('SM-003'), 750000.00, 2, 2, 'USD', array('Increase order lead time', 'Qualify secondary source', 'Negotiate capacity reservation'), array('SUPP-003'), 'acknowledged', 'supply_planner', current_timestamp(), null, current_timestamp())
""")
print("Inserted risk alerts")

# COMMAND ----------

print(f"Sample data populated successfully in {catalog}.{schema}")
