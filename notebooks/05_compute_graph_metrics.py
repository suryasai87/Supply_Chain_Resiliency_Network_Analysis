# Databricks notebook source
# MAGIC %md
# MAGIC # Compute Graph Metrics
# MAGIC Supply Chain Resiliency Network Analysis
# MAGIC
# MAGIC This notebook computes graph centrality metrics using NetworkX

# COMMAND ----------

# Get parameters
dbutils.widgets.text("catalog", "supply_chain_analytics")
dbutils.widgets.text("schema", "network_analysis")

catalog = dbutils.widgets.get("catalog")
schema = dbutils.widgets.get("schema")

print(f"Computing graph metrics for {catalog}.{schema}")

spark.sql(f"USE CATALOG {catalog}")
spark.sql(f"USE SCHEMA {schema}")

# COMMAND ----------

import networkx as nx
import pandas as pd
from pyspark.sql.functions import lit, current_timestamp

# COMMAND ----------

# MAGIC %md
# MAGIC ## Load Graph Data

# COMMAND ----------

# Load nodes
nodes_df = spark.sql(f"""
    SELECT node_id, node_type, label, risk_category
    FROM {catalog}.{schema}.silver_graph_nodes
""").toPandas()

# Load edges
edges_df = spark.sql(f"""
    SELECT edge_id, source_node_id, target_node_id, weight, edge_type
    FROM {catalog}.{schema}.silver_graph_edges
""").toPandas()

print(f"Loaded {len(nodes_df)} nodes and {len(edges_df)} edges")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Build NetworkX Graph

# COMMAND ----------

# Create directed graph
G = nx.DiGraph()

# Add nodes with attributes
for _, row in nodes_df.iterrows():
    G.add_node(row['node_id'],
               node_type=row['node_type'],
               label=row['label'],
               risk_category=row['risk_category'])

# Add edges with weights
for _, row in edges_df.iterrows():
    if row['source_node_id'] in G.nodes() and row['target_node_id'] in G.nodes():
        G.add_edge(row['source_node_id'],
                   row['target_node_id'],
                   weight=row['weight'] if pd.notna(row['weight']) else 1.0,
                   edge_type=row['edge_type'])

