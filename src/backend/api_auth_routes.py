# api_auth_routes.py
from fastapi import APIRouter, Request, Response, Depends
from controller_auth import AuthController
from fastapi.responses import JSONResponse

router = APIRouter()
auth = AuthHandler()

@router.post("/api/auth/register")
async def register(request: Request):
    payload = await request.json()
    result = auth.register_user(payload)
    return JSONResponse(content=result)

@router.post("/api/auth/login")
async def login(request: Request, response: Response):
    payload = await request.json()
    session_result = auth.login_user(payload)
    if "error" in session_result:
        return JSONResponse(status_code=401, content=session_result)

    # Set cookie with session_id
    response.set_cookie(
        key="session_id",
        value=session_result["session_id"],
        httponly=True,
        secure=False,  # Set True in production with HTTPS
        max_age=86400
    )
    return JSONResponse(content={"status": "success", "user": session_result["user"]})

@router.get("/api/auth/session")
async def get_session(request: Request):
    session_id = request.cookies.get("session_id")
    user = auth.get_user_by_session(session_id)
    if not user:
        return JSONResponse(status_code=401, content={"error": "Not authenticated"})
    return JSONResponse(content={"user": user})
