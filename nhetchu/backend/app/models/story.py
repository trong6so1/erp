from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Table, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base

# Association table for Story and Category
story_category = Table(
    'story_category',
    Base.metadata,
    Column('story_id', Integer, ForeignKey('story.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('category.id'), primary_key=True)
)

class Category(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    slug = Column(String, unique=True, index=True)




class Author(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    stories = relationship("Story", back_populates="author_obj")

class Story(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    cover_image = Column(String, nullable=True)
    
    # Changed from String to ForeignKey
    author_id = Column(Integer, ForeignKey('author.id'), nullable=True)
    author_obj = relationship("Author", back_populates="stories")
    
    source_id = Column(Integer, unique=True, index=True, nullable=True) # ID from the api
    status = Column(String, default="ongoing")  # ongoing, completed
    source_url = Column(String, nullable=True)  # URL of the original story
    
    view_count = Column(Integer, default=0)
    vote_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    chapter_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chapters = relationship("Chapter", back_populates="story", cascade="all, delete-orphan")
    categories = relationship("Category", secondary=story_category, backref="stories")
class Chapter(Base):
    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey('story.id'))
    title = Column(String)
    ordering = Column(Integer, index=True)  # Chapter number/index
    content = Column(Text)
    
    published_at = Column(DateTime, default=datetime.utcnow)
    
    story = relationship("Story", back_populates="chapters")
