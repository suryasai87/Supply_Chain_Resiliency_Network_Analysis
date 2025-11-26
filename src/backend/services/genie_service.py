"""Genie Spaces service for natural language SQL queries"""

import os
from typing import Dict, Any, Optional
import httpx


class GenieService:
    """Service for interacting with Databricks Genie Spaces"""

    def __init__(self):
        self.workspace_host = os.getenv("DATABRICKS_SERVER_HOSTNAME", "fe-vm-hls-amer.cloud.databricks.com")
        self.token = os.getenv("DATABRICKS_TOKEN")

    async def query(self, space_id: str, question: str, max_results: int = 100) -> Dict[str, Any]:
        """
        Query a Genie Space with natural language.
        """
        # In production, this would use the Genie API
        # For now, return mock data based on the question

        # Try actual API call first
        try:
            url = f"https://{self.workspace_host}/api/2.0/genie/spaces/{space_id}/conversations"

            headers = {
                "Content-Type": "application/json"
            }
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"

            payload = {
                "content": question
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    result = response.json()
                    return {
                        "question": question,
                        "space_id": space_id,
                        "sql": result.get("sql_statement"),
                        "results": result.get("results", []),
                        "columns": result.get("columns", [])
                    }
        except Exception:
            pass

        # Return mock response for development
        return self._get_mock_response(space_id, question)

    def _get_mock_response(self, space_id: str, question: str) -> Dict[str, Any]:
        """Generate mock response for development"""

        question_lower = question.lower()

        if "single" in question_lower or "source" in question_lower:
            return {
                "question": question,
                "space_id": space_id,
                "sql": """
                SELECT m.material_id, m.material_name, COUNT(DISTINCT sm.supplier_id) as supplier_count
                FROM chris_messer.bronze.dim_material m
                LEFT JOIN chris_messer.bronze.fact_supplier_material sm ON m.material_id = sm.material_id
                GROUP BY m.material_id, m.material_name
                HAVING COUNT(DISTINCT sm.supplier_id) = 1
                ORDER BY m.material_name
                """,
                "results": [
                    {"material_id": "MAT-001", "material_name": "Semiconductor IC Type A", "supplier_count": 1},
                    {"material_id": "MAT-023", "material_name": "PCB Substrate FR-4", "supplier_count": 1},
                    {"material_id": "MAT-089", "material_name": "Rare Earth Magnet", "supplier_count": 1},
                ],
                "columns": ["material_id", "material_name", "supplier_count"]
            }

        elif "tariff" in question_lower:
            return {
                "question": question,
                "space_id": space_id,
                "sql": """
                SELECT t.country_origin, SUM(t.tariff_rate * sm.annual_volume) as total_exposure
                FROM chris_messer.bronze.dim_tariff t
                JOIN chris_messer.bronze.fact_supplier_material sm ON t.material_category = sm.material_category
                GROUP BY t.country_origin
                ORDER BY total_exposure DESC
                """,
                "results": [
                    {"country_origin": "China", "total_exposure": 28500000},
                    {"country_origin": "Taiwan", "total_exposure": 12300000},
                    {"country_origin": "Vietnam", "total_exposure": 4400000},
                ],
                "columns": ["country_origin", "total_exposure"]
            }

        elif "supplier" in question_lower and "risk" in question_lower:
            return {
                "question": question,
                "space_id": space_id,
                "sql": """
                SELECT s.supplier_id, s.supplier_name, s.country_code,
                       COUNT(DISTINCT sm.material_id) as materials,
                       AVG(sm.lead_time_days) as avg_lead_time
                FROM chris_messer.bronze.dim_supplier s
                JOIN chris_messer.bronze.fact_supplier_material sm ON s.supplier_id = sm.supplier_id
                GROUP BY s.supplier_id, s.supplier_name, s.country_code
                ORDER BY materials DESC
                """,
                "results": [
                    {"supplier_id": "SUPP-001", "supplier_name": "Acme Electronics", "country_code": "CN", "materials": 15, "avg_lead_time": 45},
                    {"supplier_id": "SUPP-002", "supplier_name": "Global Components", "country_code": "TW", "materials": 12, "avg_lead_time": 30},
                    {"supplier_id": "SUPP-003", "supplier_name": "Pacific Materials", "country_code": "VN", "materials": 8, "avg_lead_time": 35},
                ],
                "columns": ["supplier_id", "supplier_name", "country_code", "materials", "avg_lead_time"]
            }

        else:
            return {
                "question": question,
                "space_id": space_id,
                "sql": "-- Query generated based on your question",
                "results": [],
                "columns": [],
                "message": "I can help you query your supply chain data. Try asking about:\n- Single-sourced materials\n- Tariff exposure by country\n- Supplier risk analysis\n- Product dependencies"
            }
