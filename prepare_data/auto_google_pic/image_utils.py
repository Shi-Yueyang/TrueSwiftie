import imagehash
from PIL import Image
import os

def crop_image(image_path,size):
    try:
        img = Image.open(image_path)
        width, height = img.size

        # Calculate aspect ratio
        aspect_ratio = width / height

        # Determine the dimensions of the crop
        if width > height:
            new_width = int(size[1] * aspect_ratio)
            new_height = size[1]
            if new_width > width:
                new_width = width
                new_height = int(width / aspect_ratio)
        else:
            new_width = size[0]
            new_height = int(size[0] / aspect_ratio)
            if new_height > height:
                new_height = height
                new_width = int(height * aspect_ratio)

        # Calculate the coordinates for the center crop
        left = (width - new_width) / 2
        top = (height - new_height) / 2
        right = (width + new_width) / 2
        bottom = (height + new_height) / 2

        # Crop the image
        img = img.crop((left, top, right, bottom))

        # Resize the image to the desired size
        img = img.resize(size)
        return img
    except Exception as e:
        print(f"Error cropping image {image_path}: {e}")
        return None

def calculate_image_hash(image_path):
    try:
        img = crop_image(image_path,size=(600,600))
        if img:
            hash = imagehash.dhash(img)
            return str(hash)
        else:
            return None
    except Exception as e:
        print(f"Error calculating hash for {image_path}: {e}")
        return None

if __name__ == '__main__':
    # Example usage
    image_path = '/home/syy/dev/TrueSwiftie/prepare_data/ts_pics/taylor_swift_images/Folklore/500e3e81a0d0267693dd597f7b9e10b23b-taylor-swift-folklore-review.jpg'  # Replace with a valid image path
    try:
        # Create a dummy image for testing
        # img = Image.new('RGB', (500, 500), color='red')
        # img.save(image_path)
        img = Image.open(image_path)

        cropped_img = crop_image(image_path,size=(800,800))
        if cropped_img:
            cropped_img.save('test_image_cropped.jpg')
            print(f"Cropped image saved to test_image_cropped.jpg")
        else:
            print("Cropping failed.")
    except FileNotFoundError:
        print(f"Error: {image_path} not found. Please make sure the image exists.")
    except Exception as e:
        print(f"Error in main: {e}")
    finally:
        # if os.path.exists(image_path):
        #     os.remove(image_path)
        pass