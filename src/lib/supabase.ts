import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Artwork {
  id: string;
  'Accession Number': string;
  Title: string;
  'Artist First Name'?: string;
  'Artist Last Name'?: string;
  'Artist (Display)'?: string;
  Collection?: string;
  'On Display'?: boolean;
  Date?: string;
  Medium?: string;
  Dimensions?: string;
  'Gallery Location'?: string;
  'Artwork Description'?: string;
  'Artist Biography'?: string;
  'Tour Guidance'?: string;
  Connections?: string;
  'Historical Context'?: string;
  'Cultural/Philosophical Movements'?: string;
  'Contemporary Literature'?: string;
  'Contemporary Context'?: string;
  'Cultural Context'?: string;
  'Cultural/Philosophical Context'?: string;
  'Philosophical Context'?: string;
  'Supplemental Information'?: string;
  'Related Poems'?: string;
  'Period Music Links'?: string;
  'Supplemental Research Notes'?: string;
  'Sources/Bibliography'?: string;
  'Micro Summary'?: string;
  URL?: string;
  'Corrected URL'?: string;
  'Image'?: string;
  'Image Upload'?: string;
  'Image URL'?: string;
  thumbnail?: string;
  imageUrl?: string;
  'Online Resources'?: OnlineResource[];
}

export interface OnlineResource {
  type: string;
  title: string;
  url: string;
  description?: string;
}

/**
 * Fetch all artworks from Supabase
 */
export async function fetchArtworks(): Promise<Artwork[]> {
  try {
    const { data, error } = await supabase
      .from('Artworks')
      .select('*');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return (data || []).map(record => ({
      id: String(record.ID),
      'Accession Number': record['Accession Number'] || '',
      Title: record.Title || 'Untitled',
      'Artist First Name': record['Artist First Name'],
      'Artist Last Name': record['Artist Last Name'],
      'Artist (Display)': record['Artist (Display)'],
      Collection: record.Collection,
      'On Display': record['On Display'],
      Date: record.Date,
      Medium: record.Medium,
      Dimensions: record.Dimensions,
      'Gallery Location': record['Gallery Location'],
      'Artwork Description': record['Artwork Description'],
      'Artist Biography': record['Artist Biography'],
      'Tour Guidance': record['Tour Guidance'],
      Connections: record.Connections,
      'Historical Context': record['Historical Context'],
      'Cultural/Philosophical Movements': record['Cultural/Philosophical Movements'],
      'Contemporary Literature': record['Contemporary Literature'],
      'Related Poems': record['Related Poems'],
      'Period Music Links': record['Period Music Links'],
      'Supplemental Research Notes': record['Supplemental Research Notes'],
      'Sources/Bibliography': record['Sources/Bibliography'],
      'Micro Summary': record['Micro Summary'],
      URL: record['Corrected URL'] || record.URL,
      'Corrected URL': record['Corrected URL'],
      'Image': record.Image,
      'Image Upload': record['Image Upload'],
      'Image URL': record['Image URL'],
      thumbnail: record['Image Upload'] || record['Image URL'] || record.Image,
      imageUrl: record['Image Upload'] || record['Image URL'] || record.Image,
      'Online Resources': record['Online Resources'] || []
    }));
  } catch (error) {
    console.error('Error fetching artworks from Supabase:', error);
    throw error;
  }
}

/**
 * Fetch single artwork by ID from Supabase
 */
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  try {
    const { data, error } = await supabase
      .from('Artworks')
      .select('*')
      .eq('ID', id)
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: String(data.ID),
      'Accession Number': data['Accession Number'] || '',
      Title: data.Title || 'Untitled',
      'Artist First Name': data['Artist First Name'],
      'Artist Last Name': data['Artist Last Name'],
      'Artist (Display)': data['Artist (Display)'],
      Collection: data.Collection,
      'On Display': data['On Display'],
      Date: data.Date,
      Medium: data.Medium,
      Dimensions: data.Dimensions,
      'Gallery Location': data['Gallery Location'],
      'Artwork Description': data['Artwork Description'],
      'Artist Biography': data['Artist Biography'],
      'Tour Guidance': data['Tour Guidance'],
      Connections: data.Connections,
      'Historical Context': data['Historical Context'],
      'Cultural/Philosophical Movements': data['Cultural/Philosophical Movements'],
      'Contemporary Literature': data['Contemporary Literature'],
      'Related Poems': data['Related Poems'],
      'Period Music Links': data['Period Music Links'],
      'Supplemental Research Notes': data['Supplemental Research Notes'],
      'Sources/Bibliography': data['Sources/Bibliography'],
      'Micro Summary': data['Micro Summary'],
      URL: data['Corrected URL'] || data.URL,
      'Corrected URL': data['Corrected URL'],
      'Image': data.Image,
      'Image Upload': data['Image Upload'],
      'Image URL': data['Image URL'],
      thumbnail: data['Image Upload'] || data['Image URL'] || data.Image,
      imageUrl: data['Image Upload'] || data['Image URL'] || data.Image,
      'Online Resources': data['Online Resources'] || []
    };
  } catch (error) {
    console.error('Error fetching artwork from Supabase:', error);
    return null;
  }
}
