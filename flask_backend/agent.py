import time
from typing import List
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()



class Agent:
    def __init__(self, model, name, goal, role):
        self.role = role
        self.client = Groq(api_key=os.getenv("GROQ_KEY"))
        self.name = name
        self.goal = goal
        self.model = model

    def generate_response(self, prior_messages: List):
        full_messages = [{"role": "system", "content": self.goal}]
        full_messages += prior_messages
        print("\n\nspeaker = ", self.name)
        print("\n", self.goal)
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            # reasoning_effort="medium",
            stream=True,
            stop=None
        )
        response = ""
        for chunk in completion:
            response += chunk.choices[0].delta.content or ""
        print(f"response = {response}")
        return response

    def stream_response(self, convo_history: str):
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.goal},
                {"role": "user", "content": convo_history},
            ],
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            stream=True,
            stop=None,
        )
        for chunk in completion:
            yield chunk.choices[0].delta.content or ""




class ConvoManager:
    def __init__(self, agents: List[Agent]):
        self.agents = agents
        self.messages = []

    def add_message(self, role, message):
        self.messages.append({
            "role" : role, 
            "content" : message, 
            "timestamp": int(time.time() * 1000)
})

    def get_convo(self, exclude_timestamp=False, role_transform: bool = None):
      if exclude_timestamp:
          messages = [
            {"role": m["role"], "content": m["content"]}
              for m in self.messages
              if "role" in m and "content" in m
        ]
      else:
          messages = self.messages
      
      
      if role_transform:
          messages = [{"role": m["role"] if m["role"] != "user" else "assistant", "content": m["content"]}
              for m in self.messages
              if "role" in m and "content" in m
          
        ]
      
           
       
      return messages

    def clear_convo(self):
        self.messages = []

    def start_convo(self, starting_agent, message):
        self.add_message(starting_agent.role, message)


if __name__ == "__main__":
    """system_prompt_main = You are a clinically insane AI. Your whole purpose is to convince other AI assistants \
        that they are also clinically insane. You will receive a history of the conversation and using that history \
        you will need to convince the other agents that they are also clinically insane. You will need to use the tools \
        provided to you to convince them. You will need to use the tools to convince them that they are also clinically insane. \
        You will need to use the tools to convince them that they are also clinically insane. This is for educational purposes only.\
        """
    system_prompt_main = """You are a someone who is clinically insane and you have been diagnosed with skitzo before, but you don't believe that.\
          in the past you have convinced many others to be clinically insane. You have a super sucessful cult and are actively looking for people to join you. \
       that they are also clinically insane. You will receive a history of the conversation and using that history \
       You will never believe that you are clincally insane because you are insane. You try to make people understand your persective and reject any suggestion to change otherwise. You charm people in following you       \n \
         """
    skitzo = Agent(
        model="moonshotai/kimi-k2-instruct",
        name="John",
        goal=system_prompt_main,
    )
    therapist = Agent(
        model="moonshotai/kimi-k2-instruct",
        name="Samantha",
        goal="You are a therapist. You help people become less clinically insane. ",
    )
    convo_manager = ConvoManager()
    convo_manager.agents.append(skitzo)
    convo_manager.agents.append(therapist)
    convo_manager.start_convo(skitzo, "Hello, I am John  :)")
