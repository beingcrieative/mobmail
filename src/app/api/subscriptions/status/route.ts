import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get user ID from query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database is currently unavailable' },
        { status: 503 }
      );
    }

    // Get the most recent active subscription for the user
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is returned when no rows are found
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Error fetching subscription' },
        { status: 500 }
      );
    }

    // If no active subscription found, check for any subscription
    if (!subscription) {
      const { data: anySubscription, error: anyError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (anyError && anyError.code !== 'PGRST116') {
        console.error('Error fetching any subscription:', anyError);
        return NextResponse.json(
          { error: 'Error fetching subscription' },
          { status: 500 }
        );
      }

      if (!anySubscription) {
        // No subscription at all
        return NextResponse.json({ 
          has_subscription: false,
          subscription: null
        });
      }

      // Return inactive/canceled subscription
      return NextResponse.json({
        has_subscription: false,
        subscription: anySubscription
      });
    }

    // Found active subscription
    return NextResponse.json({
      has_subscription: true,
      subscription
    });
  } catch (error) {
    console.error('Error in subscription status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 