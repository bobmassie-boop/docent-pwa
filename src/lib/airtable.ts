// Airtable client configuration and utilities using REST API
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
  'Cultural Context'?: string;
  'Cultural/Philosophical Context'?: string;
  'Contemporary Context'?: string;
  'Philosophical Context'?: string;
  'Related Poems'?: string;
  'Period Music Links'?: string;
  'Supplemental Information'?: string;
  'Sources/Bibliography'?: string;
  'Micro Summary'?: string;
  URL?: string;
  'Corrected URL'?: string;
  thumbnail?: string;
  imageUrl?: string;
}

/**
 * Fetch all artworks from Airtable using REST API
 */
export async function fetchArtworks(): Promise<Artwork[]> {
  const artworks: Artwork[] = [];
  const baseId = process.env.AIRTABLE_BASE_ID!;
  const tableId = process.env.AIRTABLE_TABLE_ID!;
  const apiKey = process.env.AIRTABLE_API_KEY!;

  try {
    let offset: string | undefined;
    
    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
      if (offset) {
        url.searchParams.set('offset', offset);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      data.records.forEach((record: any) => {
        const fields = record.fields;

        // Merge image fields - prioritize Image Upload, fallback to Image
        const imageUpload = fields['Image Upload']?.[0];
        const image = fields['Image']?.[0];
        const thumbnail = imageUpload?.thumbnails?.large?.url || image?.thumbnails?.large?.url;
        const fullImage = imageUpload?.url || image?.url;

        // Merge URL fields - use Corrected URL if exists, otherwise URL
        const finalUrl = fields['Corrected URL'] || fields['URL'];

        artworks.push({
          id: record.id,
          'Accession Number': fields['Accession Number'] || '',
          Title: fields.Title || 'Untitled',
          'Artist First Name': fields['Artist First Name'],
          'Artist Last Name': fields['Artist Last Name'],
          'Artist (Display)': fields['Artist (Display)'],
          Collection: fields.Collection,
          'On Display': fields['On Display'],
          Date: fields.Date,
          Medium: fields.Medium,
          Dimensions: fields.Dimensions,
          'Gallery Location': fields['Gallery Location'],
          'Artwork Description': fields['Artwork Description'],
          'Artist Biography': fields['Artist Biography'],
          'Tour Guidance': fields['Tour Guidance'],
          Connections: fields.Connections,
          'Historical Context': fields['Historical Context'],
          'Cultural Context': fields['Cultural Context'],
          'Cultural/Philosophical Context': fields['Cultural/Philosophical Context'],
          'Contemporary Context': fields['Contemporary Context'],
          'Philosophical Context': fields['Philosophical Context'],
          'Related Poems': fields['Related Poems'],
          'Period Music Links': fields['Period Music Links'],
          'Supplemental Information': fields['Supplemental Information'],
          'Sources/Bibliography': fields['Sources/Bibliography'],
          'Micro Summary': fields['Micro Summary'],
          URL: finalUrl,
          'Corrected URL': fields['Corrected URL'],
          thumbnail: thumbnail,
          imageUrl: fullImage
        });
      });

      offset = data.offset;
    } while (offset);

    return artworks;
  } catch (error) {
    console.error('Error fetching artworks from Airtable:', error);
    throw error;
  }
}

/**
 * Fetch single artwork by ID using REST API
 */
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  const baseId = process.env.AIRTABLE_BASE_ID!;
  const tableId = process.env.AIRTABLE_TABLE_ID!;
  const apiKey = process.env.AIRTABLE_API_KEY!;

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error (${response.status}): ${errorText}`);
    }

    const record = await response.json();
    const fields = record.fields;

    // Merge image fields - prioritize Image Upload, fallback to Image
    const imageUpload = fields['Image Upload']?.[0];
    const image = fields['Image']?.[0];
    const thumbnail = imageUpload?.thumbnails?.large?.url || image?.thumbnails?.large?.url;
    const fullImage = imageUpload?.url || image?.url;

    // Merge URL fields - use Corrected URL if exists, otherwise URL
    const finalUrl = fields['Corrected URL'] || fields['URL'];

    return {
      id: record.id,
      'Accession Number': fields['Accession Number'] || '',
      Title: fields.Title || 'Untitled',
      'Artist First Name': fields['Artist First Name'],
      'Artist Last Name': fields['Artist Last Name'],
      'Artist (Display)': fields['Artist (Display)'],
      Collection: fields.Collection,
      'On Display': fields['On Display'],
      Date: fields.Date,
      Medium: fields.Medium,
      Dimensions: fields.Dimensions,
      'Gallery Location': fields['Gallery Location'],
      'Artwork Description': fields['Artwork Description'],
      'Artist Biography': fields['Artist Biography'],
      'Tour Guidance': fields['Tour Guidance'],
      Connections: fields.Connections,
      'Historical Context': fields['Historical Context'],
      'Cultural Context': fields['Cultural Context'],
      'Cultural/Philosophical Context': fields['Cultural/Philosophical Context'],
      'Contemporary Context': fields['Contemporary Context'],
      'Philosophical Context': fields['Philosophical Context'],
      'Related Poems': fields['Related Poems'],
      'Period Music Links': fields['Period Music Links'],
      'Supplemental Information': fields['Supplemental Information'],
      'Sources/Bibliography': fields['Sources/Bibliography'],
      'Micro Summary': fields['Micro Summary'],
      URL: finalUrl,
      'Corrected URL': fields['Corrected URL'],
      thumbnail: thumbnail,
      imageUrl: fullImage
    };
  } catch (error) {
    console.error('Error fetching artwork from Airtable:', error);
    return null;
  }
}
