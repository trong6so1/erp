from app.crawler.base import BaseCrawler
from bs4 import BeautifulSoup
import re

class ExampleCrawler(BaseCrawler):
    """
    Ví dụ Crawler cho một trang truyện giả định (hoặc generic structure).
    Bạn cần điều chỉnh CSS Selectors dựa trên website thực tế bạn muốn crawl.
    """
    
    async def parse_story_list(self, html: BeautifulSoup) -> list:
        stories = []
        # Ví dụ: selector cho danh sách truyện
        # Thay đổi '.story-item' thành class thực tế của web nguồn
        for item in html.select('.story-item'):
            title_el = item.select_one('.title a')
            if title_el:
                link = title_el.get('href')
                if not link.startswith('http'):
                    link = f"{self.base_url}{link}"
                
                stories.append({
                    "title": title_el.text.strip(),
                    "url": link,
                    "cover": item.select_one('img')['src'] if item.select_one('img') else None
                })
        return stories

    async def parse_story_detail(self, html: BeautifulSoup) -> dict:
        # Ví dụ selector chi tiết
        title = html.select_one('h1.title').text.strip() if html.select_one('h1.title') else "Unknown"
        description = html.select_one('.desc-text').text.strip() if html.select_one('.desc-text') else ""
        author = html.select_one('.author').text.strip() if html.select_one('.author') else "Unknown"
        
        return {
            "title": title,
            "description": description,
            "author": author,
            "status": "Ongoing"
        }

    async def parse_chapter_content(self, html: BeautifulSoup) -> str:
        # Ví dụ selector nội dung
        content_div = html.select_one('#chapter-content')
        if content_div:
            # Xóa script/quảng cáo nếu cần
            for script in content_div(["script", "style"]):
                script.decompose()
            return content_div.get_text("\n")
        return ""
