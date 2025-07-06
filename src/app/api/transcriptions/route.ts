import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get clientId from the query parameters
    const clientId = request.nextUrl.searchParams.get('clientId');
    
    console.log(`Fetching transcriptions ${clientId ? `for client: ${clientId}` : 'for all clients'}`);

    // Try admin client first, fallback to regular client
    let supabase = getSupabaseAdmin();
    
    if (!supabase) {
      console.warn('Admin client not available, trying regular client');
      supabase = require('@/lib/supabase').getSupabase();
      
      if (!supabase) {
        return NextResponse.json(
          { error: 'Database is currently unavailable' },
          { status: 503 }
        );
      }
    }

    // Create the query
    let query = supabase.from('call_transcriptions').select('*');
    
    // Add filter for client_id if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching transcriptions from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transcriptions' }, 
        { status: 500 }
      );
    }
    
    console.log(`Found ${data?.length || 0} transcriptions`);
    
    // Validate transcriptions to ensure they have the required properties
    const validatedTranscriptions = data?.map((item: any) => {
      // Ensure transcript is always an array
      if (!Array.isArray(item.transcript)) {
        item.transcript = [];
      }
      return item;
    }) || [];
    
    return NextResponse.json({ transcriptions: validatedTranscriptions });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 