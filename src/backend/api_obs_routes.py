import os
import json
from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse
from pathlib import Path


router = APIRouter()
