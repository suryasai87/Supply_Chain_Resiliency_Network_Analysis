"""Network data router - fetches graph data from Unity Catalog"""

from fastapi import APIRouter, Query
from typing import Optional
from services.databricks_client import get_databricks_client

router = APIRouter()


@router.get("/nodes")
async def get_nodes(
    node_type: Optional[str] = Query(None, description="Filter by node type: supplier, material, product, customer"),
    limit: int = Query(100, le=1000)
):
    """Get network nodes from Unity Catalog"""
    client = get_databricks_client()

    if node_type:
        query = f"""
        SELECT * FROM chris_messer.silver.node_{node_type}
        LIMIT {limit}
        """
    else:
        query = f"""
        SELECT * FROM chris_messer.silver.graph_nodes
        LIMIT {limit}
        """

    try:
        result = client.execute_query(query)
        return {"nodes": result, "count": len(result)}
    except Exception as e:
        return {"error": str(e), "nodes": [], "count": 0}


@router.get("/edges")
async def get_edges(
    edge_type: Optional[str] = Query(None, description="Filter by edge type: supplier_material, material_product, product_customer"),
    limit: int = Query(100, le=1000)
):
    """Get network edges from Unity Catalog"""
    client = get_databricks_client()

    if edge_type:
        query = f"""
        SELECT * FROM chris_messer.silver.edge_{edge_type}
        LIMIT {limit}
        """
    else:
        query = f"""
        SELECT * FROM chris_messer.silver.graph_edges
        LIMIT {limit}
        """

    try:
        result = client.execute_query(query)
        return {"edges": result, "count": len(result)}
    except Exception as e:
        return {"error": str(e), "edges": [], "count": 0}


@router.get("/metrics/{metric_type}")
async def get_metrics(
    metric_type: str,
    limit: int = Query(100, le=1000)
):
    """Get NetworkX-derived metrics from Gold layer"""
    client = get_databricks_client()

    # Map metric types to tables
    metric_tables = {
        "node_centrality": "metrics_node_supply_chain",
        "edge_weights": "metrics_edge_supply_chain",
        "aggregations": "metrics_agg_supply_chain"
    }

    table = metric_tables.get(metric_type, "metrics_node_supply_chain")

    query = f"""
    SELECT * FROM chris_messer.gold.{table}
    ORDER BY betweenness_centrality DESC NULLS LAST
    LIMIT {limit}
    """

    try:
        result = client.execute_query(query)
        return {"metrics": result, "type": metric_type, "count": len(result)}
    except Exception as e:
        return {"error": str(e), "metrics": [], "count": 0}


@router.get("/graph")
async def get_full_graph(
    projection: Optional[str] = Query("full", description="Graph projection: full, supplier, material, product")
):
    """Get complete graph data for visualization"""
    client = get_databricks_client()

    nodes_query = "SELECT * FROM chris_messer.silver.graph_nodes LIMIT 500"
    edges_query = "SELECT * FROM chris_messer.silver.graph_edges LIMIT 1000"

    try:
        nodes = client.execute_query(nodes_query)
        edges = client.execute_query(edges_query)

        return {
            "nodes": nodes,
            "edges": edges,
            "projection": projection,
            "node_count": len(nodes),
            "edge_count": len(edges)
        }
    except Exception as e:
        return {"error": str(e), "nodes": [], "edges": []}
