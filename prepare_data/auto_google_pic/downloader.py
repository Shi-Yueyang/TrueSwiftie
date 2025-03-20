import os
from urllib.request import urlretrieve

def download_image(url, dest_folder, image_name):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)
    try:
        # Sanitize the image name
        img_path = os.path.join(dest_folder, image_name)
        urlretrieve(url, img_path)
        print(f"Downloaded {img_path}")
        return img_path
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None