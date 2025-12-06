"""
Neo4j Database Service
Handles connection to Neo4j Aura database and query execution
"""

import os
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class Neo4jService:
    """Service for Neo4j database connection and query execution"""

    def __init__(self):
        self._driver = None
        self._credentials: Optional[Dict[str, str]] = None

    def _get_credentials(self) -> Dict[str, str]:
        """Get Neo4j credentials from environment or Databricks secrets"""
        if self._credentials:
            return self._credentials

        # Try environment variables first
        uri = os.getenv("NEO4J_URI")
        username = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")
        database = os.getenv("NEO4J_DATABASE", "neo4j")
        instance_id = os.getenv("AURA_INSTANCEID")
        instance_name = os.getenv("AURA_INSTANCENAME", "supplytics")

        if uri and username and password:
            self._credentials = {
                "uri": uri,
                "username": username,
                "password": password,
                "database": database,
                "instance_id": instance_id,
                "instance_name": instance_name
            }
            return self._credentials

        # Try Databricks secrets
        try:
            from databricks.sdk import WorkspaceClient
            w = WorkspaceClient()

            uri = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-uri")
            username = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-username")
            password = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-password")
            database = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-database")
            instance_id = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-instance-id")

            self._credentials = {
                "uri": uri,
                "username": username,
                "password": password,
                "database": database or "neo4j",
                "instance_id": instance_id,
                "instance_name": "supplytics"
            }
            return self._credentials
        except Exception as e:
            logger.warning(f"Failed to get credentials from Databricks secrets: {e}")

        # Return empty credentials
        return {
            "uri": None,
            "username": None,
            "password": None,
            "database": "neo4j",
            "instance_id": None,
            "instance_name": "supplytics"
        }

    def _get_driver(self):
        """Get or create Neo4j driver"""
        if self._driver:
            return self._driver

        try:
            from neo4j import GraphDatabase
            creds = self._get_credentials()

            if not creds.get("uri"):
                raise ValueError("Neo4j URI not configured")

            self._driver = GraphDatabase.driver(
                creds["uri"],
                auth=(creds["username"], creds["password"])
            )
            return self._driver
        except ImportError:
            logger.error("neo4j driver not installed")
            raise
        except Exception as e:
            logger.error(f"Failed to create Neo4j driver: {e}")
            raise

    def get_connection_info(self) -> Dict[str, Any]:
        """Get connection info for the frontend (without exposing password)"""
        creds = self._get_credentials()

        if creds.get("uri"):
            uri = creds["uri"]
            host = uri.replace("neo4j+s://", "").replace("neo4j://", "").replace("bolt://", "")

            return {
                "connected": True,
                "message": f"Neo4j Aura instance configured: {creds.get('instance_name', 'supplytics')}",
                "instance": {
                    "id": creds.get("instance_id"),
                    "name": creds.get("instance_name", "supplytics"),
                    "status": "running",
                    "host": host,
                    "database": creds.get("database", "neo4j"),
                    "uri": uri
                }
            }
        else:
            return {
                "connected": False,
                "message": "Neo4j credentials not configured",
                "instance": None
            }

    def get_neodash_config(self) -> Dict[str, Any]:
        """Get NeoDash connection configuration"""
        creds = self._get_credentials()

        if not creds.get("uri"):
            return {
                "configured": False,
                "message": "Neo4j credentials not configured"
            }

        uri = creds["uri"]
        host = uri.replace("neo4j+s://", "").replace("neo4j://", "").replace("bolt://", "")

        return {
            "configured": True,
            "protocol": "neo4j+s",
            "host": host,
            "port": 7687,
            "database": creds.get("database", "neo4j"),
            "username": creds.get("username"),
            "password": creds.get("password"),
            "uri": uri
        }

    def get_connection_status(self) -> Dict[str, Any]:
        """Check connection status"""
        return self.get_connection_info()

    def execute_query(self, query: str, parameters: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute a Cypher query and return nodes and relationships"""
        creds = self._get_credentials()

        if not creds.get("uri"):
            raise ValueError("Neo4j credentials not configured")

        nodes = []
        relationships = []
        node_ids = set()
        rel_ids = set()

        try:
            from neo4j import GraphDatabase

            driver = GraphDatabase.driver(
                creds["uri"],
                auth=(creds["username"], creds["password"])
            )

            with driver.session(database=creds.get("database", "neo4j")) as session:
                result = session.run(query, parameters or {})

                for record in result:
                    for value in record.values():
                        self._process_value(value, nodes, relationships, node_ids, rel_ids)

            driver.close()

            return {
                "nodes": nodes,
                "relationships": relationships
            }

        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise

    def _process_value(self, value, nodes: List, relationships: List, node_ids: set, rel_ids: set):
        """Process a value from query result, extracting nodes and relationships"""
        from neo4j.graph import Node, Relationship, Path

        if isinstance(value, Node):
            if value.element_id not in node_ids:
                node_ids.add(value.element_id)
                nodes.append({
                    "id": value.element_id,
                    "labels": list(value.labels),
                    "properties": dict(value)
                })

        elif isinstance(value, Relationship):
            if value.element_id not in rel_ids:
                rel_ids.add(value.element_id)
                relationships.append({
                    "id": value.element_id,
                    "type": value.type,
                    "startNodeId": value.start_node.element_id,
                    "endNodeId": value.end_node.element_id,
                    "properties": dict(value)
                })
                # Also add the connected nodes
                self._process_value(value.start_node, nodes, relationships, node_ids, rel_ids)
                self._process_value(value.end_node, nodes, relationships, node_ids, rel_ids)

        elif isinstance(value, Path):
            for node in value.nodes:
                self._process_value(node, nodes, relationships, node_ids, rel_ids)
            for rel in value.relationships:
                self._process_value(rel, nodes, relationships, node_ids, rel_ids)

        elif isinstance(value, list):
            for item in value:
                self._process_value(item, nodes, relationships, node_ids, rel_ids)

    def test_connection(self) -> Dict[str, Any]:
        """Test the Neo4j connection"""
        try:
            result = self.execute_query("RETURN 1 as test")
            return {
                "success": True,
                "message": "Connection successful"
            }
        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }

    def get_schema(self) -> Dict[str, Any]:
        """Get the database schema (node labels and relationship types)"""
        try:
            # Get node labels
            labels_result = self.execute_query("CALL db.labels()")
            labels = [node.get("properties", {}).get("label", "") for node in labels_result.get("nodes", [])]

            # Get relationship types
            rels_result = self.execute_query("CALL db.relationshipTypes()")
            rel_types = [node.get("properties", {}).get("relationshipType", "") for node in rels_result.get("nodes", [])]

            return {
                "labels": labels,
                "relationshipTypes": rel_types
            }
        except Exception as e:
            logger.error(f"Failed to get schema: {e}")
            return {
                "labels": [],
                "relationshipTypes": []
            }


# Singleton instance
_neo4j_service: Optional[Neo4jService] = None


def get_neo4j_service() -> Neo4jService:
    """Get or create Neo4j service singleton"""
    global _neo4j_service
    if _neo4j_service is None:
        _neo4j_service = Neo4jService()
    return _neo4j_service
