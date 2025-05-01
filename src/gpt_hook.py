from fastapi import FastAPI, Request
from gpt_proxy import GPTProxy

app = FastAPI()
proxy = GPTProxy()


@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    response = proxy.send(message)
    return {"response": response}
