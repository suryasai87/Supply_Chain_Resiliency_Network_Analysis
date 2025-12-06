"""
Neo4j API Router
Provides endpoints for Neo4j Aura integration, query execution, and graph data
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
import logging

from services.neo4j_service import get_neo4j_service

logger = logging.getLogger(__name__)
router = APIRouter()


class QueryRequest(BaseModel):
    query: str
    parameters: Optional[Dict] = None


@router.get("/status")
async def get_neo4j_status():
    """
    Get Neo4j connection status and instance information.
    Returns connection status and instance details.
    """
    try:
        service = get_neo4j_service()
        status = service.get_connection_status()
        return status
    except Exception as e:
        logger.error(f"Failed to get Neo4j status: {e}")
        return {
            "connected": False,
            "message": str(e),
            "instance": None
        }


@router.get("/neodash-config")
async def get_neodash_config():
    """
    Get NeoDash connection configuration.
    Returns credentials needed for NeoDash to connect to Neo4j.
    """
    try:
        service = get_neo4j_service()
        config = service.get_neodash_config()
        return config
    except Exception as e:
        logger.error(f"Failed to get NeoDash config: {e}")
        return {
            "configured": False,
            "message": str(e)
        }


@router.get("/connection-info")
async def get_connection_info():
    """
    Get Neo4j connection info (without password).
    Safe to display in UI.
    """
    try:
        service = get_neo4j_service()
        info = service.get_connection_info()
        return info
    except Exception as e:
        logger.error(f"Failed to get connection info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve connection info: {str(e)}"
        )


@router.post("/query")
async def execute_query(request: QueryRequest):
    """
    Execute a Cypher query and return graph data (nodes and relationships).

    Args:
        request: QueryRequest with query string and optional parameters

    Returns:
        Dict with nodes and relationships arrays
    """
    try:
        service = get_neo4j_service()
        result = service.execute_query(request.query, request.parameters)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Query execution failed: {str(e)}"
        )


@router.get("/test-connection")
async def test_connection():
    """
    Test the Neo4j connection.
    Returns success status and message.
    """
    try:
        service = get_neo4j_service()
        result = service.test_connection()
        return result
    except Exception as e:
        logger.error(f"Connection test failed: {e}")
        return {
            "success": False,
            "message": str(e)
        }


@router.get("/schema")
async def get_schema():
    """
    Get the database schema (node labels and relationship types).
    """
    try:
        service = get_neo4j_service()
        schema = service.get_schema()
        return schema
    except Exception as e:
        logger.error(f"Failed to get schema: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get schema: {str(e)}"
        )
