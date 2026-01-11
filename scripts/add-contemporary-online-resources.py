#!/usr/bin/env python3
"""
Add curated online resources for Contemporary artworks
High-quality sources: MoMA, Guggenheim, Tate, Getty, etc.
"""
from supabase import create_client
import json

SUPABASE_URL = "https://wyanldczdzjmmqjtobcv.supabase.co"
SUPABASE_KEY = "sb_secret_KfMFAgEr_9kcdhVngyUvWA_V3MzjGqR"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Online resources organized by accession number
online_resources = {
    '2004.74A': [  # Ghada Amer
        {
            "type": "moma",
            "title": "MoMA: Ghada Amer",
            "url": "https://www.moma.org/artists/7202",
            "description": "Museum of Modern Art artist page and collection"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Ghada Amer",
            "url": "https://www.guggenheim.org/artwork/artist/ghada-amer",
            "description": "Guggenheim Museum artist biography and works"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Ghada Amer",
            "url": "https://artsandculture.google.com/search?q=Ghada%20Amer",
            "description": "High-resolution images and exhibitions"
        }
    ],
    '2002.85': [  # James Bishop
        {
            "type": "moma",
            "title": "MoMA: James Bishop",
            "url": "https://www.moma.org/artists/584",
            "description": "Museum of Modern Art artist page and collection"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: James Bishop",
            "url": "https://artsandculture.google.com/search?q=James%20Bishop%20artist",
            "description": "High-resolution images and museum collections"
        }
    ],
    '2003.78': [  # James Casebere
        {
            "type": "moma",
            "title": "MoMA: James Casebere",
            "url": "https://www.moma.org/artists/1009",
            "description": "Museum of Modern Art artist page and photography collection"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: James Casebere",
            "url": "https://www.guggenheim.org/artwork/artist/james-casebere",
            "description": "Guggenheim Museum artist biography and works"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: James Casebere",
            "url": "https://artsandculture.google.com/search?q=James%20Casebere",
            "description": "Architectural photography and exhibitions"
        }
    ],
    '2004.152': [  # Do-Ho Suh
        {
            "type": "moma",
            "title": "MoMA: Do Ho Suh",
            "url": "https://www.moma.org/artists/44857",
            "description": "Museum of Modern Art artist page and installations"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Do Ho Suh",
            "url": "https://www.guggenheim.org/artwork/artist/do-ho-suh",
            "description": "Guggenheim Museum artist biography and fabric architecture"
        },
        {
            "type": "tate",
            "title": "Tate: Do Ho Suh",
            "url": "https://www.tate.org.uk/art/artists/do-ho-suh-2686",
            "description": "Tate Museum artist page and collection"
        }
    ],
    '1992.394': [  # Jean Dubuffet
        {
            "type": "moma",
            "title": "MoMA: Jean Dubuffet",
            "url": "https://www.moma.org/artists/1661",
            "description": "Museum of Modern Art - extensive Dubuffet collection"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Jean Dubuffet",
            "url": "https://www.guggenheim.org/artwork/artist/jean-dubuffet",
            "description": "Guggenheim Museum Art Brut and L'Hourloupe works"
        },
        {
            "type": "tate",
            "title": "Tate: Jean Dubuffet",
            "url": "https://www.tate.org.uk/art/artists/jean-dubuffet-1041",
            "description": "Tate Museum artist biography and Art Brut movement"
        }
    ],
    '80.237': [  # Jackie Ferrara
        {
            "type": "moma",
            "title": "MoMA: Jackie Ferrara",
            "url": "https://www.moma.org/artists/1877",
            "description": "Museum of Modern Art sculpture collection"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Jackie Ferrara",
            "url": "https://artsandculture.google.com/search?q=Jackie%20Ferrara",
            "description": "Minimalist sculpture and architectural works"
        }
    ],
    '1996.247': [  # Hans Hofmann
        {
            "type": "moma",
            "title": "MoMA: Hans Hofmann",
            "url": "https://www.moma.org/artists/2644",
            "description": "Museum of Modern Art - major Abstract Expressionist collection"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Hans Hofmann",
            "url": "https://www.guggenheim.org/artwork/artist/hans-hofmann",
            "description": "Guggenheim Museum push-pull theory and color relationships"
        },
        {
            "type": "tate",
            "title": "Tate: Hans Hofmann",
            "url": "https://www.tate.org.uk/art/artists/hans-hofmann-1276",
            "description": "Tate Museum Abstract Expressionism resources"
        }
    ],
    '67.8': [  # Robert Indiana - LOVE
        {
            "type": "moma",
            "title": "MoMA: Robert Indiana",
            "url": "https://www.moma.org/artists/2746",
            "description": "Museum of Modern Art - iconic Pop Art collection"
        },
        {
            "type": "smithsonian",
            "title": "Smithsonian: Robert Indiana",
            "url": "https://americanart.si.edu/artist/robert-indiana-2392",
            "description": "Smithsonian American Art Museum comprehensive collection"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: LOVE sculpture",
            "url": "https://artsandculture.google.com/search?q=Robert%20Indiana%20LOVE",
            "description": "Global LOVE installations and Pop Art history"
        }
    ],
    '1988.220': [  # Robert Irwin
        {
            "type": "guggenheim",
            "title": "Guggenheim: Robert Irwin",
            "url": "https://www.guggenheim.org/artwork/artist/robert-irwin",
            "description": "Guggenheim Museum Light and Space movement"
        },
        {
            "type": "getty",
            "title": "Getty Research: Robert Irwin",
            "url": "https://www.getty.edu/art/collection/search?q=Robert%20Irwin",
            "description": "Getty Museum phenomenology and perception research"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Robert Irwin",
            "url": "https://artsandculture.google.com/search?q=Robert%20Irwin%20artist",
            "description": "Light and Space movement installations"
        }
    ],
    '1992.362': [  # Donald Judd
        {
            "type": "moma",
            "title": "MoMA: Donald Judd",
            "url": "https://www.moma.org/artists/2961",
            "description": "Museum of Modern Art - major Minimalist collection"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Donald Judd",
            "url": "https://www.guggenheim.org/artwork/artist/donald-judd",
            "description": "Guggenheim Museum specific objects and Minimalism"
        },
        {
            "type": "tate",
            "title": "Tate: Donald Judd",
            "url": "https://www.tate.org.uk/art/artists/donald-judd-1343",
            "description": "Tate Museum Minimalism and sculpture"
        }
    ],
    '1990.40': [  # Sol LeWitt
        {
            "type": "moma",
            "title": "MoMA: Sol LeWitt",
            "url": "https://www.moma.org/artists/3528",
            "description": "Museum of Modern Art - Conceptual Art pioneer"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Sol LeWitt",
            "url": "https://www.guggenheim.org/artwork/artist/sol-lewitt",
            "description": "Guggenheim Museum wall drawings and instructions"
        },
        {
            "type": "tate",
            "title": "Tate: Sol LeWitt",
            "url": "https://www.tate.org.uk/art/artists/sol-lewitt-1533",
            "description": "Tate Museum Conceptual Art resources"
        }
    ],
    '1993.67': [  # Donald Lipski
        {
            "type": "smithsonian",
            "title": "Smithsonian: Donald Lipski",
            "url": "https://americanart.si.edu/artist/donald-lipski-2931",
            "description": "Smithsonian American Art Museum assemblage sculpture"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Donald Lipski",
            "url": "https://artsandculture.google.com/search?q=Donald%20Lipski",
            "description": "Found object sculpture and installations"
        }
    ],
    '1998.184': [  # Joan Mitchell
        {
            "type": "moma",
            "title": "MoMA: Joan Mitchell",
            "url": "https://www.moma.org/artists/4032",
            "description": "Museum of Modern Art - Abstract Expressionist paintings"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Joan Mitchell",
            "url": "https://www.guggenheim.org/artwork/artist/joan-mitchell",
            "description": "Guggenheim Museum second-generation Abstract Expressionism"
        },
        {
            "type": "tate",
            "title": "Tate: Joan Mitchell",
            "url": "https://www.tate.org.uk/art/artists/joan-mitchell-8301",
            "description": "Tate Museum landscape abstraction"
        }
    ],
    '2004.62': [  # Kenneth Noland
        {
            "type": "moma",
            "title": "MoMA: Kenneth Noland",
            "url": "https://www.moma.org/artists/4318",
            "description": "Museum of Modern Art - Color Field painting"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Kenneth Noland",
            "url": "https://www.guggenheim.org/artwork/artist/kenneth-noland",
            "description": "Guggenheim Museum stained canvas and geometric abstraction"
        },
        {
            "type": "tate",
            "title": "Tate: Kenneth Noland",
            "url": "https://www.tate.org.uk/art/artists/kenneth-noland-1750",
            "description": "Tate Museum Post-Painterly Abstraction"
        }
    ],
    '74.217': [  # Larry Poons
        {
            "type": "moma",
            "title": "MoMA: Larry Poons",
            "url": "https://www.moma.org/artists/4693",
            "description": "Museum of Modern Art optical and abstract painting"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Larry Poons",
            "url": "https://www.guggenheim.org/artwork/artist/larry-poons",
            "description": "Guggenheim Museum Color Field and optical art"
        }
    ],
    '2004.76': [  # Kay Rosen
        {
            "type": "other",
            "title": "MCA Chicago: Kay Rosen",
            "url": "https://mcachicago.org/exhibitions/2011/kay-rosen",
            "description": "Museum of Contemporary Art Chicago language-based art"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Kay Rosen",
            "url": "https://artsandculture.google.com/search?q=Kay%20Rosen%20artist",
            "description": "Text art and linguistic visual puns"
        }
    ],
    '2004.153': [  # Fred Sandback
        {
            "type": "moma",
            "title": "MoMA: Fred Sandback",
            "url": "https://www.moma.org/artists/5161",
            "description": "Museum of Modern Art - Minimalist yarn sculptures"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Fred Sandback",
            "url": "https://www.guggenheim.org/artwork/artist/fred-sandback",
            "description": "Guggenheim Museum spatial interventions"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Fred Sandback",
            "url": "https://artsandculture.google.com/search?q=Fred%20Sandback",
            "description": "Minimalist sculpture and architectural space"
        }
    ],
    '60.279': [  # David Smith
        {
            "type": "moma",
            "title": "MoMA: David Smith",
            "url": "https://www.moma.org/artists/5518",
            "description": "Museum of Modern Art - pioneering steel sculpture"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: David Smith",
            "url": "https://www.guggenheim.org/artwork/artist/david-smith",
            "description": "Guggenheim Museum welded metal sculpture"
        },
        {
            "type": "tate",
            "title": "Tate: David Smith",
            "url": "https://www.tate.org.uk/art/artists/david-smith-1925",
            "description": "Tate Museum abstract sculpture and Cubist influence"
        }
    ],
    '1989.111': [  # James Turrell
        {
            "type": "guggenheim",
            "title": "Guggenheim: James Turrell",
            "url": "https://www.guggenheim.org/artwork/artist/james-turrell",
            "description": "Guggenheim Museum Light and Space installations"
        },
        {
            "type": "other",
            "title": "James Turrell: Roden Crater Project",
            "url": "https://rodencrater.com/",
            "description": "Official site for monumental land art project"
        },
        {
            "type": "getty",
            "title": "Getty Research: James Turrell",
            "url": "https://www.getty.edu/art/collection/search?q=James%20Turrell",
            "description": "Getty Museum perception and light research"
        }
    ],
    '2004.60': [  # Hans Arp
        {
            "type": "moma",
            "title": "MoMA: Jean (Hans) Arp",
            "url": "https://www.moma.org/artists/260",
            "description": "Museum of Modern Art - Dada and Surrealist works"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Jean Arp",
            "url": "https://www.guggenheim.org/artwork/artist/jean-hans-arp",
            "description": "Guggenheim Museum biomorphic abstraction"
        },
        {
            "type": "tate",
            "title": "Tate: Jean Arp",
            "url": "https://www.tate.org.uk/art/artists/jean-arp-682",
            "description": "Tate Museum organic forms and sculpture"
        }
    ],
    '2008.3': [  # Ingrid Calame
        {
            "type": "other",
            "title": "Ingrid Calame Official Site",
            "url": "https://www.ingridcalame.com/",
            "description": "Artist's official website with project documentation"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Ingrid Calame",
            "url": "https://artsandculture.google.com/search?q=Ingrid%20Calame",
            "description": "Traced urban surfaces and abstract mapping"
        }
    ],
    '2000.157A-P': [  # Kay Rosen - Grid
        {
            "type": "other",
            "title": "MCA Chicago: Kay Rosen",
            "url": "https://mcachicago.org/exhibitions/2011/kay-rosen",
            "description": "Museum of Contemporary Art Chicago language-based art"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Kay Rosen",
            "url": "https://artsandculture.google.com/search?q=Kay%20Rosen%20artist",
            "description": "Text art and visual linguistics"
        }
    ],
    '2010.241A-E': [  # Jan Tichy
        {
            "type": "other",
            "title": "Jan Tichy Official Site",
            "url": "https://www.jantichy.com/",
            "description": "Artist's official website with video installations"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Jan Tichy",
            "url": "https://artsandculture.google.com/search?q=Jan%20Tichy%20artist",
            "description": "Video installation and architectural memory"
        }
    ],
    '1989.35': [  # Vito Acconci
        {
            "type": "moma",
            "title": "MoMA: Vito Acconci",
            "url": "https://www.moma.org/artists/26",
            "description": "Museum of Modern Art - performance and installation art"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Vito Acconci",
            "url": "https://www.guggenheim.org/artwork/artist/vito-acconci",
            "description": "Guggenheim Museum body art and viewer participation"
        },
        {
            "type": "tate",
            "title": "Tate: Vito Acconci",
            "url": "https://www.tate.org.uk/art/artists/vito-acconci-13887",
            "description": "Tate Museum performance art and conceptual works"
        }
    ],
    '69.36.7': [  # Lee Krasner
        {
            "type": "moma",
            "title": "MoMA: Lee Krasner",
            "url": "https://www.moma.org/artists/3225",
            "description": "Museum of Modern Art - Abstract Expressionist paintings"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Lee Krasner",
            "url": "https://www.guggenheim.org/artwork/artist/lee-krasner",
            "description": "Guggenheim Museum first-generation Abstract Expressionism"
        },
        {
            "type": "tate",
            "title": "Tate: Lee Krasner",
            "url": "https://www.tate.org.uk/art/artists/lee-krasner-7400",
            "description": "Tate Museum gestural abstraction and color"
        }
    ],
    '1996.321': [  # Nam June Paik
        {
            "type": "moma",
            "title": "MoMA: Nam June Paik",
            "url": "https://www.moma.org/artists/4464",
            "description": "Museum of Modern Art - video art pioneer"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Nam June Paik",
            "url": "https://www.guggenheim.org/artwork/artist/nam-june-paik",
            "description": "Guggenheim Museum electronic art and Fluxus"
        },
        {
            "type": "smithsonian",
            "title": "Smithsonian: Nam June Paik",
            "url": "https://americanart.si.edu/artist/nam-june-paik-3670",
            "description": "Smithsonian American Art Museum video sculpture collection"
        }
    ],
    '1998.38': [  # Matthew Ritchie
        {
            "type": "guggenheim",
            "title": "Guggenheim: Matthew Ritchie",
            "url": "https://www.guggenheim.org/artwork/artist/matthew-ritchie",
            "description": "Guggenheim Museum cosmological narratives"
        },
        {
            "type": "other",
            "title": "Google Arts & Culture: Matthew Ritchie",
            "url": "https://artsandculture.google.com/search?q=Matthew%20Ritchie%20artist",
            "description": "Complex narrative paintings and installations"
        }
    ],
    '2013.443A-E': [  # Roy Lichtenstein
        {
            "type": "moma",
            "title": "MoMA: Roy Lichtenstein",
            "url": "https://www.moma.org/artists/3542",
            "description": "Museum of Modern Art - major Pop Art collection"
        },
        {
            "type": "guggenheim",
            "title": "Guggenheim: Roy Lichtenstein",
            "url": "https://www.guggenheim.org/artwork/artist/roy-lichtenstein",
            "description": "Guggenheim Museum Pop Art and Brushstrokes series"
        },
        {
            "type": "tate",
            "title": "Tate: Roy Lichtenstein",
            "url": "https://www.tate.org.uk/art/artists/roy-lichtenstein-1508",
            "description": "Tate Museum Pop Art and comic book aesthetics"
        },
        {
            "type": "smithsonian",
            "title": "Smithsonian: Roy Lichtenstein",
            "url": "https://americanart.si.edu/artist/roy-lichtenstein-2918",
            "description": "Smithsonian American Art Museum comprehensive collection"
        }
    ]
}

print("=" * 80)
print("ADDING ONLINE RESOURCES TO CONTEMPORARY ARTWORKS")
print("=" * 80)

updated = 0
skipped = 0

for accession, resources in online_resources.items():
    try:
        result = supabase.table('Artworks').update({
            'Online Resources': resources
        }).eq('Accession Number', accession).execute()

        if result.data:
            print(f"OK {accession:15s} - Added {len(resources)} resources")
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
print(f"  Total resources added: {sum(len(r) for r in online_resources.values())}")
