"""Chat router - Multi-Agent Supervisor and Knowledge Assistant integration"""

import os
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Optional
from services.multi_agent_service import MultiAgentService

router = APIRouter()
multi_agent_service = MultiAgentService()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: Optional[int] = 512


@router.post("/multi-agent")
async def chat_multi_agent(request: ChatRequest, http_request: Request):
    """
    Send message to Multi-Agent Supervisor for complex supply chain analysis.
    Endpoint: supply-chain-analysis-mas
    """
    try:
        response = await multi_agent_service.query(
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
            max_tokens=request.max_tokens
        )
        return response
    except Exception as e:
        return {
            "role": "assistant",
            "content": f"I apologize, but I encountered an error: {str(e)}. Please try again.",
            "error": True
        }


@router.post("/knowledge")
async def chat_knowledge(request: ChatRequest, http_request: Request):
    """
    Query Knowledge Assistant for document-based answers.
    Endpoint: supplytics-knowledge-assistant
    """
    try:
        response = await multi_agent_service.query_knowledge(
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
            max_tokens=request.max_tokens
        )
        return response
    except Exception as e:
        return {
            "role": "assistant",
            "content": f"Knowledge search error: {str(e)}",
            "error": True
        }


@router.get("/config")
async def get_chat_config():
    """
    Get chat configuration including endpoint URLs for iframe embedding.
    """
    workspace_host = os.getenv("DATABRICKS_SERVER_HOSTNAME", "fe-vm-hls-amer.cloud.databricks.com")

    return {
        "multi_agent_endpoint": "supply-chain-analysis-mas",
        "knowledge_endpoint": "supplytics-knowledge-assistant",
        "workspace_host": workspace_host,
        "iframe_urls": {
            "multi_agent": f"https://{workspace_host}/serving-endpoints/supply-chain-analysis-mas/invocations",
            "knowledge": f"https://{workspace_host}/serving-endpoints/supplytics-knowledge-assistant/invocations"
        }
    }
