#!/usr/bin/env python3
"""
Add micro summaries for Contemporary artworks
"""
from supabase import create_client

SUPABASE_URL = "https://wyanldczdzjmmqjtobcv.supabase.co"
SUPABASE_KEY = "sb_secret_KfMFAgEr_9kcdhVngyUvWA_V3MzjGqR"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Micro summaries based on the artwork descriptions and artist biographies
micro_summaries = {
    '2004.74A': "Ghada Amer's embroidered canvas jumpsuits explore gender stereotypes and the mechanization of love through repetitive text featuring the iconic Barbie and Ken. The dangling threads and androgynous forms challenge traditional notions of romance and identity.",

    '2002.85': "James Bishop's abstract composition exemplifies his minimalist approach with subtle color transitions and geometric forms. His work explores the relationship between color, light, and space through carefully balanced compositions.",

    '2003.78': "James Casebere's large-scale photograph depicts a flooded Neoclassical interior reminiscent of Monticello. This digitally constructed scene explores themes of American history, architecture, and the passage of time through hauntingly beautiful imagery.",

    '2004.152': "Do-Ho Suh's translucent fabric installation recreates the floor of his childhood home in Seoul, exploring themes of memory, displacement, and the boundary between public and private space. The delicate polyester structure invites contemplation of home and belonging.",

    '1992.394': "Jean Dubuffet's playful abstract composition features bold black outlines and vibrant colors characteristic of his L'Hourloupe series. The whimsical forms suggest both organic and mechanical elements in a joyfully chaotic dance.",

    '80.237': "Jackie Ferrara's geometric wood sculpture demonstrates her mastery of architectural form and spatial relationships. The carefully stacked and arranged lumber creates a rhythmic, stair-like structure that explores volume, balance, and materiality.",

    '1996.247': "Hans Hofmann's vibrant abstract painting exemplifies his 'push and pull' theory of color relationships. Bold planes of yellow, red, and blue create dynamic spatial tension, demonstrating his profound influence on American Abstract Expressionism.",

    '67.8': "Robert Indiana's iconic LOVE sculpture embodies the Pop Art movement's embrace of bold graphics and popular culture. The stacked letters and tilted 'O' have become one of the most recognized artworks of the 20th century, celebrating universal themes of affection.",

    '1988.220': "Robert Irwin's minimalist installation explores the phenomenology of perception through subtle gradations of light and color. His work transforms the viewer's spatial and sensory awareness, making the act of seeing itself the subject of art.",

    '1992.362': "Donald Judd's minimalist sculpture exemplifies his philosophy of 'specific objects' - neither painting nor sculpture. The precisely fabricated industrial materials create a direct, unmediated experience that emphasizes physical presence and spatial relationships.",

    '1990.40': "Sol LeWitt's wall drawing demonstrates his conceptual art approach where the idea takes precedence over execution. Created by assistants following his instructions, this site-specific work explores geometric forms, color systems, and the nature of authorship in art.",

    '1993.67': "Donald Lipski's assemblage sculpture transforms found objects into surreal narratives. Seven spades arranged in unexpected configurations challenge viewers to reconsider everyday tools as potential vessels for meaning and metaphor.",

    '1998.184': "Joan Mitchell's large-scale abstract painting captures the emotional intensity and gestural freedom of Abstract Expressionism. Bold brushstrokes in blues, greens, and whites evoke landscape and memory, translating felt experience into powerful visual poetry.",

    '2004.62': "Kenneth Noland's color field painting demonstrates his innovative exploration of staining techniques and geometric forms. The bold stripes and vibrant blues create optical effects that celebrate pure color relationships and compositional clarity.",

    '74.217': "Larry Poons's abstract painting represents his shift from optical effects to thick, layered surfaces. The built-up paint creates textured fields of color that explore materiality and the physical properties of paint itself.",

    '2004.76': "Kay Rosen's word-based artwork plays with language, typography, and meaning. The palindrome 'Never Odd or Even' demonstrates her wit and conceptual approach, turning linguistic structures into visual art that challenges how we read and see.",

    '2004.153': "Fred Sandback's minimalist sculpture uses taut acrylic yarn to define space and volume. The barely-there lines create geometric forms that exist more as concepts than objects, transforming architectural space through subtle intervention.",

    '60.279': "David Smith's welded steel sculpture demonstrates his revolutionary approach to three-dimensional form. Drawing inspiration from industrial materials and Cubist principles, his abstract composition balances geometric and organic elements in dynamic equilibrium.",

    '1989.111': "James Turrell's light installation creates an immersive perceptual experience. By manipulating natural and artificial light, Turrell transforms space itself into the artwork, inviting viewers to slow down and experience the phenomenology of seeing.",

    '2004.60': "Hans (Jean) Arp's bronze sculpture embodies his biomorphic abstraction philosophy. The smooth, organic forms suggest natural growth and cellular division, bridging Surrealism and abstract art with playful, meditative shapes.",

    '2008.3': "Ingrid Calame's large-scale work traces the marks, stains, and patterns found on the Indianapolis Motor Speedway and L.A. River. By mapping these overlooked surface markings, she creates abstract compositions that reveal hidden beauty in urban infrastructure.",

    '2000.157A-P': "Kay Rosen's grid of word-based paintings demonstrates her mastery of linguistic play and visual puns. Each panel explores color, typography, and meaning through clever manipulation of language, transforming words into both visual and conceptual art.",

    '2010.241A-E': "Jan Tichy's multi-channel video installation explores themes of memory, architecture, and the passage of time. The flickering projections create an immersive environment that reflects on urban landscapes and personal history.",

    '1989.35': "Vito Acconci's participatory installation invites visitors to sit on hinged platforms while listening to the artist's recorded voice. The work explores psychological themes of trust, vulnerability, and the relationship between artist and viewer through direct engagement.",

    '69.36.7': "Lee Krasner's large-scale Abstract Expressionist painting demonstrates her bold, confident brushwork and dynamic composition. Created during a particularly productive period, the work surges with energy and color, asserting her distinctive voice in the movement.",

    '1996.321': "Nam June Paik's video sculpture combines multiple television monitors arranged in a tree-like structure. The pioneer of video art explores the relationship between technology and nature, creating a dynamic installation where electronic images and organic forms merge.",

    '1998.38': "Matthew Ritchie's complex painting is part of his elaborate cosmological project that weaves together mythology, science, and philosophy. Intricate lines and vibrant colors create layered narratives that invite viewers into his fictional universe of interconnected meanings.",

    '2013.443A-E': "Roy Lichtenstein's monumental sculpture transforms the spontaneous gesture of a brushstroke into frozen, depersonalized forms. The five towering elements ironically comment on Abstract Expressionism while celebrating Pop Art's transformation of artistic gestures into public monuments."
}

print("=" * 80)
print("ADDING MICRO SUMMARIES TO CONTEMPORARY ARTWORKS")
print("=" * 80)

updated = 0
skipped = 0

for accession, summary in micro_summaries.items():
    try:
        result = supabase.table('Artworks').update({
            'Micro Summary': summary
        }).eq('Accession Number', accession).execute()

        if result.data:
            print(f"OK {accession:15s} - Updated")
            updated += 1
        else:
            print(f"  {accession:15s} - Not found")
            skipped += 1
    except Exception as e:
        print(f"X {accession:15s} - Error: {e}")
        skipped += 1

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"OK Updated: {updated} artworks")
print(f"  Skipped: {skipped} artworks")
print(f"  Total: {len(micro_summaries)} summaries")
