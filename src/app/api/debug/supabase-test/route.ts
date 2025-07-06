import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase client creation...');
    
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ 
        error: 'getSupabase() returned null',
        details: 'Supabase client could not be created'
      }, { status: 500 });
    }

    console.log('Supabase client created successfully');
    
    // Test a simple call
    try {
      const { error } = await supabase.from('users').select('count').limit(1);
      
      return NextResponse.json({
        success: true,
        client_created: true,
        query_test: error ? `Error: ${error.message}` : 'Success or table not found (both OK)',
        message: 'Supabase client is working'
      });
    } catch (queryError: any) {
      return NextResponse.json({
        success: true,
        client_created: true,
        query_test: `Query error: ${queryError.message}`,
        message: 'Client created but query failed (normal if table does not exist)'
      });
    }
  } catch (error: any) {
    console.error('Supabase test error:', error);
    return NextResponse.json({
      error: 'Supabase test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}