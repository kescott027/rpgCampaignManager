import os
import json
from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse
from pathlib import Path
from src.backend.drive_utils import search_google_drive, list_folder_contents, read_text_file
from src.backend.account_security import secure_path

router = APIRouter()

client = OpenAI()

