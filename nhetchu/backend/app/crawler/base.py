import httpx
from bs4 import BeautifulSoup
from typing import Optional, Any
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseCrawler:
    """
    Lớp cơ sở cho tất cả các Crawler.
    Cung cấp các phương thức chung để tải trang và xử lý lỗi.
    """
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        # Client bất đồng bộ để request nhanh hơn
        self.client = httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True)

    async def get_html(self, url: str) -> Optional[BeautifulSoup]:
        """
        Tải nội dung HTML của một URL.
        """
        try:
            logger.info(f"Crawling: {url}")
            response = await self.client.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error {e.response.status_code} requesting {url}")
            return None
        except Exception as e:
            logger.error(f"Error requesting {url}: {e}")
            return None

    async def close(self):
        """Đóng client connection."""
        await self.client.aclose()
    
    async def parse_story_list(self, html: BeautifulSoup) -> list:
        """Hàm này cần overwrite ở class con"""
        raise NotImplementedError
    
    async def parse_story_detail(self, html: BeautifulSoup) -> dict:
        """Hàm này cần overwrite ở class con"""
        raise NotImplementedError
    
    async def parse_chapter_content(self, html: BeautifulSoup) -> str:
        """Hàm này cần overwrite ở class con"""
        raise NotImplementedError
