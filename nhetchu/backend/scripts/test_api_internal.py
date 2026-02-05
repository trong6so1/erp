import httpx
import asyncio
import sys
import os

# Add backend to path logic if needed, but we connect via http
# sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

async def main():
    # Inside container, standard port is 8000
    url = "http://localhost:8000/api/v1/stories"
    print(f"Testing {url}...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Total: {data.get('total')}")
                print(f"Items: {len(data.get('data', []))}")
                if data.get('data'):
                    print("Sample Story:", data['data'][0]['title'])
            else:
                print(response.text)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
