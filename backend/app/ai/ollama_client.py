import httpx
import json
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi4:latest")

# HTTP timeout – AI responses can take a few seconds
TIMEOUT = httpx.Timeout(120.0)


def _messages_to_prompt(messages: List[dict]) -> str:
    """Convert chat messages list to a single prompt string for /api/generate."""
    parts = []
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role == "system":
            parts.append(f"[SYSTEM]\n{content}")
        elif role == "assistant":
            parts.append(f"[ASSISTANT]\n{content}")
        else:
            parts.append(f"[USER]\n{content}")
    parts.append("[ASSISTANT]")  # prompt AI to continue here
    return "\n\n".join(parts)


async def chat_with_ollama(messages: List[dict], stream: bool = False) -> str:
    """
    Send a list of chat messages to Ollama and return the assistant reply.
    Tries /api/chat first (Ollama >=0.1.14), falls back to /api/generate.

    Each message should be: {"role": "user" | "assistant" | "system", "content": "..."}
    """
    options = {"temperature": 0.7, "top_p": 0.9, "num_predict": 1024}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            # ── Try modern /api/chat endpoint first ───────────────────────────
            chat_payload = {
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": options,
            }
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json=chat_payload,
            )

            # /api/chat not available → try /api/generate (older Ollama)
            if response.status_code == 404:
                generate_payload = {
                    "model": OLLAMA_MODEL,
                    "prompt": _messages_to_prompt(messages),
                    "stream": False,
                    "options": options,
                }
                gen_response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json=generate_payload,
                )
                if gen_response.status_code == 404:
                    return (
                        f"Model '{OLLAMA_MODEL}' is not downloaded. "
                        f"Run: ollama pull {OLLAMA_MODEL}"
                    )
                gen_response.raise_for_status()
                data = gen_response.json()
                return data.get("response", "").strip()

            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]

        except httpx.ConnectError:
            return (
                "I'm currently unavailable. Please make sure Ollama is running "
                "with the Mistral model loaded (`ollama run mistral`)."
            )
        except Exception as exc:
            return f"AI service error: {str(exc)}"


async def check_ollama_health() -> bool:
    """Return True if Ollama is reachable."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
        try:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
        except Exception:
            return False
