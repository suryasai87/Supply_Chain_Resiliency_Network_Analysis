"""Genie Spaces router - Natural language SQL queries"""

import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.genie_service import GenieService

router = APIRouter()
genie_service = GenieService()

# Available Genie Spaces
GENIE_SPACES = {
    "global_supply_chain": "supplytics_global_supply_chain",
    "supplier_material": "supplytics_supplier_material",
    "product_customer": "supplytics_product_customer",
    "tariff_material": "supplytics_tariffmaterial_product",
    "material_product": "supplytics_material_product"
}


class GenieQueryRequest(BaseModel):
    question: str
    max_results: Optional[int] = 100


@router.get("/spaces")
async def list_genie_spaces():
    """List available Genie Spaces"""
    return {
        "spaces": [
            {"id": k, "name": v, "description": get_space_description(k)}
            for k, v in GENIE_SPACES.items()
        ]
    }


@router.post("/{space_name}/query")
async def query_genie_space(space_name: str, request: GenieQueryRequest):
    """
    Query a specific Genie Space with natural language.
    Returns SQL-generated results.
    """
    if space_name not in GENIE_SPACES:
        return {"error": f"Unknown Genie Space: {space_name}", "available": list(GENIE_SPACES.keys())}

    try:
        result = await genie_service.query(
            space_id=GENIE_SPACES[space_name],
            question=request.question,
            max_results=request.max_results
        )
        return result
    except Exception as e:
        return {"error": str(e), "results": [], "sql": None}


@router.get("/{space_name}/info")
async def get_space_info(space_name: str):
    """Get information about a Genie Space"""
    if space_name not in GENIE_SPACES:
        return {"error": f"Unknown Genie Space: {space_name}"}

    workspace_host = os.getenv("DATABRICKS_SERVER_HOSTNAME", "fe-vm-hls-amer.cloud.databricks.com")

    return {
        "id": space_name,
        "genie_space_id": GENIE_SPACES[space_name],
        "description": get_space_description(space_name),
        "url": f"https://{workspace_host}/sql/genie/{GENIE_SPACES[space_name]}",
        "sample_questions": get_sample_questions(space_name)
    }


def get_space_description(space_name: str) -> str:
    """Get description for a Genie Space"""
    descriptions = {
        "global_supply_chain": "End-to-end supply chain visibility and analytics",
        "supplier_material": "Supplier-material relationships and risk analysis",
        "product_customer": "Product demand patterns and customer analytics",
        "tariff_material": "Tariff exposure and impact analysis",
        "material_product": "Bill of materials and product composition"
    }
    return descriptions.get(space_name, "Supply chain analytics")


def get_sample_questions(space_name: str) -> list:
    """Get sample questions for a Genie Space"""
    samples = {
        "global_supply_chain": [
            "What is our overall supply chain resiliency score?",
            "Show me suppliers with the highest risk",
            "Which materials are single-sourced?"
        ],
        "supplier_material": [
            "Which suppliers provide the most critical materials?",
            "Show suppliers by geographic region",
            "What is the lead time distribution?"
        ],
        "product_customer": [
            "What products have the highest demand?",
            "Show customer concentration by region",
            "Which products are at risk due to supply issues?"
        ],
        "tariff_material": [
            "What is our total tariff exposure?",
            "Which materials have the highest tariff rates?",
            "Show tariff impact by country of origin"
        ],
        "material_product": [
            "What materials are used in the most products?",
            "Show BOM depth analysis",
            "Which materials have no alternatives?"
        ]
    }
    return samples.get(space_name, [])
