import cv2
import numpy as np
import os

def process_image(image_filename, output_filename="gray_image.jpg"):
    """
    Processes an image from the Downloads folder by displaying the original and grayscale versions, 
    printing image properties, and saving the grayscale image.

    Args:
        image_filename (str): The filename of the image in the Downloads folder.
        output_filename (str): The filename for the saved grayscale image.
    """
    try:
        downloads_path = os.path.join(os.path.expanduser("~"), "Downloads")
        image_path = os.path.join(downloads_path, image_filename)

        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")

        src = cv2.imread(image_path)
        if src is None:
            raise ValueError(f"Failed to load image from: {image_path}")

        # Display Original Image (Before)
        cv2.namedWindow("Original Image (Before)", cv2.WINDOW_NORMAL)
        cv2.imshow("Original Image (Before)", src)
        cv2.waitKey(0)

        gray_src = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)

        # Display Grayscale Image (After)
        cv2.namedWindow("Grayscale Image (After)", cv2.WINDOW_NORMAL)
        cv2.imshow("Grayscale Image (After)", gray_src)
        cv2.waitKey(0)

        print(f"Image path: {image_path}")
        print(f"Image rows: {gray_src.shape[0]}")
        print(f"Image cols: {gray_src.shape[1]}")
        print(f"Image pixel total: {gray_src.size}")
        print(f"Image channels: {gray_src.shape[2] if len(gray_src.shape) == 3 else 1}")
        print(f"Image pixel depth: {gray_src.dtype}")

        pixel_v = gray_src[0, 0]
        print(f"Pixel value (0, 0): {pixel_v}")

        max_val = np.max(gray_src)
        print(f"Max value: {max_val}")

        cv2.imwrite(output_filename, gray_src)
        print(f"Grayscale image saved as: {output_filename}")

    except FileNotFoundError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        cv2.destroyAllWindows()

# Example usage (replace with your image filename):
image_filename = "download.jpeg"
process_image(image_filename)