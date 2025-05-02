import os
import openai
import json
from dotenv import load_dotenv
from datetime import datetime

# === Load API Key from .env ===
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# === System prompt for GPT persona ===
DEFAULT_SYSTEM_PROMPT = """
You are CampaignGPT, a specialized AI assistant for Game Masters.
You use narrative tools like ENTITY INDEX, STATUS INDEX, and RELATIONSHIP INDEX.
Always format world references using square brackets, e.g., [Colby Jackson].
You do not reveal GM Only content unless specifically instructed in GM Mode.
Keep responses structured and concise unless told otherwise.
"""

class GPTProxy:
    def __init__(self, system_prompt=DEFAULT_SYSTEM_PROMPT):
        self.system_prompt = system_prompt
        self.history = [{"role": "system", "content": self.system_prompt}]

    def send(self, user_message: str, temperature: float = 0.7, tools: list = None):
        self.history.append({"role": "user", "content": user_message})
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=self.history,
                temperature=temperature,
                tools=tools or [],
            )
            reply = response['choices'][0]['message']['content']
            self.history.append({"role": "assistant", "content": reply})
            return reply
        except openai.error.OpenAIError as e:
            return f"[GPT Error] {str(e)}"

    def reset_session(self):
        self.history = [{"role": "system", "content": self.system_prompt}]

    def inject_context(self, context_blocks: list):
        """Add context references from your index set manually."""
        for block in context_blocks:
            self.history.append({"role": "system", "content": f"[Context Block]: {block}"})

    def save_log(self, path="chatlog.json"):
        with open(path, 'w') as f:
            json.dump(self.history, f, indent=2)

    def load_history(self, path="chatlog.json"):
        if os.path.exists(path):
            with open(path, 'r') as f:
                self.history = json.load(f)

# === Example usage ===
if __name__ == "__main__":
    agent = GPTProxy()
    agent.inject_context([
        "Entity: Colby Jackson, a Level 3 Halfling rogue from The Warrens.",
        "Relationship: Colby fled from [Grundvollr] after stealing from the [Forgesworn]."
    ])
    reply = agent.send("Who is Colby and why did he flee Grundvollr?")
    print("🧠 GPT:", reply)
