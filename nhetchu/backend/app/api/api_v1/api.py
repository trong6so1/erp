from fastapi import APIRouter
from app.api.api_v1.endpoints import stories, chapters

api_router = APIRouter()

api_router.include_router(stories.router, prefix="/stories", tags=["stories"])
api_router.include_router(chapters.router, prefix="/chapters", tags=["chapters"])

