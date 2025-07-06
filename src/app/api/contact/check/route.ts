import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database is currently unavailable'
        }, 
        { status: 503 }
      );
    }

    // Fetch the latest contact submissions
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching contact submissions:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch contact submissions',
          details: error.message
        }, 
        { status: 500 }
      );
    }
    
    // Return the submissions
    return NextResponse.json({
      success: true,
      submissions: data
    });
    
  } catch (error: any) {
    console.error('Unexpected error in check contact API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
} 