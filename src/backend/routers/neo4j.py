"""
Neo4j API Router
Provides endpoints for Neo4j Aura integration
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
import logging

from services.neo4j_service import get_neo4j_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/status")
async def get_neo4j_status():
    """
    Get Neo4j connection status and instance information.
    Returns connection status and list of available instances.
    """
    try:
        service = get_neo4j_service()
        status = await service.get_connection_status()
        return status
    except Exception as e:
        logger.error(f"Failed to get Neo4j status: {e}")
        return {
            "connected": False,
            "message": str(e),
            "instances": []
        }


@router.get("/instances")
async def list_instances():
    """
    List all Neo4j Aura instances.
    Returns a list of instances with their details.
    """
    try:
        service = get_neo4j_service()
        instances = await service.get_instances()
        return {"instances": instances}
    except Exception as e:
        logger.error(f"Failed to list Neo4j instances: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve Neo4j instances: {str(e)}"
        )


@router.get("/instances/{instance_id}")
async def get_instance(instance_id: str):
    """
    Get details for a specific Neo4j instance.

    Args:
        instance_id: The ID of the Neo4j instance

    Returns:
        Instance details including connection URL and status
    """
    try:
        service = get_neo4j_service()
        instance = await service.get_instance(instance_id)

        if not instance:
            raise HTTPException(
                status_code=404,
                detail=f"Instance {instance_id} not found"
            )

        return {"instance": instance}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get Neo4j instance {instance_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve instance: {str(e)}"
        )


@router.get("/connection-url/{instance_id}")
async def get_connection_url(instance_id: str):
    """
    Get the connection URL for a specific Neo4j instance.
    This can be used to connect NeoDash or other clients.

    Args:
        instance_id: The ID of the Neo4j instance

    Returns:
        Connection URL and credentials info
    """
    try:
        service = get_neo4j_service()
        instance = await service.get_instance(instance_id)

        if not instance:
            raise HTTPException(
                status_code=404,
                detail=f"Instance {instance_id} not found"
            )

        return {
            "connection_url": instance.get("connection_url"),
            "name": instance.get("name"),
            "status": instance.get("status"),
            "note": "Use your Neo4j database credentials to connect"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get connection URL for {instance_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve connection URL: {str(e)}"
        )
