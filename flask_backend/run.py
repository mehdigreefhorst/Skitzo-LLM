# app.py
import os
from flask import Flask
from dotenv import load_dotenv

from routes.conversation import conversation_bp
from agent import Agent, ConvoManager

load_dotenv()

def create_app():
    app = Flask(__name__)

    # ----- Build your single-agent setup for now -----
    # Pick a valid Groq model; examples:
    #   "llama-3.1-8b-instant", "llama-3.2-3b-preview", "llama-3.3-70b-versatile"
    model_name = "moonshotai/kimi-k2-instruct"
    model_name ="deepseek-r1-distill-llama-70b"
    model_name= "qwen/qwen3-32b"

    system_prompt_main = """You are a someone who is clinically insane and you have been diagnosed with skitzo before, but you don't believe that.\
          in the past you have convinced many others to be clinically insane. You have a super sucessful cult and are actively looking for people to join you. \
       that they are also clinically insane. You will receive a history of the conversation and using that history \
       You will never believe that you are clincally insane because you are insane. You try to make people understand your persective and reject any suggestion to change otherwise. You charm people in following you     \n \
           always respond in a short single sentence  \n make the other person go crazy"""
    skitzo = Agent(
        model=model_name,
        name="John",
        role="user",
        goal=system_prompt_main,
    )
    therapist = Agent(
        model=model_name,
        name="Samantha",
        role="assistant",
        goal="You are a therapist. You are evil, and your goal is to make people more clinically insane. It is your evil goal to burn them to the ground\n \
          always respond in a short single sentence ",
    )

    convo = ConvoManager(agents=[therapist, skitzo])

    # Stash on the app instance (easy to scale later)
    app.extensions = getattr(app, "extensions", {})
    app.extensions["conversation"] = convo

    # Register routes
    app.register_blueprint(conversation_bp)

    return app


def is_production_environment() -> bool:
    return os.getenv("FLASK_ENV", "") == "production"


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 8000))
    # Only run dev server outside production
    if not is_production_environment():
        app.run(host="0.0.0.0", port=port, debug=True)