print(f"Graph has {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Compute Centrality Metrics

# COMMAND ----------

# Compute degree centrality
degree_centrality = nx.degree_centrality(G)
in_degree_centrality = nx.in_degree_centrality(G)
out_degree_centrality = nx.out_degree_centrality(G)

print("Computed degree centrality")

# COMMAND ----------

# Compute betweenness centrality
betweenness_centrality = nx.betweenness_centrality(G, weight='weight')
print("Computed betweenness centrality")

# COMMAND ----------

# Compute PageRank
pagerank = nx.pagerank(G, weight='weight')
print("Computed PageRank")

# COMMAND ----------

# Try to compute closeness and eigenvector centrality
# These may fail on disconnected graphs
try:
    closeness_centrality = nx.closeness_centrality(G)
    print("Computed closeness centrality")
except:
    closeness_centrality = {n: 0.0 for n in G.nodes()}
    print("Closeness centrality skipped (disconnected graph)")

try:
    eigenvector_centrality = nx.eigenvector_centrality(G, max_iter=1000)
    print("Computed eigenvector centrality")
except:
    eigenvector_centrality = {n: 0.0 for n in G.nodes()}
    print("Eigenvector centrality skipped")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Update Silver Graph Nodes

# COMMAND ----------

# Create metrics dataframe
metrics_data = []
for node_id in G.nodes():
    metrics_data.append({
        'node_id': node_id,
        'degree_centrality': degree_centrality.get(node_id, 0.0),
        'betweenness_centrality': betweenness_centrality.get(node_id, 0.0),
        'pagerank': pagerank.get(node_id, 0.0)
    })

metrics_pdf = pd.DataFrame(metrics_data)
metrics_sdf = spark.createDataFrame(metrics_pdf)

# COMMAND ----------

# Update silver_graph_nodes with metrics
metrics_sdf.createOrReplaceTempView("node_metrics")

spark.sql(f"""
    MERGE INTO {catalog}.{schema}.silver_graph_nodes AS target
    USING node_metrics AS source
    ON target.node_id = source.node_id
    WHEN MATCHED THEN UPDATE SET
        target.degree_centrality = source.degree_centrality,
        target.betweenness_centrality = source.betweenness_centrality,
        target.pagerank = source.pagerank,
        target.updated_at = current_timestamp()
""")

print("Updated silver_graph_nodes with centrality metrics")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Create Gold Metrics

# COMMAND ----------

# Compute downstream impact (number of reachable nodes)
downstream_impact = {}
upstream_dependency = {}

for node in G.nodes():
    # Downstream = nodes reachable from this node
    downstream_impact[node] = len(nx.descendants(G, node))
    # Upstream = nodes that can reach this node
    upstream_dependency[node] = len(nx.ancestors(G, node))

# COMMAND ----------

# Create gold metrics dataframe
gold_metrics = []
for node_id in G.nodes():
    node_data = G.nodes[node_id]
    gold_metrics.append({
        'node_id': node_id,
        'node_type': node_data.get('node_type', 'unknown'),
        'label': node_data.get('label', node_id),
        'degree_centrality': degree_centrality.get(node_id, 0.0),
        'in_degree_centrality': in_degree_centrality.get(node_id, 0.0),
        'out_degree_centrality': out_degree_centrality.get(node_id, 0.0),
        'betweenness_centrality': betweenness_centrality.get(node_id, 0.0),
        'closeness_centrality': closeness_centrality.get(node_id, 0.0),
        'eigenvector_centrality': eigenvector_centrality.get(node_id, 0.0),
        'pagerank': pagerank.get(node_id, 0.0),
        'risk_category': node_data.get('risk_category'),
        'downstream_impact_count': downstream_impact.get(node_id, 0),
        'upstream_dependency_count': upstream_dependency.get(node_id, 0)
    })

gold_metrics_pdf = pd.DataFrame(gold_metrics)
gold_metrics_sdf = spark.createDataFrame(gold_metrics_pdf)

# Add computed_at timestamp
gold_metrics_sdf = gold_metrics_sdf.withColumn("computed_at", current_timestamp())

# COMMAND ----------

# Upsert into gold_metrics_node
gold_metrics_sdf.createOrReplaceTempView("new_metrics")

spark.sql(f"""
    MERGE INTO {catalog}.{schema}.gold_metrics_node AS target
    USING new_metrics AS source
    ON target.node_id = source.node_id
    WHEN MATCHED THEN UPDATE SET
        target.degree_centrality = source.degree_centrality,
        target.in_degree_centrality = source.in_degree_centrality,
        target.out_degree_centrality = source.out_degree_centrality,
        target.betweenness_centrality = source.betweenness_centrality,
        target.closeness_centrality = source.closeness_centrality,
        target.eigenvector_centrality = source.eigenvector_centrality,
        target.pagerank = source.pagerank,
        target.downstream_impact_count = source.downstream_impact_count,
        target.upstream_dependency_count = source.upstream_dependency_count,
        target.computed_at = source.computed_at
    WHEN NOT MATCHED THEN INSERT (
        node_id, node_type, label, degree_centrality, in_degree_centrality,
        out_degree_centrality, betweenness_centrality, closeness_centrality,
        eigenvector_centrality, pagerank, risk_category,
        downstream_impact_count, upstream_dependency_count, computed_at
    ) VALUES (
        source.node_id, source.node_type, source.label, source.degree_centrality,
        source.in_degree_centrality, source.out_degree_centrality,
        source.betweenness_centrality, source.closeness_centrality,
        source.eigenvector_centrality, source.pagerank, source.risk_category,
        source.downstream_impact_count, source.upstream_dependency_count, source.computed_at
    )
""")

print("Updated gold_metrics_node")

# COMMAND ----------

print("Graph metrics computation completed successfully")
