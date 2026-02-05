from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionLocal
from app.models.story import Chapter, Story
from app.schemas import chapter as schemas

router = APIRouter()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/{id}", response_model=schemas.ChapterContent)
async def read_chapter(
    id: int,
    db = Depends(get_async_db)
):
    """
    Get chapter content by ID.
    """
    query = select(Chapter).options(selectinload(Chapter.story)).filter(Chapter.id == id)
    result = await db.execute(query)
    chapter = result.scalars().first()
    
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    return chapter
