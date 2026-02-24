from fastapi import APIRouter

from app.api.v1 import health, sound

api_router = APIRouter(prefix="/v1")
api_router.include_router(health.router)
api_router.include_router(sound.router)
