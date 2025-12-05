"""Chat router - Multi-Agent Supervisor and Knowledge Assistant integration"""

import os
import json
import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
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


@router.post("/multi-agent/stream")
async def chat_multi_agent_stream(request: ChatRequest, http_request: Request):
    """
    Stream Multi-Agent Supervisor response with real-time thinking updates.
    Uses Server-Sent Events (SSE) to stream trace steps as they happen.
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            messages = [{"role": m.role, "content": m.content} for m in request.messages]

            # Stream events from the service
            async for event in multi_agent_service.query_stream(
                messages=messages,
                max_tokens=request.max_tokens
            ):
                # Format as SSE
                yield f"data: {json.dumps(event)}\n\n"

            # Send done event
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            error_event = {
                "type": "error",
                "content": str(e)
            }
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


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
