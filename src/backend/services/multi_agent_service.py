"""Multi-Agent Supervisor and Knowledge Assistant service"""

import os
from typing import List, Dict, Any, Optional
import httpx


class MultiAgentService:
    """Service for interacting with Multi-Agent Supervisor and Knowledge Assistant"""

    def __init__(self):
        self.workspace_host = os.getenv("DATABRICKS_SERVER_HOSTNAME", "fe-vm-hls-amer.cloud.databricks.com")
        self.multi_agent_endpoint = os.getenv("MULTI_AGENT_ENDPOINT", "supply-chain-analysis-mas")
        self.knowledge_endpoint = os.getenv("KNOWLEDGE_ENDPOINT", "supplytics-knowledge-assistant")
        self.token = os.getenv("DATABRICKS_TOKEN")

    async def query(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """
        Query Multi-Agent Supervisor for complex supply chain analysis.
        """
        url = f"https://{self.workspace_host}/serving-endpoints/{self.multi_agent_endpoint}/invocations"

        headers = {
            "Content-Type": "application/json"
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        payload = {
            "input": messages,
            "max_output_tokens": max_tokens
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                result = response.json()

                # Extract content from response
                content = self._extract_content(result)

                return {
                    "role": "assistant",
                    "content": content,
                    "source": "multi_agent_supervisor"
                }

        except httpx.HTTPError as e:
            # Return mock response for development
            return self._get_mock_response(messages)

    async def query_knowledge(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """
        Query Knowledge Assistant for document-based answers.
        """
        url = f"https://{self.workspace_host}/serving-endpoints/{self.knowledge_endpoint}/invocations"

        headers = {
            "Content-Type": "application/json"
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        payload = {
            "input": messages,
            "max_output_tokens": max_tokens
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                result = response.json()
                content = self._extract_content(result)

                return {
                    "role": "assistant",
                    "content": content,
                    "source": "knowledge_assistant"
                }

        except httpx.HTTPError as e:
            return {
                "role": "assistant",
                "content": "Knowledge search is currently unavailable. Please try the Multi-Agent Supervisor for complex queries.",
                "source": "error"
            }

    def _extract_content(self, result: Dict[str, Any]) -> str:
        """Extract text content from various response formats"""

        # Try different possible response fields
        for field in ["output", "response", "content", "text", "message"]:
            if field in result:
                value = result[field]
                if isinstance(value, str):
                    return value
                elif isinstance(value, list) and len(value) > 0:
                    if isinstance(value[0], dict) and "content" in value[0]:
                        return value[0]["content"]
                    return str(value[0])
                elif isinstance(value, dict) and "content" in value:
                    return value["content"]

        return str(result)

    def _get_mock_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Return mock response for development/testing"""

        last_message = messages[-1]["content"] if messages else ""

        # Generate contextual mock response
        if "risk" in last_message.lower():
            content = """Based on my analysis of your supply chain network:

**Key Risk Findings:**
1. **Single-Source Risk**: 23 materials rely on a single supplier, representing 12% of your total material base
2. **Geographic Concentration**: 67% of Tier-1 suppliers are located in Asia-Pacific, creating regional risk exposure
3. **Tariff Exposure**: $45.2M in annual tariff costs, primarily from China Section 301 tariffs

**Recommended Actions:**
- Qualify backup suppliers for top 5 single-sourced materials
- Diversify sourcing to include Vietnam and Mexico for tariff mitigation
- Increase safety stock for materials with lead times >30 days

Would you like me to provide more details on any of these findings?"""

        elif "supplier" in last_message.lower():
            content = """Here's a summary of your supplier network:

**Supplier Overview:**
- **Total Active Suppliers**: 847
- **Tier 1**: 156 suppliers
- **Tier 2**: 423 suppliers
- **Tier 3+**: 268 suppliers

**Top Risk Suppliers:**
1. SUPP-023 (Taiwan): Single source for 8 semiconductor components
2. SUPP-089 (China): 15-day delivery delays trending
3. SUPP-112 (Germany): Quality variance increasing

**Hidden Dependencies Detected:**
- Rare Earth Materials Co supplies 45% of your Tier-2 suppliers' magnetic components

What specific supplier analysis would you like me to perform?"""

        else:
            content = """I'm your Supply Chain AI Assistant. I can help you with:

1. **Network Risk Analysis** - Identify single-source dependencies, geographic concentration
2. **Tariff Impact Assessment** - Model tariff scenarios and find alternatives
3. **Max-Flow Capacity Analysis** - Find bottlenecks using Edmonds-Karp algorithm
4. **What-If Scenarios** - Simulate disruptions and measure impact
5. **Recommendations** - AI-generated action items to improve resiliency

What would you like to explore?"""

        return {
            "role": "assistant",
            "content": content,
            "source": "mock_response"
        }
