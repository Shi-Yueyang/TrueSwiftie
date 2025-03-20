import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_images(url, folder="images"):
    # Create folder if it doesn't exist
    os.makedirs(folder, exist_ok=True)

    # Get HTML content
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Find all image tags
    img_tags = soup.find_all("img")

    # Extract and download images
    for img in img_tags:
        img_url = img.get("src")
        if not img_url:
            continue

        # Convert relative URLs to absolute URLs
        img_url = urljoin(url, img_url)

        try:
            img_data = requests.get(img_url).content
            img_name = os.path.join(folder, img_url.split("/")[-1])

            with open(img_name, "wb") as img_file:
                img_file.write(img_data)
            print(f"Downloaded: {img_name}")

        except Exception as e:
            print(f"Failed to download {img_url}: {e}")

# Example usage
website_url = "https://www.pinterest.com/rainedustxo/folklore-era/"
download_images(website_url)
