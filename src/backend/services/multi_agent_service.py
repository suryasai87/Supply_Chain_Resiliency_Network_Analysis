"""Multi-Agent Supervisor service for Databricks Agent endpoints"""

import os
import logging
from typing import List, Dict, Any
import httpx
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class MultiAgentService:
    """Service for interacting with Databricks Multi-Agent Supervisor endpoints"""

    def __init__(self):
        self.databricks_host = os.getenv("DATABRICKS_HOST", "https://fe-vm-hls-amer.cloud.databricks.com")
        self.databricks_token = os.getenv("DATABRICKS_TOKEN")
        self.multi_agent_endpoint = os.getenv("MULTI_AGENT_ENDPOINT", "mas-0ad68bad-endpoint")
        self.knowledge_endpoint = os.getenv("KNOWLEDGE_ENDPOINT", "ka-0445f231-endpoint")

        # Initialize OpenAI client for Knowledge Assistant (uses responses API)
        if self.databricks_token:
            self.openai_client = OpenAI(
                api_key=self.databricks_token,
                base_url=f"{self.databricks_host}/serving-endpoints"
            )
            logger.info(f"Initialized MultiAgentService for Databricks: {self.databricks_host}")
            logger.info(f"Multi-agent endpoint: {self.multi_agent_endpoint}")
            logger.info(f"Knowledge endpoint: {self.knowledge_endpoint}")
        else:
            self.openai_client = None
            logger.warning("No DATABRICKS_TOKEN found - will use mock responses")

    async def query(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """
        Query Multi-Agent Supervisor for complex supply chain analysis.
        Uses Databricks Agent endpoint format (input array, not messages).
        """
        if not self.databricks_token:
            logger.warning("No token available, returning mock response")
            return self._get_mock_response(messages)

        url = f"{self.databricks_host}/serving-endpoints/{self.multi_agent_endpoint}/invocations"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.databricks_token}"
        }

        # Databricks Agent endpoint expects 'input' array, not 'messages'
        # Convert chat messages to the expected format
        payload = {
            "input": messages,
            "max_output_tokens": max_tokens
        }

        try:
            logger.info(f"Calling multi-agent endpoint: {url}")
            logger.debug(f"Payload: {payload}")

            async with httpx.AsyncClient(timeout=300.0) as client:  # 5 min timeout for complex queries
                response = await client.post(url, json=payload, headers=headers)

                logger.info(f"Response status: {response.status_code}")

                if response.status_code == 200:
                    result = response.json()
                    logger.debug(f"Response: {result}")

                    # Extract content from various possible response formats
                    content = self._extract_content(result)

                    return {
                        "role": "assistant",
                        "content": content,
                        "source": "multi_agent_supervisor",
                        "raw_response": result
                    }
                else:
                    error_text = response.text
                    logger.error(f"API error {response.status_code}: {error_text}")
                    return {
                        "role": "assistant",
                        "content": f"Error from Multi-Agent service: {response.status_code}",
                        "source": "error",
                        "error": error_text
                    }

        except httpx.TimeoutException:
            logger.error("Request timed out")
            return {
                "role": "assistant",
                "content": "Request timed out. The multi-agent service is taking too long to respond.",
                "source": "error"
            }
        except Exception as e:
            logger.error(f"Error calling multi-agent endpoint: {e}")
            return self._get_mock_response(messages)

    async def query_knowledge(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """
        Query Knowledge Assistant for document-based answers.
        Uses OpenAI SDK responses.create() for Databricks Knowledge Assistant.
        """
        if not self.openai_client:
            return {
                "role": "assistant",
                "content": "Knowledge search is currently unavailable. Please configure DATABRICKS_TOKEN.",
                "source": "error"
            }

        try:
            logger.info(f"Calling knowledge endpoint: {self.knowledge_endpoint}")

            # Use OpenAI SDK responses.create() as shown in the example
            response = self.openai_client.responses.create(
                model=self.knowledge_endpoint,
                input=messages
            )

            # Extract text from response using the pattern from the example:
            # response.output contains list of outputs, each with content list containing text
            content = " ".join(
                getattr(content_item, "text", "")
                for output in response.output
                for content_item in getattr(output, "content", [])
            )

            if not content.strip():
                content = "No response received from Knowledge Assistant."

            logger.info(f"Knowledge response received: {len(content)} chars")

            return {
                "role": "assistant",
                "content": content.strip(),
                "source": "knowledge_assistant"
            }

        except Exception as e:
            logger.error(f"Error calling knowledge endpoint: {e}")
            return {
                "role": "assistant",
                "content": f"Knowledge search error: {str(e)}",
                "source": "error"
            }

    def _extract_content(self, result: Dict[str, Any]) -> str:
        """Extract text content from Databricks Agent response formats"""

        # Handle Databricks Agent response format:
        # {"output": [{"type": "message", "content": [{"text": "...", "type": "output_text"}]}]}
        if "output" in result and isinstance(result["output"], list):
            for output_item in result["output"]:
                if isinstance(output_item, dict):
                    # Check for message type with content array
                    if output_item.get("type") == "message" and "content" in output_item:
                        content_list = output_item["content"]
                        if isinstance(content_list, list):
                            # Extract text from content items
                            texts = []
                            for content_item in content_list:
                                if isinstance(content_item, dict) and "text" in content_item:
                                    texts.append(content_item["text"])
                            if texts:
                                return "\n".join(texts)
                    # Fallback: try direct content/text keys
                    for key in ["content", "text", "message"]:
                        if key in output_item:
                            val = output_item[key]
                            if isinstance(val, str):
                                return val

        # Fallback: try other common response fields
        for field in ["response", "content", "text", "message", "predictions", "result"]:
            if field in result:
                value = result[field]
                if isinstance(value, str):
                    return value
                elif isinstance(value, dict) and "text" in value:
                    return value["text"]

        # If nothing found, return the whole result as string
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

        elif "tariff" in last_message.lower():
            content = """**Tariff Impact Analysis:**

**Current Exposure:**
- Total Annual Tariff Cost: $45.2M
- China Section 301: $28.5M (63%)
- Section 232 Steel/Aluminum: $12.3M (27%)
- Other: $4.4M (10%)

**High-Impact Materials:**
1. Semiconductors (CN): 25% tariff, $15.2M impact
2. PCB Assemblies (CN): 25% tariff, $8.7M impact
3. Steel Components (Various): 25% tariff, $6.1M impact

**Mitigation Opportunities:**
- Vietnam sourcing: Potential $12M savings
- Mexico nearshoring: Potential $8M savings
- Tariff engineering: $3M in classification optimization

Would you like me to model a specific scenario?"""

        else:
            content = """I'm your Supply Chain AI Assistant powered by Multi-Agent Supervisor. I can help you with:

1. **Network Risk Analysis** - Identify single-source dependencies, geographic concentration
2. **Tariff Impact Assessment** - Model tariff scenarios and find alternatives
3. **Max-Flow Capacity Analysis** - Find bottlenecks using Edmonds-Karp algorithm
4. **What-If Scenarios** - Simulate disruptions and measure impact
5. **Supplier Intelligence** - Deep dive into supplier performance and risk

What would you like to explore?"""

        return {
            "role": "assistant",
            "content": content,
            "source": "mock_response"
        }
