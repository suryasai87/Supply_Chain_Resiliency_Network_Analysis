"""
Neo4j Database Service
Handles connection to Neo4j Aura database and provides connection info for NeoDash
"""

import os
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class Neo4jService:
    """Service for Neo4j database connection management"""

    def __init__(self):
        self._uri: Optional[str] = None
        self._username: Optional[str] = None
        self._password: Optional[str] = None
        self._database: Optional[str] = None
        self._instance_id: Optional[str] = None
        self._instance_name: Optional[str] = None

    def _get_credentials(self) -> Dict[str, str]:
        """Get Neo4j credentials from environment or Databricks secrets"""
        # Try environment variables first
        uri = os.getenv("NEO4J_URI")
        username = os.getenv("NEO4J_USERNAME")
        password = os.getenv("NEO4J_PASSWORD")
        database = os.getenv("NEO4J_DATABASE", "neo4j")
        instance_id = os.getenv("AURA_INSTANCEID")
        instance_name = os.getenv("AURA_INSTANCENAME", "supplytics")

        if uri and username and password:
            return {
                "uri": uri,
                "username": username,
                "password": password,
                "database": database,
                "instance_id": instance_id,
                "instance_name": instance_name
            }

        # Try Databricks secrets
        try:
            from databricks.sdk import WorkspaceClient
            w = WorkspaceClient()

            uri = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-uri")
            username = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-username")
            password = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-password")
            database = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-database")
            instance_id = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-instance-id")

            return {
                "uri": uri,
                "username": username,
                "password": password,
                "database": database or "neo4j",
                "instance_id": instance_id,
                "instance_name": "supplytics"
            }
        except Exception as e:
            logger.warning(f"Failed to get credentials from Databricks secrets: {e}")

        # Return default/empty values
        return {
            "uri": None,
            "username": None,
            "password": None,
            "database": "neo4j",
            "instance_id": None,
            "instance_name": "supplytics"
        }

    def get_connection_info(self) -> Dict[str, Any]:
        """Get connection info for the frontend (without exposing password)"""
        creds = self._get_credentials()

        if creds.get("uri"):
            # Parse the URI to get host
            uri = creds["uri"]
            # Convert neo4j+s://host to just host
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

        # Parse URI for NeoDash format
        uri = creds["uri"]
        host = uri.replace("neo4j+s://", "").replace("neo4j://", "").replace("bolt://", "")

        # NeoDash expects specific connection format
        return {
            "configured": True,
            "protocol": "neo4j+s",
            "host": host,
            "port": 7687,
            "database": creds.get("database", "neo4j"),
            "username": creds.get("username"),
            "password": creds.get("password"),  # Only sent to frontend for NeoDash connection
            "uri": uri
        }

    def get_connection_status(self) -> Dict[str, Any]:
        """Check connection status - used by the status endpoint"""
        return self.get_connection_info()


# Singleton instance
_neo4j_service: Optional[Neo4jService] = None


def get_neo4j_service() -> Neo4jService:
    """Get or create Neo4j service singleton"""
    global _neo4j_service
    if _neo4j_service is None:
        _neo4j_service = Neo4jService()
    return _neo4j_service
