import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, planId, stripeCustomerId } = await request.json();
    
    if (!userId || !planId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID and Plan ID are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return new NextResponse(
        JSON.stringify({ error: 'Database is currently unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a new subscription
    const now = new Date();
    const currentPeriodStart = now.toISOString();
    const currentPeriodEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
    
    const { error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          stripe_customer_id: stripeCustomerId,
          status: 'active',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }
      ]);

    if (error) {
      console.error('Error creating subscription:', error);
      return new NextResponse(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ success: true }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in create subscription:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 