"""
Neo4j Aura API Service
Handles authentication and API calls to Neo4j Aura
"""

import os
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Neo4j Aura API base URL
NEO4J_API_BASE = "https://api.neo4j.io/v1"
NEO4J_TOKEN_URL = "https://api.neo4j.io/oauth/token"


class Neo4jService:
    """Service for interacting with Neo4j Aura API"""

    def __init__(self):
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None
        self._client_id: Optional[str] = None
        self._client_secret: Optional[str] = None

    def _get_credentials(self) -> tuple[str, str]:
        """Get Neo4j credentials from environment or Databricks secrets"""
        if self._client_id and self._client_secret:
            return self._client_id, self._client_secret

        # Try environment variables first
        client_id = os.getenv("NEO4J_CLIENT_ID")
        client_secret = os.getenv("NEO4J_CLIENT_SECRET")

        if client_id and client_secret:
            self._client_id = client_id
            self._client_secret = client_secret
            return client_id, client_secret

        # Try Databricks secrets
        try:
            from databricks.sdk import WorkspaceClient
            w = WorkspaceClient()
            client_id = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-client-id")
            client_secret = w.dbutils.secrets.get(scope="neo4j-secrets", key="neo4j-client-secret")
            self._client_id = client_id
            self._client_secret = client_secret
            return client_id, client_secret
        except Exception as e:
            logger.warning(f"Failed to get credentials from Databricks secrets: {e}")

        raise ValueError("Neo4j credentials not found in environment or Databricks secrets")

    async def _get_access_token(self) -> str:
        """Get or refresh OAuth access token"""
        # Check if current token is still valid
        if self._access_token and self._token_expires_at:
            if datetime.now() < self._token_expires_at - timedelta(minutes=5):
                return self._access_token

        client_id, client_secret = self._get_credentials()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                NEO4J_TOKEN_URL,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={"grant_type": "client_credentials"},
                auth=(client_id, client_secret),
                timeout=30.0
            )

            if response.status_code != 200:
                raise Exception(f"Failed to get Neo4j access token: {response.text}")

            data = response.json()
            self._access_token = data["access_token"]
            expires_in = data.get("expires_in", 3600)
            self._token_expires_at = datetime.now() + timedelta(seconds=expires_in)

            return self._access_token

    async def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make authenticated request to Neo4j API"""
        token = await self._get_access_token()

        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient() as client:
            response = await client.request(
                method,
                f"{NEO4J_API_BASE}{endpoint}",
                headers=headers,
                timeout=30.0,
                **kwargs
            )

            if response.status_code == 403:
                # Token might be expired, try refreshing
                self._access_token = None
                token = await self._get_access_token()
                headers["Authorization"] = f"Bearer {token}"
                response = await client.request(
                    method,
                    f"{NEO4J_API_BASE}{endpoint}",
                    headers=headers,
                    timeout=30.0,
                    **kwargs
                )

            if response.status_code >= 400:
                raise Exception(f"Neo4j API error: {response.status_code} - {response.text}")

            return response.json()

    async def get_instances(self) -> List[Dict[str, Any]]:
        """Get all Neo4j Aura instances"""
        try:
            data = await self._make_request("GET", "/instances")
            return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to get Neo4j instances: {e}")
            return []

    async def get_instance(self, instance_id: str) -> Optional[Dict[str, Any]]:
        """Get details for a specific instance"""
        try:
            data = await self._make_request("GET", f"/instances/{instance_id}")
            return data.get("data")
        except Exception as e:
            logger.error(f"Failed to get Neo4j instance {instance_id}: {e}")
            return None

    async def get_connection_status(self) -> Dict[str, Any]:
        """Check connection status and return instance info"""
        try:
            instances = await self.get_instances()

            if instances:
                # Get first running instance
                running_instances = [i for i in instances if i.get("status") == "running"]
                instance = running_instances[0] if running_instances else instances[0]

                return {
                    "connected": True,
                    "message": f"Connected to Neo4j Aura - {len(instances)} instance(s) found",
                    "instances": [
                        {
                            "id": i.get("id"),
                            "name": i.get("name"),
                            "status": i.get("status"),
                            "connection_url": i.get("connection_url"),
                            "region": i.get("region"),
                            "memory": i.get("memory"),
                            "storage": i.get("storage"),
                            "cloud_provider": i.get("cloud_provider")
                        }
                        for i in instances
                    ]
                }
            else:
                return {
                    "connected": True,
                    "message": "Connected to Neo4j API but no instances found",
                    "instances": []
                }
        except Exception as e:
            logger.error(f"Neo4j connection check failed: {e}")
            return {
                "connected": False,
                "message": str(e),
                "instances": []
            }


# Singleton instance
_neo4j_service: Optional[Neo4jService] = None


def get_neo4j_service() -> Neo4jService:
    """Get or create Neo4j service singleton"""
    global _neo4j_service
    if _neo4j_service is None:
        _neo4j_service = Neo4jService()
    return _neo4j_service
