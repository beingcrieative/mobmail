import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Only allow this route in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // Prevent use in production
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Read the migration file
    const migrationFilePath = path.join(process.cwd(), 'supabase/migrations/20240710_create_subscriptions_table.sql');
    let sql;

    try {
      sql = fs.readFileSync(migrationFilePath, 'utf8');
    } catch (readError) {
      console.error('Error reading migration file:', readError);
      return NextResponse.json(
        { error: 'Failed to read migration file', details: readError },
        { status: 500 }
      );
    }

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try a simpler approach - create just the basic table
      const { error: tableError } = await supabase.rpc('exec_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS public.subscriptions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            plan_id TEXT NOT NULL,
            status TEXT NOT NULL,
            current_period_start TIMESTAMPTZ,
            current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `
      });
      
      if (tableError) {
        console.error('Error creating basic table:', tableError);
        return NextResponse.json(
          { 
            error: 'Failed to set up subscriptions table', 
            details: error,
            fallback_error: tableError,
            next_steps: 'Run the migration manually in Supabase'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: 'Created basic subscriptions table (fallback method)',
        warnings: 'Some features like RLS policies and indexes were not created',
        next_steps: 'Run the full migration manually for complete setup'
      });
    }

    return NextResponse.json({
      message: 'Subscriptions table set up successfully',
      next_steps: 'You can now create subscriptions'
    });
  } catch (error) {
    console.error('Error in setup-subscriptions-table API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 