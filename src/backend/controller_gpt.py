import os
import openai
import json
from dotenv import load_dotenv
from datetime import datetime
from typing import List
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    session_name: Optional[str] = None
    tags: Optional[List[str]] = []


class GPTProxy:
    def __init__(self, config_file=None):

        self.config_file = config_file

        if not os.getenv("OPENAI_API_KEY"):
            path_components = [self.project_root(), ".security", "openai.env"]

            # key_path = os.path.join(*path_components)
            # openai.api_key = json.loads(key_path)["OPENAI_API_KEY"]
            # openai.api_key = os.getenv("OPENAI_API_KEY")
            load_dotenv(os.path.join(*path_components))
            # load_dotenv(dotenv_path=key_path)

        openai.api_key = os.getenv("OPENAI_API_KEY")

        if not openai.api_key:
            raise ValueError(
                f"❌ OPENAI_API_KEY is missing. Path attempted: {env_path}"
            )

        self.system_prompt = """
            You are CampaignGPT, a specialized AI assistant for Game Masters.
            You use narrative tools like ENTITY INDEX, STATUS INDEX, and RELATIONSHIP INDEX.
            Always format world references using square brackets, e.g., [Colby Jackson].
            You do not reveal GM Only content unless specifically instructed in GM Mode.
            Keep responses structured and concise unless told otherwise.
            """

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

            reply = response["choices"][0]["message"]["content"]
            self.history.append({"role": "assistant", "content": reply})
            return reply
        except openai.error.OpenAIError as e:  # noqa
            return f"[GPT Error] {str(e)}"

    def reset_session(self):
        self.history = [{"role": "system", "content": self.system_prompt}]

    def inject_context(self, context_blocks: list):
        """Add context references from your index set manually."""
        for block in context_blocks:
            self.history.append(
                {"role": "system", "content": f"[Context Block]: {block}"}
            )

    @staticmethod
    def project_root():
        """
        Finds the project root directory.

        It checks for project markers like .git, pyproject.toml, or setup.py
        by traversing up the directory tree from the current file's location.
        """
        current_dir = os.path.dirname(os.path.abspath(__file__))
        while True:
            if any(
                os.path.exists(os.path.join(current_dir, marker))
                for marker in [".git", "pyproject.toml", "setup.py"]
            ):
                return current_dir
            parent_dir = os.path.dirname(current_dir)
            if parent_dir == current_dir:
                raise FileNotFoundError("Project root not found.")
            current_dir = parent_dir

    def save_log(self, path=None):
        if not path:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            path = f"chatlogs/session-{timestamp}.json"

        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w") as f:
            json.dump(self.history, f, indent=2)

    def load_history(self, path="chatlog.json"):
        if os.path.exists(path):
            with open(path, "r") as f:
                self.history = json.load(f)


# === Example usage ===
if __name__ == "__main__":
    load_dotenv()
    openai.api_key = os.getenv("OPENAI_API_KEY")
    agent = GPTProxy()
    agent.inject_context(
        [
            "Entity: Colby Jackson, a Level 3 Ysoki Inventor from The Warrens.",
            "Relationship: Colby fled from [Grundvollr] after the [Forgesworn] were "
            "denounced as heretics",
        ]
    )
    gpt_reply = agent.send("Who is Colby and why did he flee Grundvollr?")
    print("🧠 GPT:", gpt_reply)
