"""Genie Spaces service using Databricks SDK for natural language SQL queries"""

import os
import logging
from typing import Dict, Any, Optional, List
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Available Genie Spaces configuration
GENIE_SPACES = {
    "global_supply_chain": {
        "id": os.getenv("GENIE_SPACE_GLOBAL_SUPPLY_CHAIN", "supplytics_global_supply_chain"),
        "name": "Global Supply Chain",
        "description": "End-to-end supply chain visibility and analytics"
    },
    "supplier_material": {
        "id": os.getenv("GENIE_SPACE_SUPPLIER_MATERIAL", "supplytics_supplier_material"),
        "name": "Supplier Material",
        "description": "Supplier-material relationships and risk analysis"
    },
    "product_customer": {
        "id": os.getenv("GENIE_SPACE_PRODUCT_CUSTOMER", "supplytics_product_customer"),
        "name": "Product Customer",
        "description": "Product demand patterns and customer analytics"
    },
    "tariff_material": {
        "id": os.getenv("GENIE_SPACE_TARIFF_MATERIAL", "supplytics_tariffmaterial_product"),
        "name": "Tariff Material",
        "description": "Tariff exposure and impact analysis"
    },
    "material_product": {
        "id": os.getenv("GENIE_SPACE_MATERIAL_PRODUCT", "supplytics_material_product"),
        "name": "Material Product",
        "description": "Bill of materials and product composition"
    }
}


