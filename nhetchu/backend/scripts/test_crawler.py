import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.crawler.metruyenchu import MetruyenchuCrawler

from playwright.async_api import async_playwright

async def main():
    print("Testing Crawler & Network Analysis...")
    crawler = MetruyenchuCrawler()
    
    url = f"{crawler.base_url}/danh-sach/truyen-moi"
    print(f"Navigating to {url}...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            )
        page = await context.new_page()
        # Log ALL requests to see where data comes from
        page.on("request", lambda request: print(f">> {request.method} {request.url}"))
        page.on("response", lambda response: print(f"<< {response.status} {response.url}") if "api" in response.url or "json" in response.url else None)
        
        await page.goto(url, timeout=60000)
        await page.wait_for_timeout(8000) # Wait longer for all assets
        # Wait for selector and extra time
        try:
            item_selector = 'div.flex.space-x-3'
            await page.wait_for_selector(item_selector, timeout=10000)
            await page.wait_for_timeout(3000)
            
            content = await page.content()
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            stories = soup.select('div.flex.space-x-3.border-b')
            if not stories: stories = soup.select('div.flex.space-x-3')
            
            print(f"Found {len(stories)} potential stories.")
            
            for el in stories[:2]:
                print("-" * 20)
                # print("HTML Content:")
                # print(el.prettify()[:1000]) 
                
                # Title
                title_link = el.select_one('a.text-title')
                if not title_link: 
                     for lnk in el.select('a'):
                        if lnk.get('title'):
                            title_link = lnk
                            break
                
                if title_link:
                    print(f"Title: {title_link.text.strip()}")
                    print(f"Link: {title_link.get('href')}")
                else:
                    print("Title: Not Found")
                
                # Desc
                desc_el = el.select_one('div.text-gray-500.text-overflow-multiple-lines')
                if desc_el:
                    print(f"Desc: {desc_el.text.strip()[:50]}...")
                
                # Bottom row
                bottom = el.select_one('div.flex.justify-between.items-center')
                if bottom:
                    print(f"Bottom Row Raw: '{bottom.get_text(separator='|', strip=True)}'")
                    
                    # Check Category
                    cat_el = bottom.select_one('a span.text-xs')
                    if not cat_el: cat_el = bottom.select_one('[class*="outline"]')
                    
                    if cat_el:
                        print(f"Detected Category: {cat_el.text.strip()}")
                    else:
                        print("Detected Category: None")
                        
                    # Check Author
                    auth_el = bottom.select_one('div.flex.grow-0')
                    if auth_el:
                        print(f"Detected Author: {auth_el.get_text(strip=True)}")
                    else:
                        print("Detected Author: None")
                else:
                    print("Bottom Row: Not Found")
            
        except Exception as e:
            print(f"Error: {e}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
