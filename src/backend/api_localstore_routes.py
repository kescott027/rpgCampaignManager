import os
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional, List, Iterator, cast


BASE_DIR = os.path.abspath("../../assets/my_campaigns")

router = APIRouter()


@router.get("/api/localstore/list-dir")
def list_dir(path: str = Query(default=BASE_DIR)):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "Path not found"})

        items = []

        entries = cast(Iterator[os.DirEntry], os.scandir(abs_path))
        for entry in entries:
            items.append(
                {"name": entry.name, "type": "directory" if entry.is_dir() else "file"}
            )
        return {"path": abs_path, "items": items}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@router.get("/api/localstore/load-file")
def load_file(path: str):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "File not found"})

        ext = os.path.splitext(abs_path)[1].lower()
        if ext in [".md", ".txt", ".log"]:
            with open(abs_path, "r", encoding="utf-8") as f:
                return {"content": f.read(), "type": "text"}
        elif ext == ".json":
            with open(abs_path, "r", encoding="utf-8") as f:
                return {"content": f.read(), "type": "json"}
        elif ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            return {"content": "", "type": "image"}
        else:
            return {"content": "[Unsupported file type]", "type": "text"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@router.get("/api/localstore/load-image")
def load_image(path: str):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "Image not found"})
        return FileResponse(abs_path)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


