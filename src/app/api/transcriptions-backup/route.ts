import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching all transcriptions from call_transcriptions table');

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database is currently unavailable' },
        { status: 503 }
      );
    }

    // Get all transcriptions without filtering by user ID
    const { data, error } = await supabase
      .from('call_transcriptions')
      .select('*');
    
    if (error) {
      console.error('Error fetching transcriptions from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transcriptions' }, 
        { status: 500 }
      );
    }
    
    console.log(`Found ${data?.length || 0} transcriptions`);
    
    return NextResponse.json({ transcriptions: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 