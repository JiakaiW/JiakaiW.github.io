import os
from PIL import Image

def compress_images(directory, quality=80):
    """
    Recursively finds and compresses all PNG, JPG, and JPEG images in a directory.

    Args:
        directory (str): The root directory to start scanning from.
        quality (int): The compression quality (1-100), default is 80.
    """
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                try:
                    with Image.open(file_path) as img:
                        # Convert RGBA to RGB for JPEG to avoid errors
                        if img.mode in ('RGBA', 'P') and file.lower().endswith(('.jpg', '.jpeg')):
                            img = img.convert('RGB')
                        
                        original_size = os.path.getsize(file_path)
                        
                        # Save with optimization and quality settings
                        img.save(file_path, optimize=True, quality=quality)
                        
                        compressed_size = os.path.getsize(file_path)
                        
                        reduction = original_size - compressed_size
                        reduction_percent = (reduction / original_size * 100) if original_size > 0 else 0
                        
                        if reduction > 0:
                            print(f"Compressed: {file_path}")
                            print(f"  -> Reduced by {reduction / 1024:.2f} KB ({reduction_percent:.2f}%)")
                        else:
                            print(f"Skipped (already optimal): {file_path}")

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    # Get the directory of the script and use it as the root for scanning
    repo_path = os.path.dirname(os.path.abspath(__file__))
    print(f"Scanning for images in: {repo_path}")
    compress_images(repo_path)
    print("\nImage compression scan complete.") 