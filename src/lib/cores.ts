/**
 * Core configuration
 * Defines the different docent cores and their associated collections
 */

export interface Core {
  id: string;
  name: string;
  displayName: string;
  badge: string;
  collections: string[];
  description: string;
}

export const cores: Record<string, Core> = {
  'american': {
    id: 'american',
    name: 'american-core',
    displayName: 'American Core',
    badge: '/images/badges/american-core.png',
    collections: [
      'American Painting & Sculpture 1800–1945',
      'American Painting & Sculpture Before 1800',
      'American Painting and Sculpture 1800-1945',
      'American Painting and Sculpture Before 1800'
    ],
    description: 'American art from colonial times through the mid-20th century'
  },
  'contemporary': {
    id: 'contemporary',
    name: 'contemporary-core',
    displayName: 'Contemporary Core',
    badge: '/images/badges/contemporary-core.png',
    collections: ['Contemporary'],
    description: 'Contemporary art from the late 20th century to present'
  },
  'african': {
    id: 'african',
    name: 'african-core',
    displayName: 'African Core',
    badge: '/images/badges/african-core.png',
    collections: [], // To be added when African collection is imported
    description: 'African art and cultural artifacts'
  },
  'asian': {
    id: 'asian',
    name: 'asian-core',
    displayName: 'Asian Core',
    badge: '/images/badges/asian-core.png',
    collections: [], // To be added when Asian collection is imported
    description: 'Asian art and cultural heritage'
  },
  'design-decorative': {
    id: 'design-decorative',
    name: 'design-decorative-core',
    displayName: 'Design & Decorative Arts Core',
    badge: '/images/badges/design-decorative-core.png',
    collections: [], // To be added when Design & Decorative Arts collection is imported
    description: 'Design, decorative arts, and functional objects'
  },
  'european': {
    id: 'european',
    name: 'european-core',
    displayName: 'European Core',
    badge: '/images/badges/european-core.png',
    collections: [], // To be added when European collection is imported
    description: 'European art from medieval to modern periods'
  }
};

// Get array of all cores
export const getAllCores = (): Core[] => Object.values(cores);

// Get core by ID
export const getCoreById = (id: string): Core | undefined => cores[id];

// Get core by collection name
export const getCoreByCollection = (collectionName: string): Core | undefined => {
  return Object.values(cores).find(core =>
    core.collections.includes(collectionName)
  );
};

// Get active cores (cores that have collections)
export const getActiveCores = (): Core[] => {
  return Object.values(cores).filter(core => core.collections.length > 0);
};