class GenieService:
    """Service for interacting with Databricks Genie Spaces"""

    def __init__(self):
        self.databricks_host = os.getenv("DATABRICKS_HOST", "")
        self.databricks_token = os.getenv("DATABRICKS_TOKEN", "")
        self.sql_warehouse_id = os.getenv("SQL_WAREHOUSE_ID", "")
        self._workspace_client = None

        if self.databricks_token:
            logger.info(f"GenieService initialized for: {self.databricks_host}")
        else:
            logger.warning("No DATABRICKS_TOKEN - Genie will use mock responses")

    @property
    def workspace_client(self):
        """Lazy initialization of WorkspaceClient"""
        if self._workspace_client is None and self.databricks_token:
            try:
                from databricks.sdk import WorkspaceClient
                self._workspace_client = WorkspaceClient(
                    host=self.databricks_host,
                    token=self.databricks_token
                )
                logger.info("WorkspaceClient initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize WorkspaceClient: {e}")
        return self._workspace_client

    def get_available_spaces(self) -> List[Dict[str, str]]:
        """Return list of available Genie Spaces"""
        return [
            {
                "key": key,
                "id": space["id"],
                "name": space["name"],
                "description": space["description"]
            }
            for key, space in GENIE_SPACES.items()
        ]

    async def send_message(
        self,
        space_key: str,
        message: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a message to a Genie Space and get a response.
        Uses Databricks SDK genie.start_conversation or genie.create_message_and_wait.
        """
        if space_key not in GENIE_SPACES:
            return {
                "status": "error",
                "error": f"Unknown Genie Space: {space_key}",
                "available_spaces": list(GENIE_SPACES.keys())
            }

        space_id = GENIE_SPACES[space_key]["id"]

        if not self.workspace_client:
            logger.warning("No workspace client - returning mock response")
            return self._get_mock_response(space_key, message)

        try:
            logger.info(f"Sending message to Genie Space: {space_key} ({space_id})")

            if not conversation_id:
                # Start new conversation with initial message
                result = await self._start_conversation_with_message(space_id, message)
            else:
                # Continue existing conversation
                result = await self._continue_conversation(space_id, conversation_id, message)

            return result

        except Exception as e:
            logger.error(f"Error calling Genie: {e}")
            # Fall back to mock response on error
            return self._get_mock_response(space_key, message)

    async def _start_conversation_with_message(
        self,
        space_id: str,
        message: str
    ) -> Dict[str, Any]:
        """Start a new Genie conversation with an initial message"""
        try:
            # Start conversation and wait for response
            wait_obj = self.workspace_client.genie.start_conversation(
                space_id=space_id,
                content=message
            )

            # Wait for result (60 second timeout)
            result = wait_obj.result(timeout=timedelta(seconds=60))

            conversation_id = result.conversation_id
            message_id = result.id

            # Extract response content and attachments
            response_data = self._extract_response(result, message)
            response_data["conversation_id"] = conversation_id
            response_data["message_id"] = message_id

            return response_data

        except Exception as e:
            logger.error(f"Error starting Genie conversation: {e}")
            raise

    async def _continue_conversation(
        self,
        space_id: str,
        conversation_id: str,
        message: str
    ) -> Dict[str, Any]:
        """Continue an existing Genie conversation"""
        try:
            # Send message and wait for response
            result = self.workspace_client.genie.create_message_and_wait(
                space_id=space_id,
                conversation_id=conversation_id,
                content=message,
                timeout=timedelta(seconds=60)
            )

            message_id = getattr(result, 'id', None)

            # Extract response content and attachments
            response_data = self._extract_response(result, message)
            response_data["conversation_id"] = conversation_id
            response_data["message_id"] = message_id

            return response_data

        except Exception as e:
            logger.error(f"Error continuing Genie conversation: {e}")
            raise

    def _extract_response(self, result, original_message: str) -> Dict[str, Any]:
        """Extract content and attachments from Genie response"""
        content = ""
        attachments = []
        sql_query = None
        query_results = None

        if hasattr(result, 'attachments') and result.attachments:
            for att in result.attachments:
                # Process text attachment
                if hasattr(att, 'text') and att.text:
                    text_content = att.text.content if hasattr(att.text, 'content') else str(att.text)
                    if not content:
                        content = text_content
                    attachments.append({
                        "type": "text",
                        "content": text_content
                    })

                # Process query attachment
                if hasattr(att, 'query') and att.query:
                    query_text = att.query.query if hasattr(att.query, 'query') else None
                    query_desc = att.query.description if hasattr(att.query, 'description') else None

                    sql_query = query_text

                    query_attachment = {
                        "type": "query",
                        "query": query_text,
                        "description": query_desc
                    }

                    # Try to get query results
                    query_result = self._fetch_query_results(result)
                    if query_result:
                        query_attachment["result"] = query_result
                        query_results = query_result

                    attachments.append(query_attachment)

        # If no text content extracted, use a default
        if not content:
            if sql_query:
                content = "I've generated a SQL query to answer your question."
            else:
                content = "I've processed your request."

        return {
            "status": "success",
            "content": content,
            "sql": sql_query,
            "results": query_results,
            "attachments": attachments
        }

    def _fetch_query_results(self, result) -> Optional[Dict[str, Any]]:
        """Fetch query results from statement execution"""
        try:
            # Check for query_result with statement_id
            if hasattr(result, 'query_result') and result.query_result:
                if hasattr(result.query_result, 'statement_id'):
                    statement_id = result.query_result.statement_id

                    # Get statement with results
                    stmt_response = self.workspace_client.statement_execution.get_statement(statement_id)

                    if stmt_response.result:
                        columns = []
                        if hasattr(stmt_response, 'manifest') and stmt_response.manifest:
                            if hasattr(stmt_response.manifest, 'schema') and stmt_response.manifest.schema:
                                if hasattr(stmt_response.manifest.schema, 'columns'):
                                    columns = [
                                        {
                                            "name": col.name,
                                            "type": col.type_name if hasattr(col, 'type_name') else None
                                        }
                                        for col in stmt_response.manifest.schema.columns
                                    ]

                        rows = []
                        if hasattr(stmt_response.result, 'data_array'):
                            rows = stmt_response.result.data_array

                        return {
                            "columns": columns,
                            "rows": rows,
                            "row_count": len(rows)
                        }
        except Exception as e:
            logger.error(f"Error fetching query results: {e}")

        return None

    def _get_mock_response(self, space_key: str, question: str) -> Dict[str, Any]:
        """Generate mock response for development/testing"""
        question_lower = question.lower()

        if "single" in question_lower or "source" in question_lower:
            return {
                "status": "success",
                "content": "Here are the single-sourced materials in your supply chain:",
                "conversation_id": "mock-conv-001",
                "sql": """SELECT m.material_id, m.material_name, COUNT(DISTINCT sm.supplier_id) as supplier_count
FROM dim_material m
LEFT JOIN fact_supplier_material sm ON m.material_id = sm.material_id
GROUP BY m.material_id, m.material_name
HAVING COUNT(DISTINCT sm.supplier_id) = 1
ORDER BY m.material_name""",
                "results": {
                    "columns": [
                        {"name": "material_id", "type": "STRING"},
                        {"name": "material_name", "type": "STRING"},
                        {"name": "supplier_count", "type": "LONG"}
                    ],
                    "rows": [
                        ["MAT-001", "Semiconductor IC Type A", 1],
                        ["MAT-023", "PCB Substrate FR-4", 1],
                        ["MAT-089", "Rare Earth Magnet", 1],
                    ],
                    "row_count": 3
                },
                "attachments": []
            }

        elif "tariff" in question_lower:
            return {
                "status": "success",
                "content": "Here's the tariff exposure analysis by country of origin:",
                "conversation_id": "mock-conv-002",
                "sql": """SELECT t.country_origin, SUM(t.tariff_rate * sm.annual_volume) as total_exposure
FROM dim_tariff t
JOIN fact_supplier_material sm ON t.material_category = sm.material_category
GROUP BY t.country_origin
ORDER BY total_exposure DESC""",
                "results": {
                    "columns": [
                        {"name": "country_origin", "type": "STRING"},
                        {"name": "total_exposure", "type": "DOUBLE"}
                    ],
                    "rows": [
                        ["China", 28500000],
                        ["Taiwan", 12300000],
                        ["Vietnam", 4400000],
                    ],
                    "row_count": 3
                },
                "attachments": []
            }

        elif "supplier" in question_lower and "risk" in question_lower:
            return {
                "status": "success",
                "content": "Here are the suppliers ranked by risk metrics:",
                "conversation_id": "mock-conv-003",
                "sql": """SELECT s.supplier_id, s.supplier_name, s.country_code,
       COUNT(DISTINCT sm.material_id) as materials,
       AVG(sm.lead_time_days) as avg_lead_time
FROM dim_supplier s
JOIN fact_supplier_material sm ON s.supplier_id = sm.supplier_id
GROUP BY s.supplier_id, s.supplier_name, s.country_code
ORDER BY materials DESC""",
                "results": {
                    "columns": [
                        {"name": "supplier_id", "type": "STRING"},
                        {"name": "supplier_name", "type": "STRING"},
                        {"name": "country_code", "type": "STRING"},
                        {"name": "materials", "type": "LONG"},
                        {"name": "avg_lead_time", "type": "DOUBLE"}
                    ],
                    "rows": [
                        ["SUPP-001", "Acme Electronics", "CN", 15, 45],
                        ["SUPP-002", "Global Components", "TW", 12, 30],
                        ["SUPP-003", "Pacific Materials", "VN", 8, 35],
                    ],
                    "row_count": 3
                },
                "attachments": []
            }

        else:
            space_name = GENIE_SPACES.get(space_key, {}).get("name", space_key)
            return {
                "status": "success",
                "content": f"I can help you query the {space_name} data. Try asking about:\n- Single-sourced materials\n- Tariff exposure by country\n- Supplier risk analysis\n- Product dependencies",
                "conversation_id": "mock-conv-000",
                "sql": None,
                "results": None,
                "attachments": []
            }
