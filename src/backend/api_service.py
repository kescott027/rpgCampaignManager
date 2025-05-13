from fastapi import FastAPI
from .api_drive_routes import router as drive_router
from .api_localstore_routes import router as file_router
from .api_gpt_routes import router as gpt_router
from .api_obs_routes import router as obs_router
from .api_security_routes import router as security_router
# from .api_oauth_routes import router as oauth_router
# from .api_config_routes import router as config_router

app = FastAPI()
app.include_router(gpt_router)
app.include_router(drive_router)
app.include_router(security_router)
app.include_router(file_router)
# app.include_router(oauth_router)
# app.include_router(config_router)
