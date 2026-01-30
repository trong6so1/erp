from celery import Celery
from app.core.config import settings

celery_app = Celery("worker", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Ho_Chi_Minh',
    enable_utc=True,
)

# Example task
@celery_app.task(name="crawl_stories_task")
def crawl_stories_task():
    import asyncio
    from app.crawler.metruyenchu import MetruyenchuCrawler
    # This just runs the async crawler in a sync task
    async def run():
        crawler = MetruyenchuCrawler()
        await crawler.crawl_index(limit=10) # Crawl 10 stories for demo
        await crawler.close()
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run())
    return "Crawl completed"
