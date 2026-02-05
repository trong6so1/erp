from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ChapterBase(BaseModel):
    title: str
    ordering: int

class Chapter(ChapterBase):
    id: int
    story_id: int
    published_at: datetime
    
    class Config:
        from_attributes = True

class ChapterContent(Chapter):
    content: str
