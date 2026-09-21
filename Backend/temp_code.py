import cv2
import numpy as np
import matplotlib.pyplot as plt

# --- For Grayscale Images ---
def plot_grayscale_histogram(image_path):
    """
    Reads a grayscale image, calculates its histogram, and plots it.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        print(f"Error: Could not load image at {image_path}")
        return

    # Calculate histogram using OpenCV's calcHist
    # Parameters:
    # - images: source image (must be in a list, e.g., [img])
    # - channels: index of the channel (for grayscale, it's [0])
    # - mask: None for full image histogram; provide a mask for a specific region
    # - histSize: number of bins (e.g., [256] for 0-255 intensity values)
    # - ranges: pixel value range (e.g., [0, 256] for 0 to 255)
    hist = cv2.calcHist([img], [0], None, [256], [0, 256])

    plt.figure(figsize=(8, 5))
    plt.plot(hist, color='gray')
    plt.title(f'Grayscale Histogram of {image_path.split("/")[-1]}')
    plt.xlabel('Pixel Intensity')
    plt.ylabel('Number of Pixels')
    plt.xlim([0, 256])
    plt.grid(True)
    plt.show()

    # Alternative way using Matplotlib's hist function
    plt.figure(figsize=(8, 5))
    plt.hist(img.ravel(), 256, [0, 256], color='gray')
    plt.title(f'Grayscale Histogram (Matplotlib) of {image_path.split("/")[-1]}')
    plt.xlabel('Pixel Intensity')
    plt.ylabel('Number of Pixels')
    plt.xlim([0, 256])
    plt.grid(True)
    plt.show()

# --- For Color Images ---
def plot_color_histogram(image_path):
    """
    Reads a color image, calculates histograms for each channel (B, G, R), and plots them.
    """
    img = cv2.imread(image_path)

    if img is None:
        print(f"Error: Could not load image at {image_path}")
        return

    # Split the image into its B, G, R channels
    channels = cv2.split(img)
    colors = ("b", "g", "r") # OpenCV reads images as BGR by default

    plt.figure(figsize=(10, 6))
    plt.title(f'Color Histogram of {image_path.split("/")[-1]}')
    plt.xlabel('Pixel Intensity')
    plt.ylabel('Number of Pixels')

    for (channel, color) in zip(channels, colors):
        hist = cv2.calcHist([channel], [0], None, [256], [0, 256])
        plt.plot(hist, color=color, label=f'{color.upper()} Channel')

    plt.xlim([0, 256])
    plt.grid(True)
    plt.legend()
    plt.show()

# --- Usage Example ---
if __name__ == "__main__":
    # Create a dummy image for demonstration (replace with your image path)
    # You can save this as 'test_image_gray.png' and 'test_image_color.png'
    dummy_gray_image = np.random.randint(0, 256, (100, 100), dtype=np.uint8)
    cv2.imwrite('test_image_gray.png', dummy_gray_image)

    dummy_color_image = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    cv2.imwrite('test_image_color.png', dummy_color_image)

    print("Generating grayscale histogram:")
    plot_grayscale_histogram('test_image_gray.png')

    print("\nGenerating color histogram:")
    plot_color_histogram('test_image_color.png')

    # Example with a common image (make sure you have one, e.g., 'cameraman.tif')
    # If you have an image file named 'example.jpg' in the same directory:
    # print("\nGenerating histogram for 'example.jpg':")
    # plot_grayscale_histogram('example.jpg')
    # plot_color_histogram('example.jpg')