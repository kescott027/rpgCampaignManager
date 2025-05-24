from fastapi import FastAPI
import logging
from .api_drive_routes import router as drive_router
from .api_localstore_routes import router as file_router
from .api_gpt_routes import router as gpt_router
from .api_obs_routes import router as obs_router
from .api_security_routes import router as security_router
from .api_obs_routes import router as obs_router
from .api_config_routes import router as config_router
from .api_command_routes import router as command_router
from .api_character_routes import router as character_router
from .api_combat_routes import router as combat_router
from .api_display_routes import router as display_router

logging.basicConfig(level=logging.DEBUG)


app = FastAPI()
app.include_router(gpt_router)
app.include_router(drive_router)
app.include_router(security_router)
app.include_router(file_router)
app.include_router(obs_router)
app.include_router(config_router)
app.include_router(command_router)
app.include_router(character_router)
app.include_router(combat_router)
app.include_router(display_router)
