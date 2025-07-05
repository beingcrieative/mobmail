import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // Get user ID from query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const planId = url.searchParams.get('planId') || 'pro-monthly';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required as a query parameter' },
        { status: 400 }
      );
    }

    // Check if the subscriptions table exists
    const { data: tableExists, error: checkTableError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1)
      .maybeSingle();

    // If the table doesn't exist, create it
    if (checkTableError && checkTableError.code === '42P01') {
      console.log('Subscriptions table does not exist, attempting to create it');
      
      try {
        // Create the subscriptions table
        await supabase.rpc('create_subscriptions_table');
        console.log('Subscriptions table created successfully');
      } catch (createTableError) {
        console.error('Error creating subscriptions table:', createTableError);
        return NextResponse.json(
          { 
            error: 'Failed to create subscriptions table', 
            details: createTableError,
            next_steps: 'Run the migration script at supabase/migrations/20240710_create_subscriptions_table.sql' 
          },
          { status: 500 }
        );
      }
    }

    // Cancel any existing active subscriptions
    const { data: existingSubs, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (checkError) {
      console.error('Error checking existing subscriptions:', checkError);
    } else if (existingSubs && existingSubs.length > 0) {
      console.log(`Cancelling ${existingSubs.length} existing active subscriptions`);
      
      for (const sub of existingSubs) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', sub.id);
      }
    }

    // Create a new test subscription
    const now = new Date();
    const currentPeriodStart = now.toISOString();
    
    // Default to 30 days for monthly plans, 365 for yearly
    const isYearly = planId.includes('yearly');
    const periodDays = isYearly ? 365 : 30;
    const currentPeriodEnd = new Date(now.getTime() + (periodDays * 24 * 60 * 60 * 1000)).toISOString();
    
    const { data: newSubscription, error: createError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating test subscription:', createError);
      return NextResponse.json(
        { error: 'Error creating test subscription', details: createError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Test subscription created successfully',
      subscription: newSubscription,
      next_steps: 'Go back to the dashboard to see the subscription',
      dashboard_url: '/dashboard'
    });
  } catch (error) {
    console.error('Error in dev create-test-subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 