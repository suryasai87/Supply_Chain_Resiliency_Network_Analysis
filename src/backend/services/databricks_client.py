"""Databricks client for Unity Catalog and SQL queries"""

import os
from typing import List, Dict, Any, Optional
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.sql import StatementState


class DatabricksClient:
    """Client for interacting with Databricks workspace"""

    def __init__(self):
        self._client: Optional[WorkspaceClient] = None
        self._warehouse_id: Optional[str] = None

    @property
    def client(self) -> WorkspaceClient:
        """Get or create WorkspaceClient"""
        if self._client is None:
            # Check for local development
            host = os.getenv("DATABRICKS_SERVER_HOSTNAME") or os.getenv("DATABRICKS_HOST")
            token = os.getenv("DATABRICKS_TOKEN")

            if host and token:
                if not host.startswith("https://"):
                    host = f"https://{host}"
                self._client = WorkspaceClient(host=host, token=token)
            else:
                # Use default authentication (works in Databricks Apps)
                self._client = WorkspaceClient()

        return self._client

    @property
    def warehouse_id(self) -> str:
        """Get SQL warehouse ID"""
        if self._warehouse_id is None:
            self._warehouse_id = os.getenv("DATABRICKS_WAREHOUSE_ID")

            if not self._warehouse_id:
                # Find first available warehouse
                warehouses = list(self.client.warehouses.list())
                if warehouses:
                    self._warehouse_id = warehouses[0].id
                else:
                    raise ValueError("No SQL warehouses available")

        return self._warehouse_id

    def execute_query(self, query: str, timeout: str = "30s") -> List[Dict[str, Any]]:
        """Execute SQL query and return results as list of dicts"""

        response = self.client.statement_execution.execute_statement(
            warehouse_id=self.warehouse_id,
            statement=query,
            wait_timeout=timeout
        )

        if response.status.state == StatementState.SUCCEEDED:
            if response.result and response.result.data_array:
                columns = [col.name for col in response.manifest.schema.columns]
                return [
                    dict(zip(columns, row))
                    for row in response.result.data_array
                ]
            return []
        else:
            error = response.status.error
            raise Exception(f"Query failed: {error.message if error else 'Unknown error'}")

    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Get schema information for a table"""
        table = self.client.tables.get(full_name=table_name)
        return {
            "name": table.name,
            "catalog": table.catalog_name,
            "schema": table.schema_name,
            "columns": [
                {"name": col.name, "type": col.type_name}
                for col in table.columns
            ]
        }


# Singleton instance
_client: Optional[DatabricksClient] = None


def get_databricks_client() -> DatabricksClient:
    """Get or create Databricks client singleton"""
    global _client
    if _client is None:
        _client = DatabricksClient()
    return _client
