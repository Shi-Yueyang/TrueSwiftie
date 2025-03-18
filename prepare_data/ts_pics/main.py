import os
import requests
import json
import sqlite3
from config import load_config
from db import create_db_connection, create_table
from image_utils import calculate_image_hash
from downloader import download_image
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import time

def fetch_image_urls(query, api_key, cse_id, num=10, max_retries=3, delay=1):
    search_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "cx": cse_id,
        "key": api_key,
        "searchType": "image",
        "num": num
    }

    retry_strategy = Retry(
        total=max_retries,
        status_forcelist=[429, 500, 502, 503, 504],
        backoff_factor=1
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    http = requests.Session()
    http.mount("https://", adapter)
    http.mount("http://", adapter)

    try:
        response = http.get(search_url, params=params)
        response.raise_for_status()
        results = response.json()
        img_urls = [item['link'] for item in results.get('items', [])]
        time.sleep(delay)  # Add rate limiting delay
        return img_urls
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return []

def main():
    config = load_config()

    topics = config['topics']
    num_images = config['num_images']
    dest_folder = config['destination_folder']
    api_key = config['api_key']
    cse_id = config['cse_id']
    max_retries = config['max_retries']
    delay = config['delay']

    # Database connection
    conn = create_db_connection('images.db')
    if conn is not None:
        create_table(conn)
    else:
        print("Error! cannot create the database connection.")
        return

    for topic in topics:
        topic_folder = os.path.join(dest_folder, topic)
        img_urls = fetch_image_urls(topic, api_key, cse_id, num=num_images, max_retries=max_retries, delay=delay)
        for url in img_urls:
            if url.endswith('.jpg') or url.endswith('.png'):
                image_name = os.path.basename(url)
                image_path = download_image(url, topic_folder, image_name)

                if image_path:
                    image_hash_str = calculate_image_hash(image_path)

                    if image_hash_str:
                        # Check if the image hash already exists in the database
                        cur = conn.cursor()
                        cur.execute("SELECT id FROM images WHERE image_hash=? AND topic=?", (image_hash_str, topic))
                        existing_image = cur.fetchone()

                        if existing_image:
                            print(f"Image with hash {image_hash_str} already exists in the database. Skipping.")
                            os.remove(image_path)  # Remove the downloaded image
                        else:
                            # Insert the image information into the database
                            sql = """
                                INSERT INTO images(topic, image_hash, image_path, url)
                                VALUES(?,?,?,?)
                            """
                            cur = conn.cursor()
                            cur.execute(sql, (topic, image_hash_str, image_path, url))
                            conn.commit()
                            print(f"Inserted image with hash {image_hash_str} into the database.")
                    else:
                        os.remove(image_path)  # Remove the downloaded image if hash calculation failed

    if conn:
        conn.close()

if __name__ == "__main__":
    main()