"""
Neo4j API Router
Provides endpoints for Neo4j Aura integration and NeoDash configuration
"""

from fastapi import APIRouter, HTTPException
import logging

from services.neo4j_service import get_neo4j_service

logger = logging.getLogger(__name__)
router = APIRouter()


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
