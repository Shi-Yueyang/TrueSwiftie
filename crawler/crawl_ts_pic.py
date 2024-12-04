import os
import requests
from urllib.parse import urljoin
from urllib.request import urlretrieve

def fetch_image_urls(query, api_key, cse_id, num=10):
    search_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "cx": cse_id,
        "key": api_key,
        "searchType": "image",
        "num": num
    }
    response = requests.get(search_url, params=params)
    response.raise_for_status()
    results = response.json()
    img_urls = [item['link'] for item in results.get('items', [])]
    return img_urls

def download_images(img_urls, dest_folder):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)
    for url in img_urls:
        if url.endswith('.jpg') or url.endswith('.png'):
            try:
                img_name = os.path.join(dest_folder, os.path.basename(url))
                urlretrieve(url, img_name)
                print(f"Downloaded {img_name}")
            except Exception as e:
                print(f"Failed to download {url}: {e}")

def main():
    query = 'Taylor Swift lover era good picture'
    api_key = 'AIzaSyCJCbxHx0IAERm_ROJKuncepglq3SUMU2Y'  # Replace with your API key
    cse_id = 'e1d08201bd2c947e8'    # Replace with your Custom Search Engine ID
    dest_folder = 'taylor_swift_images'
    
    img_urls = fetch_image_urls(query, api_key, cse_id,num=100)
    download_images(img_urls, dest_folder)

if __name__ == "__main__":
    main()