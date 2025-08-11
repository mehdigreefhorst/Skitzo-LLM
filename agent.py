from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()


class convoManager:
    def __init__(self):
        self.convo = ""
        self.agents = []

    def add_message(self, name, message):
        self.convo += f"{name}: {message}\n"

    def get_convo(self):
        return self.convo

    def clear_convo(self):
        self.convo = ""

    def start_convo(self, starting_agent, message):
        self.add_message(starting_agent.name, message)
        while True:
            for i in range(len(self.agents)):
                response = self.agents[i].generate_response(self.convo)
                agent_name = self.agents[i].name
                agent_goal = self.agents[i].goal
                self.add_message(agent_name, response)
                i += 1
                if i == len(self.agents):
                    i = 0
                print(
                    f"\n######################################################################################## \
                    \n### Agent: {agent_name} \
                    \n### Goal: {agent_goal} \
                    \n### Response: {response} \
                    \n######################################################################################## \n\n"
                )


class Agent:
    def __init__(self, model, name, goal):
        self.client = Groq(api_key=os.getenv("GROQ_KEY"))
        self.name = name
        self.goal = goal
        self.model = model
        self.convo_manager = convoManager()

    def generate_response(self, message):
        self.convo_manager.add_message(self.name, message)
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.goal},
                {
                    "role": "user",
                    "content": f"{self.convo_manager.get_convo()}",
                },
            ],
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            # reasoning_effort="medium",
            stream=True,
            stop=None,
        )
        response = ""
        for chunk in completion:
            response += chunk.choices[0].delta.content or ""
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
       You will never believe that you are clincally insane because you are insane. You try to make people understand your persective and reject any suggestion to change otherwise. You charm people in following you        """
    skitzo = Agent(
        model="moonshotai/kimi-k2-instruct",
        name="John",
        goal=system_prompt_main,
    )
    therapist = Agent(
        model="moonshotai/kimi-k2-instruct",
        name="Samantha",
        goal="You are a therapist. You help people become less clinically insane.",
    )
    convo_manager = convoManager()
    convo_manager.agents.append(skitzo)
    convo_manager.agents.append(therapist)
    convo_manager.start_convo(skitzo, "Hello, I am John  :)")
