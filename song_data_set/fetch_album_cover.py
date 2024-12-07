import requests
import os

album_covers ={
    'Taylor Swift':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-self-titled-billboard-1240.jpg?w=1024',
    'Fearless':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-fearless-2008-billboard-1240.jpg?w=1024' ,
    'The Taylor Swift Holiday Collection':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-the-holiday-collection-billboard-1240.jpg?w=1024',
    'Evermore': 'https://www.billboard.com/wp-content/uploads/2020/12/taylor-swift-cover-2020-billboard-1240-1607612466.jpg?w=1024',
    '1989 (Taylor\'s Version)':'https://www.billboard.com/wp-content/uploads/2023/11/Taylor-Swift-1989-Taylors-Version-2023-billboard-1240.jpg?w=1024',
    'Lover':'https://www.billboard.com/wp-content/uploads/media/Taylor-Swift-Lover-album-art-2019-billboard-1240.jpg?w=1024',
    'Red (Taylor\'s Version)':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-red-taylors-version-billboard-1240.jpg?w=1024',
    'Speak Now':'https://www.billboard.com/wp-content/uploads/2022/06/taylor-swift-speak-now-billboard-1240.jpg?w=1024',
    'Midnights':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-midnights-album-cover-2022-billboard-1240.jpg?w=1024',
    'Red':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-red-billboard-1240.jpg?w=1024',
    'The Tortured Poets Department':'https://www.billboard.com/wp-content/uploads/2024/02/The-Tortured-Poets-Department-artwork-billboard-1240.jpg?w=1024',
    'Fearless (Taylor\'s Version)':'https://www.billboard.com/wp-content/uploads/2021/04/Taylor-Swift-fearless-album-art-cr-Beth-Garrabrant-billboard-1240-1617974663.jpg?w=1024',
    'Folklore':'https://www.billboard.com/wp-content/uploads/2020/12/Taylor-swift-folklore-cover-billboard-1240-1607121703.jpg?w=1024',
    'Speak Now (Taylor\'s Version)':'https://www.billboard.com/wp-content/uploads/2023/05/Speak-Now-Taylors-Version-billboard-1240.jpg?w=1024',
    '1989':'https://www.billboard.com/wp-content/uploads/2015/06/taylor-swift-1989-album-billboard-1548.jpg?w=1024',
    'Reputation':'https://www.billboard.com/wp-content/uploads/2022/10/taylor-swift-reputation-billboard-1240.jpg?w=1240'
}

def fetch_and_save_images(album_covers):
    if not os.path.exists('album_covers'):
        os.makedirs('album_covers')
    
    for album, url in album_covers.items():
        response = requests.get(url)
        if response.status_code == 200:
            image_path = os.path.join('album_covers', f"{album}.jpg")
            with open(image_path, 'wb') as file:
                file.write(response.content)
            print(f"Saved {album} cover to {image_path}")
        else:
            print(f"Failed to fetch {album} cover from {url}")

fetch_and_save_images(album_covers)