"""Graph analytics service using NetworkX"""

from typing import Dict, Any, List, Optional
import networkx as nx
from services.databricks_client import get_databricks_client


class GraphService:
    """Service for graph analytics operations"""

    def __init__(self):
        self._graph: Optional[nx.DiGraph] = None

    def _load_graph(self) -> nx.DiGraph:
        """Load graph from Unity Catalog if not already loaded"""
        if self._graph is not None:
            return self._graph

        client = get_databricks_client()

        # Load nodes
        nodes_query = "SELECT node_id, node_type, name FROM chris_messer.silver.graph_nodes LIMIT 1000"
        nodes = client.execute_query(nodes_query)

        # Load edges
        edges_query = "SELECT source_id, target_id, weight, edge_type FROM chris_messer.silver.graph_edges LIMIT 5000"
        edges = client.execute_query(edges_query)

        # Build NetworkX graph
        G = nx.DiGraph()

        for node in nodes:
            G.add_node(node["node_id"], **node)

        for edge in edges:
            G.add_edge(
                edge["source_id"],
                edge["target_id"],
                weight=float(edge.get("weight", 1)),
                capacity=float(edge.get("weight", 1)),
                edge_type=edge.get("edge_type")
            )

        self._graph = G
        return G

    def compute_max_flow(self, source_id: str, sink_id: str) -> Dict[str, Any]:
        """
        Compute maximum flow using Edmonds-Karp algorithm.
        Returns max flow value and bottleneck edges.
        """
        G = self._load_graph()

        if source_id not in G.nodes or sink_id not in G.nodes:
            return {
                "error": "Source or sink node not found",
                "max_flow": 0,
                "bottlenecks": []
            }

        try:
            # Compute max flow
            flow_value, flow_dict = nx.maximum_flow(G, source_id, sink_id, capacity="capacity")

            # Find bottleneck edges (edges at full capacity)
            bottlenecks = []
            for u, neighbors in flow_dict.items():
                for v, flow in neighbors.items():
                    if flow > 0 and G.has_edge(u, v):
                        capacity = G[u][v].get("capacity", float("inf"))
                        utilization = (flow / capacity) * 100 if capacity > 0 else 0
                        if utilization >= 90:  # 90%+ utilization = bottleneck
                            bottlenecks.append({
                                "from": u,
                                "to": v,
                                "flow": flow,
                                "capacity": capacity,
                                "utilization": round(utilization, 1)
                            })

            # Sort by utilization
            bottlenecks.sort(key=lambda x: x["utilization"], reverse=True)

            return {
                "max_flow": flow_value,
                "bottlenecks": bottlenecks[:10],  # Top 10 bottlenecks
                "source": source_id,
                "sink": sink_id
            }

        except nx.NetworkXError as e:
            return {"error": str(e), "max_flow": 0, "bottlenecks": []}

    def compute_centrality(self, node_type: Optional[str] = None, metric: str = "betweenness") -> Dict[str, Any]:
        """
        Compute centrality metrics for nodes.
        """
        G = self._load_graph()

        # Filter by node type if specified
        if node_type:
            nodes = [n for n, d in G.nodes(data=True) if d.get("node_type") == node_type]
            subgraph = G.subgraph(nodes)
        else:
            subgraph = G

        # Compute centrality based on metric
        if metric == "betweenness":
            centrality = nx.betweenness_centrality(subgraph.to_undirected())
        elif metric == "pagerank":
            centrality = nx.pagerank(subgraph)
        elif metric == "eigenvector":
            try:
                centrality = nx.eigenvector_centrality(subgraph.to_undirected(), max_iter=1000)
            except nx.PowerIterationFailedConvergence:
                centrality = nx.degree_centrality(subgraph)
        else:
            centrality = nx.degree_centrality(subgraph)

        # Sort and format results
        rankings = [
            {
                "node_id": node_id,
                "score": round(score, 4),
                "name": G.nodes[node_id].get("name", node_id),
                "type": G.nodes[node_id].get("node_type", "unknown")
            }
            for node_id, score in sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        ]

        return {
            "metric": metric,
            "node_type": node_type,
            "rankings": rankings[:50],  # Top 50
            "total_nodes": len(rankings)
        }

    def simulate_disruption(self, node_id: str, disruption_level: float, duration_days: int) -> Dict[str, Any]:
        """
        Simulate disruption scenario and compute impact.
        """
        G = self._load_graph()

        if node_id not in G.nodes:
            return {"error": "Node not found", "impact": {}}

        node = G.nodes[node_id]

        # Find downstream affected nodes
        affected_nodes = list(nx.descendants(G, node_id))

        # Categorize by type
        affected_materials = [n for n in affected_nodes if G.nodes[n].get("node_type") == "material"]
        affected_products = [n for n in affected_nodes if G.nodes[n].get("node_type") == "product"]
        affected_customers = [n for n in affected_nodes if G.nodes[n].get("node_type") == "customer"]

        # Estimate revenue impact (simplified)
        base_revenue = 1000000  # Placeholder
        revenue_at_risk = base_revenue * disruption_level * (duration_days / 30)

        return {
            "node_id": node_id,
            "node_name": node.get("name", node_id),
            "disruption_level": disruption_level,
            "duration_days": duration_days,
            "impact": {
                "materials_affected": len(affected_materials),
                "products_affected": len(affected_products),
                "customers_affected": len(affected_customers),
                "revenue_at_risk": round(revenue_at_risk, 2),
                "alternative_suppliers": 3  # Placeholder
            },
            "affected_products": affected_products[:10]
        }
