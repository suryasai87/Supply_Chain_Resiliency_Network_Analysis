"""Multi-Agent Supervisor service for Databricks Agent endpoints"""

import os
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Thread pool for running synchronous SDK calls
_executor = ThreadPoolExecutor(max_workers=4)


class MultiAgentService:
    """Service for interacting with Databricks Multi-Agent Supervisor endpoints"""

    def __init__(self):
        self.multi_agent_endpoint = os.getenv("MULTI_AGENT_ENDPOINT", "mas-0ad68bad-endpoint")
        self.knowledge_endpoint = os.getenv("KNOWLEDGE_ENDPOINT", "ka-0445f231-endpoint")

        # For local development with explicit token
        self.databricks_token = os.getenv("DATABRICKS_TOKEN")
        self.databricks_host = os.getenv("DATABRICKS_HOST", "https://fe-vm-hls-amer.cloud.databricks.com")

        # Databricks SDK client (for Databricks Apps runtime)
        self._workspace_client = None
        self._auth_mode = None

        self._init_auth()

    def _init_auth(self):
        """Initialize authentication - supports both local token and Databricks Apps SDK auth"""
        if self.databricks_token:
            self._auth_mode = "token"
            logger.info(f"MultiAgentService: Using explicit token auth for host: {self.databricks_host}")
        else:
            # Try Databricks SDK auto-auth (works in Databricks Apps runtime)
            try:
                from databricks.sdk import WorkspaceClient
                from databricks.sdk.config import Config

                # Configure SDK with 10-minute timeout for long-running agent queries
                config = Config(http_timeout_seconds=600)  # 10 minutes
                self._workspace_client = WorkspaceClient(config=config)
                self._auth_mode = "sdk"
                logger.info(f"MultiAgentService: Using SDK auto-auth for host: {self._workspace_client.config.host}")
                logger.info(f"MultiAgentService: HTTP timeout set to 600 seconds (10 minutes)")
            except Exception as e:
                logger.warning(f"MultiAgentService: Could not initialize SDK auth: {e}")
                self._auth_mode = None

        logger.info(f"MultiAgentService: Auth mode = {self._auth_mode}")
        logger.info(f"MultiAgentService: Multi-agent endpoint = {self.multi_agent_endpoint}")
        logger.info(f"MultiAgentService: Knowledge endpoint = {self.knowledge_endpoint}")

    def _sync_query_endpoint(self, endpoint_name: str, messages: List[Dict[str, str]], max_tokens: int, return_trace: bool = False):
        """Synchronous query using SDK api_client.do() - handles auth automatically"""
        try:
            # Use the SDK's api_client.do() method which handles auth automatically
            # This is the same pattern used by the DHS app
            api_url = f"/serving-endpoints/{endpoint_name}/invocations"
            payload = {
                "input": messages,
                "max_output_tokens": max_tokens
            }

            # Add databricks_options for trace output (shows agent thinking)
            if return_trace:
                payload["databricks_options"] = {"return_trace": True}

            logger.info(f"Calling endpoint via SDK: {api_url}")
            logger.info(f"Payload: {payload}")

            # api_client.do() handles authentication and returns parsed JSON
            response = self._workspace_client.api_client.do(
                "POST",
                api_url,
                body=payload
            )

            logger.info(f"Response received: {type(response)}")
            return response

        except Exception as e:
            logger.error(f"Error in _sync_query_endpoint: {e}")
            raise

    async def query(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """
        Query Multi-Agent Supervisor for complex supply chain analysis.
        Uses Databricks SDK serving_endpoints.query() for Databricks Apps,
        or httpx with token for local development.
        Returns trace data showing agent thinking/tool calls if available.
        """
        if self._auth_mode is None:
            logger.warning("No auth available, returning mock response")
            return self._get_mock_response(messages)

        # Databricks Agent endpoint expects 'input' array, not 'messages'
        payload = {
            "input": messages,
            "max_output_tokens": max_tokens,
            "databricks_options": {"return_trace": True}  # Get agent thinking/trace
        }

        try:
            logger.info(f"Calling multi-agent endpoint: {self.multi_agent_endpoint} (auth: {self._auth_mode})")

            if self._auth_mode == "sdk" and self._workspace_client:
                # Use SDK with trace enabled - run in thread pool to avoid blocking async
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    _executor,
                    self._sync_query_endpoint,
                    self.multi_agent_endpoint,
                    messages,
                    max_tokens,
                    True  # return_trace=True
                )

                # Log the response for debugging
                logger.info(f"Response: {result}")

                # Extract content and trace from JSON response
                content = self._extract_content(result)
                trace = self._extract_trace(result)

                response_data = {
                    "role": "assistant",
                    "content": content,
                    "source": "multi_agent_supervisor"
                }

                # Include trace data if available (shows agent thinking)
                if trace:
                    response_data["trace"] = trace

                return response_data
            else:
                # Use httpx with explicit token (local development) - 5 minute timeout
                url = f"{self.databricks_host}/serving-endpoints/{self.multi_agent_endpoint}/invocations"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.databricks_token}"
                }

                async with httpx.AsyncClient(timeout=600.0) as client:  # 10 minute timeout
                    response = await client.post(url, json=payload, headers=headers)

                    logger.info(f"Response status: {response.status_code}")

                    if response.status_code == 200:
                        result = response.json()
                        content = self._extract_content(result)
                        trace = self._extract_trace(result)

                        response_data = {
                            "role": "assistant",
                            "content": content,
                            "source": "multi_agent_supervisor"
                        }

                        # Include trace data if available
                        if trace:
                            response_data["trace"] = trace

                        return response_data
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
            logger.error("Request timed out after 10 minutes")
            return {
                "role": "assistant",
                "content": "Request timed out after 10 minutes. The multi-agent service is taking too long to respond.",
                "source": "error"
            }
        except Exception as e:
            logger.error(f"Error calling multi-agent endpoint: {e}")
            return self._get_mock_response(messages)

    async def query_knowledge(self, messages: List[Dict[str, str]], max_tokens: int = 512) -> Dict[str, Any]:
        """
        Query Knowledge Assistant for document-based answers.
        Uses Databricks SDK serving_endpoints.query() for Databricks Apps,
        or httpx with token for local development.
        """
        if self._auth_mode is None:
            return {
                "role": "assistant",
                "content": "Knowledge search is currently unavailable. No authentication configured.",
                "source": "error"
            }

        try:
            logger.info(f"Calling knowledge endpoint: {self.knowledge_endpoint} (auth: {self._auth_mode})")

            if self._auth_mode == "sdk" and self._workspace_client:
                # Use httpx with SDK auth - run in thread pool to avoid blocking async
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    _executor,
                    self._sync_query_endpoint,
                    self.knowledge_endpoint,
                    messages,
                    max_tokens
                )

                # Log the response for debugging
                logger.info(f"Response: {result}")

                # Extract content from JSON response
                content = self._extract_content(result)

                if not content.strip():
                    content = "No response received from Knowledge Assistant."

                return {
                    "role": "assistant",
                    "content": content.strip(),
                    "source": "knowledge_assistant"
                }
            else:
                # Use httpx with explicit token (local development)
                url = f"{self.databricks_host}/serving-endpoints/{self.knowledge_endpoint}/invocations"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.databricks_token}"
                }
                payload = {
                    "input": messages,
                    "max_output_tokens": max_tokens
                }

                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(url, json=payload, headers=headers)

                    if response.status_code == 200:
                        result = response.json()
                        content = self._extract_content(result)

                        if not content.strip():
                            content = "No response received from Knowledge Assistant."

                        return {
                            "role": "assistant",
                            "content": content.strip(),
                            "source": "knowledge_assistant"
                        }
                    else:
                        error_text = response.text
                        logger.error(f"Knowledge API error {response.status_code}: {error_text}")
                        return {
                            "role": "assistant",
                            "content": f"Knowledge search error: {response.status_code}",
                            "source": "error"
                        }

        except Exception as e:
            logger.error(f"Error calling knowledge endpoint: {e}")
            return {
                "role": "assistant",
                "content": f"Knowledge search error: {str(e)}",
                "source": "error"
            }

    def _extract_sdk_response(self, result) -> str:
        """Extract text content from Databricks SDK serving_endpoints.query() response"""
        try:
            # Log all attributes for debugging
            logger.info(f"Raw SDK response: {result}")
            logger.info(f"Response type: {type(result).__name__}")

            # Dump all non-private attributes
            for attr in dir(result):
                if not attr.startswith('_'):
                    try:
                        val = getattr(result, attr)
                        if not callable(val):
                            logger.info(f"  {attr}: {type(val).__name__} = {str(val)[:200]}")
                    except Exception:
                        pass

            # Try choices first (chat completion format)
            if hasattr(result, 'choices') and result.choices:
                choices = result.choices
                logger.info(f"Found choices: {choices}")
                if isinstance(choices, list) and len(choices) > 0:
                    choice = choices[0]
                    if hasattr(choice, 'message') and hasattr(choice.message, 'content'):
                        return choice.message.content
                    if hasattr(choice, 'text'):
                        return choice.text

            # Try to get predictions attribute (common in serving endpoint responses)
            if hasattr(result, 'predictions') and result.predictions:
                predictions = result.predictions
                logger.info(f"Predictions: {predictions}")
                if isinstance(predictions, list) and len(predictions) > 0:
                    return str(predictions[0])
                return str(predictions)

            # Try to get output attribute
            if hasattr(result, 'output') and result.output:
                output = result.output
                logger.info(f"Output: {output}")
                # Handle list of outputs (agent format)
                if isinstance(output, list):
                    texts = []
                    for item in output:
                        if hasattr(item, 'content'):
                            content = item.content
                            if isinstance(content, list):
                                for c in content:
                                    if hasattr(c, 'text'):
                                        texts.append(c.text)
                            elif isinstance(content, str):
                                texts.append(content)
                        elif hasattr(item, 'text'):
                            texts.append(item.text)
                        elif isinstance(item, dict):
                            if 'text' in item:
                                texts.append(item['text'])
                            elif 'content' in item:
                                texts.append(str(item['content']))
                    if texts:
                        return "\n".join(texts)
                elif isinstance(output, str):
                    return output

            # Try to convert to dict and extract
            if hasattr(result, 'as_dict'):
                result_dict = result.as_dict()
                logger.info(f"Result as dict: {result_dict}")
                return self._extract_content(result_dict)

            # Try common attribute names
            for attr in ['response', 'content', 'text', 'message', 'data']:
                if hasattr(result, attr):
                    val = getattr(result, attr)
                    if val and isinstance(val, str):
                        return val

            # Last resort: convert to string
            return str(result)

        except Exception as e:
            logger.error(f"Error extracting SDK response: {e}")
            return str(result)

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

    def _extract_trace(self, result: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """
        Extract trace/thinking data from Databricks Agent response.
        Trace shows the agent's reasoning, tool calls, and intermediate steps.
        Parses MLflow trace format from databricks_output.trace.data.spans
        """
        try:
            trace_data = []

            # Check for databricks_output.trace (MLflow trace format)
            if "databricks_output" in result:
                db_output = result["databricks_output"]
                if "trace" in db_output:
                    trace = db_output["trace"]

                    # Extract info summary
                    info = trace.get("info", {})
                    if info:
                        duration_ms = info.get("execution_duration_ms", 0)
                        trace_id = info.get("trace_id", "")
                        trace_data.append({
                            "type": "info",
                            "name": "Trace Info",
                            "content": f"Trace ID: {trace_id[:20]}... | Duration: {duration_ms}ms"
                        })

                    # Parse spans from trace data
                    data = trace.get("data", {})
                    spans = data.get("spans", [])

                    for span in spans:
                        span_name = span.get("name", "unknown")
                        span_type = "agent"
                        attributes = span.get("attributes", {})

                        # Parse span type from attributes
                        if "mlflow.spanType" in attributes:
                            span_type_raw = attributes["mlflow.spanType"].strip('"')
                            span_type = span_type_raw.lower()

                        # Parse inputs/outputs for tool calls
                        span_inputs = attributes.get("mlflow.spanInputs", "")
                        span_outputs = attributes.get("mlflow.spanOutputs", "")

                        # Determine trace step type
                        if "tool" in span_name.lower() or span_type == "tool":
                            trace_data.append({
                                "type": "tool_call",
                                "name": span_name,
                                "content": f"Executing tool: {span_name}"
                            })
                        elif span_type == "llm" or "chat" in span_name.lower():
                            trace_data.append({
                                "type": "reasoning",
                                "name": "LLM Call",
                                "content": f"Processing with language model"
                            })
                        elif span_type == "retriever":
                            trace_data.append({
                                "type": "tool_call",
                                "name": "Retrieval",
                                "content": "Searching knowledge base"
                            })
                        elif span_name not in ["predict", "predict_stream"]:
                            # Add other named spans
                            trace_data.append({
                                "type": "agent",
                                "name": span_name,
                                "content": f"Agent step: {span_name}"
                            })

            # Check for trace at top level (alternative format)
            if not trace_data and "trace" in result:
                return result["trace"] if isinstance(result["trace"], list) else None

            # Check output array for tool calls and reasoning steps
            if "output" in result and isinstance(result["output"], list):
                for item in result["output"]:
                    if isinstance(item, dict):
                        item_type = item.get("type", "")

                        # Capture tool_use entries (function calls)
                        if item_type == "tool_use" or item_type == "function_call":
                            trace_data.append({
                                "type": "tool_call",
                                "name": item.get("name", "unknown"),
                                "input": item.get("input", item.get("arguments", {})),
                                "id": item.get("id", "")
                            })

                        # Capture tool_result entries
                        elif item_type == "tool_result" or item_type == "function_result":
                            trace_data.append({
                                "type": "tool_result",
                                "tool_use_id": item.get("tool_use_id", item.get("id", "")),
                                "content": item.get("content", "")
                            })

                        # Capture reasoning/thinking steps
                        elif item_type == "reasoning" or item_type == "thinking":
                            trace_data.append({
                                "type": "reasoning",
                                "content": item.get("content", item.get("text", ""))
                            })

                        # Capture handoff between agents (multi-agent supervisor)
                        elif item_type == "handoff" or "agent" in item_type.lower():
                            trace_data.append({
                                "type": "agent_handoff",
                                "agent": item.get("agent", item.get("name", "unknown")),
                                "content": item.get("content", "")
                            })

            return trace_data if trace_data else None

        except Exception as e:
            logger.error(f"Error extracting trace: {e}")
            return None

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
