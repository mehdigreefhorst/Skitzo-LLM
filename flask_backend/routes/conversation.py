# routes/conversation.py
import re
from flask import Blueprint, jsonify, request, current_app
import random
conversation_bp = Blueprint("conversation", __name__, url_prefix="/")
import json 

@conversation_bp.route("/convo", methods=["GET"])
def get_conversation():
    convo = current_app.extensions["conversation"]
    meta = {
        "llm1Name": convo.agents[0].name,
        "llm2Name": convo.agents[1].name,
        "topic": "Two models in dialogue"
    }

    # Normalize to the UI's Message type
    normalized = []
    for idx, m in enumerate(convo.get_convo()):
        normalized.append({
            "id": str(idx),
            "sender": m["role"],          # 'llm1' or 'llm2'
            "content": m["content"],
            "timestamp": m["timestamp"],
        })

    return jsonify({"messages": normalized, "metadata": meta}), 200


@conversation_bp.route("/generate", methods=["POST"])
def post_message_and_reply():
    convo = current_app.extensions["conversation"]

    last_role = convo.messages[-1]["role"] if convo.messages else convo.agents[0].role
    candidates = [a for a in convo.agents if a.role != last_role]
    selected_agent = random.choice(candidates)
    if len(convo.messages) == 0:
        "first message is always user"
        selected_agent = [agent for agent in convo.agents if agent.role == "user"][0]
        print("selected agent= ", selected_agent)
    print("selected_agent name = ", selected_agent.name)

    print("selected_agent goal = ", selected_agent.goal)
    print("selected_ai text = ", convo.get_convo(exclude_timestamp=True))
    
    ai_text = selected_agent.generate_response(convo.get_convo(exclude_timestamp=True))
    ai_text = re.sub(r"<think>.*?</think>", "", ai_text, flags=re.DOTALL)
    convo.add_message(selected_agent.role, ai_text)

    # Build and return the last message in the UI shape
    idx = len(convo.messages) - 1
    m = convo.messages[-1]
    message = {
        "id": str(idx),
        "sender": m["role"],
        "content": m["content"],
        "timestamp": m["timestamp"],
    }
    return jsonify(message), 200  # <-- no json.dumps()


@conversation_bp.route("/convo/reset", methods=["POST"])
def reset_conversation():
    current_app.extensions["conversation"].clear()
    return jsonify({"ok": True}), 200