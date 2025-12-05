"""Genie Spaces router - Natural language SQL queries with multiple space support"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.genie_service import GenieService

router = APIRouter()
genie_service = GenieService()


class GenieMessageRequest(BaseModel):
    """Request to send a message to a Genie Space"""
    message: str
    space_key: str = "global_supply_chain"  # Default space
    conversation_id: Optional[str] = None


class GenieQueryRequest(BaseModel):
    """Legacy query request for backward compatibility"""
    question: str
    max_results: Optional[int] = 100


@router.get("/spaces")
async def list_genie_spaces():
    """
    List available Genie Spaces.
    Returns all configured spaces with their keys, names, and descriptions.
    """
    spaces = genie_service.get_available_spaces()
    return {
        "status": "success",
        "spaces": spaces
    }


@router.post("/send-message")
async def send_genie_message(request: GenieMessageRequest):
    """
    Send a message to a Genie Space and get a response.

    - space_key: Which Genie Space to query (e.g., 'global_supply_chain', 'supplier_material')
    - message: Natural language question
    - conversation_id: Optional - continue an existing conversation

    Returns:
    - content: Genie's text response
    - sql: Generated SQL query (if applicable)
    - results: Query results with columns and rows
    - conversation_id: ID for continuing the conversation
    """
    result = await genie_service.send_message(
        space_key=request.space_key,
        message=request.message,
        conversation_id=request.conversation_id
    )
    return result


@router.get("/{space_key}/info")
async def get_space_info(space_key: str):
    """Get information about a specific Genie Space"""
    spaces = genie_service.get_available_spaces()
    space = next((s for s in spaces if s["key"] == space_key), None)

    if not space:
        return {
            "status": "error",
            "error": f"Unknown Genie Space: {space_key}",
            "available_spaces": [s["key"] for s in spaces]
        }

    sample_questions = get_sample_questions(space_key)

    return {
        "status": "success",
        "space": space,
        "sample_questions": sample_questions
    }


@router.post("/{space_key}/query")
async def query_genie_space(space_key: str, request: GenieQueryRequest):
    """
    Legacy endpoint for querying a specific Genie Space.
    Use /send-message for new implementations.
    """
    result = await genie_service.send_message(
        space_key=space_key,
        message=request.question,
        conversation_id=None  # Always new conversation for legacy endpoint
    )

    # Transform to legacy response format
    return {
        "question": request.question,
        "space_id": space_key,
        "sql": result.get("sql"),
        "results": result.get("results", {}).get("rows", []) if result.get("results") else [],
        "columns": [c["name"] for c in result.get("results", {}).get("columns", [])] if result.get("results") else [],
        "message": result.get("content")
    }


def get_sample_questions(space_key: str) -> list:
    """Get sample questions for a Genie Space"""
    samples = {
        "global_supply_chain": [
            "What is our overall supply chain resiliency score?",
            "Show me suppliers with the highest risk",
            "Which materials are single-sourced?",
            "What are the biggest supply chain bottlenecks?"
        ],
        "supplier_material": [
            "Which suppliers provide the most critical materials?",
            "Show suppliers by geographic region",
            "What is the lead time distribution?",
            "Which suppliers have quality issues?"
        ],
        "product_customer": [
            "What products have the highest demand?",
            "Show customer concentration by region",
            "Which products are at risk due to supply issues?",
            "What is our revenue concentration by customer?"
        ],
        "tariff_material": [
            "What is our total tariff exposure?",
            "Which materials have the highest tariff rates?",
            "Show tariff impact by country of origin",
            "What products are most affected by tariffs?"
        ],
        "material_product": [
            "What materials are used in the most products?",
            "Show BOM depth analysis",
            "Which materials have no alternatives?",
            "What is the material commonality across products?"
        ]
    }
    return samples.get(space_key, [])
