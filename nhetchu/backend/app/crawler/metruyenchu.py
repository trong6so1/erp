from app.crawler.base import BaseCrawler
from app.db.session import AsyncSessionLocal
from app.models.story import Story, Chapter, Category
from sqlalchemy.future import select
import logging

logger = logging.getLogger(__name__)

class MetruyenchuCrawler(BaseCrawler):
    """
    Crawler thực tế cho trang mẫu (giả định cấu trúc giống Metruyenchu hoặc tương tự).
    Lưu ý: Các selector class/id có thể thay đổi theo thời gian thực tế của web nguồn.
    """
    def __init__(self):
        super().__init__(base_url="https://metruyencv.com") # Ví dụ URL

    async def crawl_index(self, limit: int = 10):
        """Crawl danh sách truyện mới nhất từ trang chủ."""
        logger.info("Starting crawl index...")
        
        # URL danh sách truyện
        url = f"{self.base_url}/danh-sach/truyen-moi"
        
        soup = await self.get_html(url)
        if not soup:
            logger.error("Failed to get index page")
            return

        # Cập nhật Selector dựa trên hình ảnh bạn cung cấp
        # Class: grid grid-cols-1 ... -> div flex space-x-3 ...
        story_elements = soup.select('div.flex.space-x-3.pb-6.border-b.border-auto')[:limit]

        async with AsyncSessionLocal() as db:
            for el in story_elements:
                try:
                    # Giả định: Thẻ a đầu tiên hoặc thẻ a có text là tên truyện
                    # Thường trong cấu trúc này, link ảnh và link tiêu đề đều dẫn về truyện
                    # Ta lấy thẻ a có chứa text (tiêu đề)
                    title_link = el.select_one('div > a') # Lấy thẻ a nằm trong div con (thường là phần text bên phải ảnh)
                    print('title', title_link)
                    # Nếu cấu trúc cụ thể hơn:
                    # title_link = el.select_one('h3 a') hoặc el.select_one('.text-lg a')
                    # Tạm thời ta scan tất cả thẻ a để tìm cái có text dài nhất (thường là tên truyện)
                    if not title_link:
                        links = el.select('a')
                        for lnk in links:
                            if lnk.text and len(lnk.text.strip()) > 3:
                                title_link = lnk
                                break
                    
                    if not title_link: continue
                    
                    link = title_link['href']
                    if not link.startswith('http'):
                        link = f"{self.base_url}{link}"
                        
                    title = title_link.text.strip()
                    
                    # Check if exists
                    exists = await db.execute(select(Story).where(Story.title == title))
                    if exists.scalar():
                        logger.info(f"Story {title} already exists. Skipping.")
                        continue

                    # Create new story placeholder
                    new_story = Story(
                        title=title,
                        source_url=link,
                        status="Ongoing",
                        view_count=0
                    )
                    db.add(new_story)
                    await db.commit()
                    logger.info(f"Added story: {title}")
                    
                except Exception as e:
                    logger.error(f"Error processing story element: {e}")
            
    async def crawl_detail(self, story_id: int, url: str):
        """Crawl chi tiết truyện và danh sách chương."""
        # TODO: Implement detail crawling based on actual site structure
        pass
    
    async def crawl_chapter(self, chapter_id: int, url: str):
        """Crawl nội dung chương."""
        # TODO: Implement chapter content crawling
        pass
