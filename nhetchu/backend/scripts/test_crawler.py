import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.crawler.metruyenchu import MetruyenchuCrawler

async def main():
    print("Testing Crawler...")
    crawler = MetruyenchuCrawler()
    
    # Test getting HTML simply
    print(f"Fetching {crawler.base_url}...")
    soup = await crawler.get_html(crawler.base_url)
    
    if soup:
        print("Successfully fetched homepage!")
        print(f"Title: {soup.title.string if soup.title else 'No title'}")
        
        # Try to find some stories (matching the new selector)
        stories = soup.select('div.flex.space-x-3.pb-6.border-b.border-auto')
        print(f"Found {len(stories)} potential stories on homepage.")
        for el in stories[:5]:
             # Simple logic to find title link for display
            links = el.select('a')
            for s in links:
                 if s.text and len(s.text.strip()) > 3:
                    print(f"- {s.text.strip()} ({s.get('href')})")
                    break
    else:
        print("Failed to fetch homepage.")
    
    await crawler.close()

if __name__ == "__main__":
    asyncio.run(main())
