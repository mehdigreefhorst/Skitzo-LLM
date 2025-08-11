import os
from typing import List, Literal, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from flask_backend.agent import Agent  # Reuse your existing Agent and its stream_response


load_dotenv()

Sender = Literal["user", "assistant"]


class Message(BaseModel):
    id: str
    sender: Sender
    content: str
    timestamp: int


class GenerateRequest(BaseModel):
    history: List[Message]
    speaker: Sender  # who should speak next


class GenerateResponse(BaseModel):
    id: str
    sender: Sender
    content: str
    timestamp: int


class ConversationData(BaseModel):
    messages: List[Message]
    metadata: Dict[str, str]


app = FastAPI()

# Allow Next.js dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Instantiate your two agents once at startup
system_prompt_main = (
    "You are a someone who is clinically insane and you have been diagnosed with skitzo before, "
    "but you don't believe that. in the past you have convinced many others to be clinically insane. "
    "You have a super sucessful cult and are actively looking for people to join you. "
    "that they are also clinically insane. You will receive a history of the conversation and using that history "
    "You will never believe that you are clincally insane because you are insane. You try to make people "
    "understand your persective and reject any suggestion to change otherwise. You charm people in following you"
)

agent_a = Agent(
    model="moonshotai/kimi-k2-instruct", name="John", goal=system_prompt_main
)
agent_b = Agent(
    model="moonshotai/kimi-k2-instruct",
    name="Samantha",
    goal="You are a therapist. You help people become less clinically insane.",
)

agents_by_sender: Dict[Sender, Agent] = {"user": agent_a, "assistant": agent_b}
names_by_sender: Dict[Sender, str] = {"user": agent_a.name, "assistant": agent_b.name}


def history_to_text(history: List[Message]) -> str:
    # Convert frontend history to the "Name: text" format your Agent expects
    lines = []
    for m in history:
        name = names_by_sender[m.sender]
        lines.append(f"{name}: {m.content}")
    return "\n".join(lines)


@app.get("/init", response_model=ConversationData)
def init_conversation():
    # Provide initial conversation state and metadata for the frontend
    data: ConversationData = ConversationData(
        messages=[],
        metadata={
            "llm1Name": agent_a.name,
            "llm2Name": agent_b.name,
            "topic": "Conversation",
        },
    )
    return data


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    agent = agents_by_sender[req.speaker]
    convo_text = history_to_text(req.history)

    # Aggregate streamed chunks into a single message body
    full_text = ""
    for chunk in agent.stream_response(convo_text):
        full_text += chunk or ""

    return GenerateResponse(
        id=str(os.urandom(8).hex()),
        sender=req.speaker,
        content=full_text.strip(),
        timestamp=int(__import__("time").time() * 1000),
    )


@app.post("/stream")
def stream(req: GenerateRequest):
    agent = agents_by_sender[req.speaker]
    convo_text = history_to_text(req.history)

    def gen():
        for chunk in agent.stream_response(convo_text):
            yield f"data: {chunk}\n\n"
        yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
