from fastapi import APIRouter

from .routes import campaigns, health, metadata

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(metadata.router)
api_router.include_router(campaigns.router)
