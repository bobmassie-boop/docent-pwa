#!/usr/bin/env python3
"""
Extract individual core badges from the combined image
"""
from PIL import Image
import os

# Source image
source = "A:/docent-pwa/public/core-badges.png"
output_dir = "A:/docent-pwa/public/images/badges"

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Load the source image
img = Image.open(source)
width, height = img.size
print(f"Source image size: {width}x{height}")

# Badge positions based on 1536x1024 image
# Layout appears to be 3 columns x 3 rows with padding

badges = {
    'american-core.png': (30, 20, 490, 310),           # Top left - American flag
    'african-core.png': (530, 330, 1010, 620),         # Middle - African spears/shield
    'asian-core.png': (1050, 20, 1520, 310),           # Top right - Asian pagoda
    'contemporary-core.png': (30, 390, 490, 680),      # Middle left - Contemporary abstract
    'design-decorative-core.png': (530, 700, 1010, 990), # Bottom middle - Design text version
    'european-core.png': (1050, 700, 1520, 990),       # Bottom right - Corinthian columns
}

print("\nExtracting badges:")
for name, coords in badges.items():
    x1, y1, x2, y2 = coords
    badge = img.crop((x1, y1, x2, y2))
    output_path = os.path.join(output_dir, name)
    badge.save(output_path)
    print(f"  OK {name:30s} - {x2-x1}x{y2-y1} at ({x1},{y1})")

print(f"\nAll badges extracted to {output_dir}")
