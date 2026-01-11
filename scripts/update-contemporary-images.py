#!/usr/bin/env python3
"""
Update Contemporary artworks with image URLs
"""
import os
from supabase import create_client

SUPABASE_URL = "https://wyanldczdzjmmqjtobcv.supabase.co"
SUPABASE_KEY = "sb_secret_KfMFAgEr_9kcdhVngyUvWA_V3MzjGqR"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("UPDATING CONTEMPORARY ARTWORK IMAGES")
print("=" * 80)

# Get all Contemporary artworks
result = supabase.table('Artworks').select(
    'ID, "Accession Number", Title, "Image URL"'
).eq('Collection', 'Contemporary').order('ID').execute()

artworks = result.data
print(f"\nFound {len(artworks)} Contemporary artworks")

# Check what images exist
images_dir = 'public/images/contemporary'
if not os.path.exists(images_dir):
    print(f"Error: Images directory not found: {images_dir}")
    exit(1)

image_files = [f for f in os.listdir(images_dir)
               if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]

print(f"Found {len(image_files)} image files\n")

# Create map of accession -> image file
image_map = {}
for filename in image_files:
    # Extract accession from filename (before extension)
    accession = os.path.splitext(filename)[0]
    image_map[accession] = filename

print("=" * 80)
print("MATCHING AND UPDATING")
print("=" * 80)

updated = 0
skipped = 0
already_has = 0

for artwork in artworks:
    accession = artwork['Accession Number']

    # Skip if already has image
    if artwork.get('Image URL'):
        already_has += 1
        continue

    # Look for matching image
    if accession in image_map:
        image_file = image_map[accession]
        image_url = f"/images/contemporary/{image_file}"

        # Update database
        try:
            supabase.table('Artworks').update({
                'Image URL': image_url
            }).eq('ID', artwork['ID']).execute()

            print(f"OK {artwork['ID']:3d} | {accession:15s} | {artwork['Title'][:50]:50s} -> {image_file}")
            updated += 1
        except Exception as e:
            print(f"X Failed {artwork['ID']} ({accession}): {e}")
            skipped += 1
    else:
        print(f"  Skipped {artwork['ID']} ({accession}): No matching image")
        skipped += 1

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"OK Updated: {updated} artworks")
print(f"  Already had images: {already_has}")
print(f"  Skipped (no match): {skipped}")
print(f"  Total: {len(artworks)} artworks")

if skipped > 0:
    print("\nArtworks without images:")
    for artwork in artworks:
        accession = artwork['Accession Number']
        if accession not in image_map and not artwork.get('Image URL'):
            print(f"  - {accession}: {artwork['Title']}")
