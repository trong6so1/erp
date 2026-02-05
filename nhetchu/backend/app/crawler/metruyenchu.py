from app.crawler.base import BaseCrawler
from app.db.session import AsyncSessionLocal
from app.models.story import Story, Chapter, Category, Author
from sqlalchemy.future import select
import logging
import httpx
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class MetruyenchuCrawler(BaseCrawler):
    """
    Crawler sử dụng trực tiếp API của backend.metruyencv.com.
    """
    def __init__(self):
        super().__init__(base_url="https://metruyencv.com")
        self.api_url = "https://backend.metruyencv.com/api/books"

    async def crawl_index(self, start_page: int = 1, max_pages: int = 5):
        """
        Crawl danh sách truyện thông qua API.
        
        API Params:
        - filter[gender]=1 (Nam?), 2 (Nữ?) - Optional (using default or 1)
        - filter[state]=published
        - include=author,genres,creator
        - limit=20
        - page=X
        - sort=-new_chap_at
        """
        logger.info(f"Starting API crawl from page {start_page} to {start_page + max_pages - 1}...")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://metruyencv.com/",
            "Origin": "https://metruyencv.com"
        }

        async with httpx.AsyncClient() as client:
            for page in range(start_page, start_page + max_pages):
                params = {
                    "filter[state]": "published",
                    "include": "author,genres,creator",
                    "limit": 20,
                    "page": page,
                    "sort": "-new_chap_at"
                }
                
                logger.info(f"Fetching API Page {page}...")
                try:
                    response = await client.get(self.api_url, params=params, headers=headers, timeout=30.0)
                    response.raise_for_status()
                    data = response.json()
                    
                    items = data.get('data', [])
                    logger.info(f"Found {len(items)} items on page {page}.")
                    
                    if not items:
                        logger.warning("No items found. Stopping.")
                        break
                        
                    async with AsyncSessionLocal() as db:
                        for item in items:
                            await self._save_story_from_api(db, item)
                            
                except Exception as e:
                    logger.error(f"Error fetching page {page}: {e}")

    async def _save_story_from_api(self, db, item: Dict[str, Any]):
        try:
            source_id = item.get('id')
            title = item.get('name')
            slug = item.get('slug')
            description = item.get('synopsis', '')
            
            # Extract Cover (poster)
            poster = item.get('poster', {})
            cover_image = poster.get('default') or poster.get('600') or poster.get('300')
            if not cover_image and 'url' in poster: # fallback if structure differs
                 cover_image = poster['url']

            # Extract Author
            # API returns `author: null` often, but `creator` has user info.
            # Sometimes explicit author name is in `author` object if published officially?
            # Let's check `author` first, then `creator`.
            author_data = item.get('author')
            creator_data = item.get('creator')
            
            author_name = "Unknown"
            if author_data and author_data.get('name'):
                author_name = author_data.get('name')
            elif creator_data and creator_data.get('name'):
                author_name = creator_data.get('name')
                
            # Handle Author DB
            stmt_auth = select(Author).where(Author.name == author_name)
            author_obj = (await db.execute(stmt_auth)).scalars().first()
            if not author_obj:
                author_obj = Author(name=author_name)
                db.add(author_obj)
                await db.flush()

            # Handle Categories (genres)
            genres = item.get('genres', [])
            category_objs = []
            for g in genres:
                cat_name = g.get('name')
                if not cat_name: continue
                
                stmt_cat = select(Category).where(Category.name == cat_name)
                existing_cat = (await db.execute(stmt_cat)).scalars().first()
                if not existing_cat:
                    existing_cat = Category(name=cat_name, slug=cat_name.lower().replace(" ", "-"))
                    db.add(existing_cat)
                    await db.flush()
                category_objs.append(existing_cat)

            # Check existing story by source_id OR title
            stmt_story = select(Story).where(Story.source_id == source_id)
            story = (await db.execute(stmt_story)).scalars().first()
            
            if not story:
                # Check by title if source_id not found (migration case)
                stmt_story_title = select(Story).where(Story.title == title)
                story = (await db.execute(stmt_story_title)).scalars().first()

            if story:
                # Update existing
                story.view_count = item.get('view_count', story.view_count)
                story.vote_count = item.get('vote_count', story.vote_count)
                story.word_count = item.get('word_count', story.word_count)
                story.chapter_count = item.get('chapter_count', story.chapter_count)
                try:
                    story.rating = float(item.get('review_score', 0))
                except:
                     pass
                story.source_id = source_id # Ensure source_id is set
                story.updated_at = datetime.utcnow() # Touch updated
                logger.debug(f"Updated story: {title}")
            else:
                # Create new
                rating_val = 0.0
                try:
                    rating_val = float(item.get('review_score', 0))
                except:
                    pass
                    
                story = Story(
                    title=title,
                    slug=slug,
                    description=description,
                    cover_image=cover_image,
                    author_id=author_obj.id,
                    status=item.get('status_name', 'Ongoing'), # "Còn tiếp"
                    source_url=item.get('link'), # API returns 'link'
                    source_id=source_id,
                    view_count=item.get('view_count', 0),
                    vote_count=item.get('vote_count', 0),
                    word_count=item.get('word_count', 0),
                    chapter_count=item.get('chapter_count', 0),
                    rating=rating_val
                )
                db.add(story)
                logger.info(f"Added new story: {title}")
            
            # Sync Categories
            # Append method checks duplication? No, need to be careful.
            # Simplest: Clear old and add new? Or just add if missing.
            # Using set math logic or just looping suitable for small lists.
            current_cat_ids = {c.id for c in story.categories}
            for cat in category_objs:
                if cat.id not in current_cat_ids:
                    story.categories.append(cat)
            
            await db.commit()
            
        except Exception as e:
            logger.error(f"Error saving story from API: {e}")
            await db.rollback()

    async def crawl_detail(self, story_id: int, url: str):
        pass
    
    async def crawl_chapter(self, chapter_id: int, url: str):
        pass
