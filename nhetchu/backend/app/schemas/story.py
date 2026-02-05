from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- Shared ---
class AuthorBase(BaseModel):
    name: str

class Author(AuthorBase):
    id: int
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    slug: str

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# --- Story ---
class StoryBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    status: str = "ongoing"
    
class Story(StoryBase):
    id: int
    view_count: int
    vote_count: int
    word_count: int
    chapter_count: int
    rating: float
    updated_at: datetime
    
    author_obj: Optional[Author] = None
    categories: List[Category] = []

    class Config:
        from_attributes = True

class StoryDetail(Story):
    # Field cho detail nếu cần thêm
    pass

class StoryList(BaseModel):
    data: List[Story]
    total: int
    page: int
    limit: int
