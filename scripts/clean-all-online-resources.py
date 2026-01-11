#!/usr/bin/env python3
"""
Clean Online Resources across all collections
Keep only: Google Arts & Culture and Archive.org
Remove: MoMA, Guggenheim, Tate, Smithsonian, Getty, etc.
"""
from supabase import create_client
import json

SUPABASE_URL = "https://wyanldczdzjmmqjtobcv.supabase.co"
SUPABASE_KEY = "sb_secret_KfMFAgEr_9kcdhVngyUvWA_V3MzjGqR"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 80)
print("CLEANING ONLINE RESOURCES - ALL COLLECTIONS")
print("=" * 80)
print("Keeping only: Google Arts & Culture and Archive.org")
print("Removing: Museum links that may be broken\n")

# Get all artworks with Online Resources
result = supabase.table('Artworks').select(
    'ID, "Accession Number", Title, Collection, "Online Resources"'
).execute()

artworks = result.data
print(f"Total artworks in database: {len(artworks)}")

updated = 0
removed_completely = 0
unchanged = 0

for artwork in artworks:
    resources = artwork.get('Online Resources')

    if not resources:
        continue

    # Filter to keep only Google Arts & Culture and Archive.org
    filtered = [
        r for r in resources
        if 'artsandculture.google.com' in r.get('url', '') or
           'archive.org' in r.get('url', '')
    ]

    # If nothing left, set to empty array
    if len(filtered) == 0 and len(resources) > 0:
        # Remove all resources
        try:
            supabase.table('Artworks').update({
                'Online Resources': []
            }).eq('ID', artwork['ID']).execute()
            print(f"  Removed all resources: {artwork['Accession Number']:15s} - {artwork['Title'][:50]}")
            removed_completely += 1
        except Exception as e:
            print(f"X Error: {artwork['Accession Number']}: {e}")

    elif len(filtered) < len(resources):
        # Update with filtered list
        try:
            supabase.table('Artworks').update({
                'Online Resources': filtered
            }).eq('ID', artwork['ID']).execute()
            print(f"OK Filtered: {artwork['Accession Number']:15s} - {len(resources)} -> {len(filtered)} resources")
            updated += 1
        except Exception as e:
            print(f"X Error: {artwork['Accession Number']}: {e}")
    else:
        unchanged += 1

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Updated (filtered): {updated} artworks")
print(f"Removed completely: {removed_completely} artworks")
print(f"Unchanged (already clean): {unchanged} artworks")
print(f"Total processed: {updated + removed_completely + unchanged}")
