import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Docent {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  cores_certified: string[] | null;
  roles: string[] | null;
  core_group: string | null;
  join_date: string | null;
  bio: string | null;
  notes: string | null;
  active: boolean;
  source_attribution: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('docents')
      .select('*')
      .eq('active', true)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching docents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch docents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      docents: data as Docent[],
      count: data?.length || 0,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in docents API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
