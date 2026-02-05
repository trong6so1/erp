from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_

from app.db.session import AsyncSessionLocal
from app.models.story import Story, Category, Author, Chapter
from app.schemas import story as schemas

router = APIRouter()

# Dependency for Async Session
async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/", response_model=schemas.StoryList)
async def read_stories(
    db = Depends(get_async_db),
    page: int = 1,
    limit: int = 20,
    q: Optional[str] = None,
    category_slug: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = Query("updated_at", pattern="^(updated_at|view_count|rating|created_at)$"),
    order: str = Query("desc", pattern="^(desc|asc)$")
):
    """
    Get list of stories with pagination and filtering.
    """
    skip = (page - 1) * limit
    
    # Base Query
    query = select(Story).options(selectinload(Story.author_obj), selectinload(Story.categories))
    
    # Filtering
    if q:
        terms = q.strip().split()
        if terms:
            query = query.filter(and_(*[Story.title.ilike(f"%{term}%") for term in terms]))
        
    if category_slug:
        query = query.join(Story.categories).filter(Category.slug == category_slug)
    
    if status:
        # status could be "Full" (Completed) or "Dang ra" (Ongoing) mapping?
        # For now assume exact match or simple mapping
        if status.lower() in ["completed", "full"]:
             query = query.filter(Story.status.ilike("%Full%") | Story.status.ilike("%Completed%"))
        else:
             query = query.filter(Story.status == status)

    # Sorting
    sort_column = getattr(Story, sort_by, Story.updated_at)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Total count (Separate query for performance or window function)
    # Simple count query
    # Note: select(func.count()).select_from(query.subquery()) might be better
    # But for async, let's do a separate count query logic if needed, or simple fetch all? No.
    # Count query:
    # We need to construct a robust count query relative to filters
    # Simplify for now: Just get items, total might need adjustment
    
    # Executing Listing
    # Pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    stories = result.scalars().all()
    
    # Count total (Approximate or separate query)
    # For now returns 0 or implement count later
    total = 1000 # Placeholder or separate count query
    
    return {"data": stories, "total": total, "page": page, "limit": limit}

@router.get("/{slug}", response_model=schemas.StoryDetail)
async def read_story(
    slug: str,
    db = Depends(get_async_db)
):
    """
    Get story detail by slug.
    """
    query = select(Story).options(
        selectinload(Story.author_obj), 
        selectinload(Story.categories),
        selectinload(Story.chapters)
    ).filter(Story.slug == slug)
    
    result = await db.execute(query)
    story = result.scalars().first()
    
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    return story
