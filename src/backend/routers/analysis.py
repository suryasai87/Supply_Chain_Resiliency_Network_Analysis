"""Analysis router - max-flow, centrality, what-if scenarios"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from services.graph_service import GraphService

router = APIRouter()
graph_service = GraphService()


class MaxFlowRequest(BaseModel):
    source_id: str
    sink_id: str


class WhatIfRequest(BaseModel):
    node_id: str
    disruption_level: float  # 0.0 to 1.0
    duration_days: int


class CentralityRequest(BaseModel):
    node_type: Optional[str] = None
    metric: str = "betweenness"  # betweenness, pagerank, eigenvector


@router.post("/max-flow")
async def run_max_flow(request: MaxFlowRequest):
    """
    Run Edmonds-Karp max-flow algorithm between source and sink.
    Returns maximum flow value and bottleneck edges.
    """
    try:
        result = graph_service.compute_max_flow(
            source_id=request.source_id,
            sink_id=request.sink_id
        )
        return result
    except Exception as e:
        return {"error": str(e), "max_flow": 0, "bottlenecks": []}


@router.post("/centrality")
async def compute_centrality(request: CentralityRequest):
    """
    Compute centrality metrics for nodes.
    Supports betweenness, PageRank, and eigenvector centrality.
    """
    try:
        result = graph_service.compute_centrality(
            node_type=request.node_type,
            metric=request.metric
        )
        return result
    except Exception as e:
        return {"error": str(e), "rankings": []}


@router.post("/what-if")
async def run_what_if(request: WhatIfRequest):
    """
    Simulate disruption scenario and compute impact.
    Returns affected products, revenue at risk, and alternative suppliers.
    """
    try:
        result = graph_service.simulate_disruption(
            node_id=request.node_id,
            disruption_level=request.disruption_level,
            duration_days=request.duration_days
        )
        return result
    except Exception as e:
        return {"error": str(e), "impact": {}}


@router.get("/recommendations")
async def get_recommendations():
    """
    Get AI-generated recommendations based on current network state.
    """
    # Mock recommendations - in production, this would call the Multi-Agent Supervisor
    recommendations = [
        {
            "id": 1,
            "priority": "critical",
            "title": "Qualify backup supplier for MAT-023",
            "description": "Single-source dependency creates unacceptable risk",
            "impact": "Reduces single-source risk by 45%",
            "roi": 2300000
        },
        {
            "id": 2,
            "priority": "high",
            "title": "Relocate sourcing for tariff-exposed materials",
            "description": "Move 12 materials from China to Vietnam",
            "impact": "$1.2M annual tariff savings",
            "roi": 1200000
        },
        {
            "id": 3,
            "priority": "medium",
            "title": "Increase safety stock for critical materials",
            "description": "Build 30-day buffer for high-risk items",
            "impact": "30-day supply continuity buffer",
            "roi": 850000
        }
    ]

    return {"recommendations": recommendations, "count": len(recommendations)}


@router.get("/summary")
async def get_analysis_summary():
    """
    Get overall supply chain analysis summary.
    """
    # This would aggregate data from Unity Catalog in production
    return {
        "resiliency_score": 72,
        "single_sourced_materials": 23,
        "tariff_exposure": 45200000,
        "geographic_concentration": 0.67,
        "active_suppliers": 847,
        "critical_alerts": 4,
        "trend": "+5%"
    }
