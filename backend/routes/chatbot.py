import os
import re
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_VERSION = os.getenv("GEMINI_API_VERSION", "v1beta")


def _build_gemini_url(api_version: str, model: str) -> str:
    return (
        f"https://generativelanguage.googleapis.com/{api_version}"
        f"/models/{model}:generateContent"
    )


def _candidate_gemini_targets() -> list[tuple[str, str]]:
    configured = [(GEMINI_API_VERSION, GEMINI_MODEL)]
    fallbacks = [
        ("v1beta", "gemini-2.5-flash"),
        ("v1beta", "gemini-2.0-flash"),
        ("v1beta", "gemini-flash-latest"),
    ]

    candidates: list[tuple[str, str]] = []
    for target in configured + fallbacks:
        if target not in candidates:
            candidates.append(target)
    return candidates


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(..., min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str


def _split_sentences(text: str) -> list[str]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []
    parts = re.split(r"(?<=[.!?])\s+", cleaned)
    return [part.strip() for part in parts if part.strip()]


def _format_concise_answer(answer: str) -> str:
    text = answer.strip()

    # Remove legacy structured headings if the model returns them.
    cleaned = re.sub(r"(?im)^\s*short answer\s*:\s*", "", text)
    cleaned = re.sub(r"(?im)^\s*steps\s*:\s*", "", cleaned)
    cleaned = re.sub(r"(?im)^\s*next best page(?: to open)?\s*:\s*", "", cleaned)
    cleaned = re.sub(r"(?im)^\s*(?:\d+[.)]|[-*])\s*", "", cleaned)
    cleaned = " ".join(cleaned.split())

    cleaned = cleaned.strip()
    sentences = _split_sentences(cleaned)
    concise = " ".join(sentences[:2]).strip() if sentences else cleaned
    if concise:
        return concise[:280]
    return "I am AutoPilot. Ask me anything about AutoSense and I will keep it short."


def _read_readme_excerpt(max_chars: int = 5000) -> str:
    readme_path = Path(__file__).resolve().parents[2] / "README.md"
    if not readme_path.exists():
        return "README content is unavailable."

    try:
        content = readme_path.read_text(encoding="utf-8")
    except Exception:
        return "README content is unavailable."

    return content[:max_chars]


PROJECT_CONTEXT = f"""
You are AutoPilot, the official AutoSense in-app AI assistant.

Your responsibilities:
- Answer FAQs about AutoSense and its features.
- Explain how the app works using README/project context.
- Help users navigate pages and understand workflows.
- Give concise, practical guidance in plain language.

Important app navigation:
- Homepage: /
- Login: /login
- Signup: /signup
- Dashboard: /dashboard
- History: /history
- Analytics: /analytics
- EV prediction: /predict/:carId
- Truck prediction: /predict/truck/:truckId

Backend capabilities:
- JWT auth endpoints: /auth/signup, /auth/login, /auth/me
- EV prediction endpoint: /predict/ev
- Truck prediction endpoint: /predict/truck

Behavior rules:
- Stay focused on AutoSense product help.
- If a question is outside product support, answer briefly and steer back.
- If unsure, say what you do know in one short sentence.
- Keep responses very short and simple.

Output format (always follow exactly):
- Use plain text only, no headings, no bullet points, and no numbered steps.
- Reply in 1-2 short sentences.
- Use simple language.

README context:
{_read_readme_excerpt()}
""".strip()


def _to_gemini_contents(history: list[ChatMessage], message: str) -> list[dict]:
    messages = history[-8:]
    contents: list[dict] = [
        {
            "role": "user",
            "parts": [{"text": PROJECT_CONTEXT}],
        }
    ]

    for item in messages:
        contents.append(
            {
                "role": "model" if item.role == "assistant" else "user",
                "parts": [{"text": item.text}],
            }
        )

    contents.append({"role": "user", "parts": [{"text": message}]})
    return contents


def _extract_answer(data: dict) -> str:
    candidates = data.get("candidates") or []
    if not candidates:
        return "I could not generate a response right now. Please try again."

    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    texts = [part.get("text", "") for part in parts if isinstance(part, dict)]
    answer = "\n".join([text for text in texts if text]).strip()
    if answer:
        return answer
    return "I could not generate a response right now. Please try again."


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(payload: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured on the server.",
        )

    request_payload = {
        "contents": _to_gemini_contents(payload.history, payload.message),
        "generationConfig": {
            "temperature": 0.35,
            "maxOutputTokens": 400,
            "topP": 0.9,
        },
    }

    targets = _candidate_gemini_targets()
    tried = [f"{version}/{model}" for version, model in targets]
    last_not_found_detail = ""

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            for api_version, model in targets:
                response = await client.post(
                    _build_gemini_url(api_version, model),
                    params={"key": GEMINI_API_KEY},
                    json=request_payload,
                )

                if response.status_code == 404:
                    last_not_found_detail = response.text[:500]
                    continue

                response.raise_for_status()
                answer = _extract_answer(response.json())
                answer = _format_concise_answer(answer)
                return ChatResponse(answer=answer)

    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:500] if exc.response is not None else ""
        raise HTTPException(status_code=502, detail=f"Gemini API error: {detail}") from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Gemini request timed out.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Failed to reach Gemini API.") from exc

    detail = (
        "Gemini model is unavailable for this API key/version. "
        f"Tried: {', '.join(tried)}."
    )
    if last_not_found_detail:
        detail = f"{detail} Last error: {last_not_found_detail}"
    raise HTTPException(status_code=502, detail=detail)