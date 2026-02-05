import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.crawler.metruyenchu import MetruyenchuCrawler

from app.db.session import AsyncSessionLocal
from sqlalchemy import delete
from sqlalchemy.future import select
from app.models.story import Story, Author, Category, Chapter, story_category
from sqlalchemy.orm import selectinload

async def main():
    print("--- Bắt đầu thu thập dữ liệu (Real Crawl) ---")
    
    crawler = MetruyenchuCrawler()
    
    # Crawl 1 trang đầu (20 truyện)
    print("Đang lấy dữ liệu từ API...")
    await crawler.crawl_index(start_page=1, max_pages=1)
    await crawler.close()
    
    # Verify
    print("\n--- Kiểm tra dữ liệu trong Database ---")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Story).options(selectinload(Story.author_obj), selectinload(Story.categories)).limit(10))
        stories_list = result.scalars().all()
        
        print(f"Tổng số truyện đã crawl: {len(stories_list)}")
        for s in stories_list:
            auth_name = s.author_obj.name if s.author_obj else "None"
            cats = ", ".join([c.name for c in s.categories])
            print(f"- [ID: {s.id}] {s.title} | Aut: {auth_name} | Cat: {cats}")
            
    print("--- Hoàn tất ---")
            
    print("--- Hoàn tất ---")

if __name__ == "__main__":
    asyncio.run(main())
