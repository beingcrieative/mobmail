import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('Received Stripe webhook event');
    
    const stripe = getStripe();
    if (!stripe) {
      console.error('Stripe not available for webhook processing');
      return new NextResponse(
        JSON.stringify({ error: 'Payment processing is currently unavailable' }), 
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const payload = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    console.log('Webhook details:', {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      headers: Object.fromEntries(headersList.entries())
    });
    
    // Extract event data
    let event;
    
    // Verify webhook signature if available
    if (signature && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        console.log('Webhook signature verified successfully');
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(
          JSON.stringify({ error: 'Webhook signature verification failed' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // For development, parse the payload without verification
      console.warn('No webhook secret available, skipping signature verification');
      try {
        event = JSON.parse(payload);
      } catch (err) {
        console.error('Invalid webhook payload');
        return new NextResponse(
          JSON.stringify({ error: 'Invalid webhook payload' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log(`Processing webhook event: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));
    
    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout.session.completed event');
        await handleCheckoutSessionCompleted(session);
        break;
      }
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Processing subscription event:', event.type);
        await handleSubscriptionUpdated(subscription);
        break;
      }
        
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Processing subscription deletion event');
        await handleSubscriptionDeleted(subscription);
        break;
      }
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new NextResponse(
      JSON.stringify({ received: true }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error(`Webhook error: ${error.message}`);
    console.error('Error stack:', error.stack);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to format string as UUID
function formatAsUUID(str: string): string {
  // Remove any non-hex characters
  const cleanStr = str.replace(/[^0-9a-f]/gi, '');
  // Pad with zeros if needed
  const paddedStr = cleanStr.padEnd(32, '0');
  // Format as UUID
  return `${paddedStr.slice(0, 8)}-${paddedStr.slice(8, 12)}-${paddedStr.slice(12, 16)}-${paddedStr.slice(16, 20)}-${paddedStr.slice(20)}`;
}

// Handle checkout.session.completed events
async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log('Processing checkout.session.completed event');
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('Supabase not available, skipping database update');
      return;
    }

    // Create a new subscription
    const now = new Date();
    const currentPeriodStart = now.toISOString();
    const currentPeriodEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
    
    const { data: newSubscription, error: createError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: session.client_reference_id,
          plan_id: session.metadata?.plan_id || 'basic-monthly',
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
      console.error('Error creating subscription:', createError);
      console.error('Error details:', createError.details);
      console.error('Error hint:', createError.hint);
      console.error('Error code:', createError.code);
    } else {
      console.log('Successfully saved subscription:', newSubscription);
    }
  } catch (error: any) {
    console.error('Error handling checkout.session.completed event:', error);
    console.error('Error stack:', error.stack);
  }
}

// Handle subscription update events
async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Processing subscription update event');
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('Supabase not available, skipping subscription update');
      return;
    }
    
    // Get the subscription data
    const status = mapStripeStatus(subscription.status);
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Get user_id from subscription metadata
    const userId = subscription.metadata?.user_id || subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }
    
    // Update subscription using Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error updating subscription:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
    } else {
      console.log(`Subscription updated for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling subscription update event:', error);
  }
}

// Helper function to map Stripe status to our database status
function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'canceled': 'cancelled',
    'past_due': 'past_due',
    'trialing': 'trialing',
    'unpaid': 'unpaid',
    'incomplete': 'past_due',
    'incomplete_expired': 'cancelled'
  };
  
  return statusMap[stripeStatus] || 'past_due';
}

// Handle subscription deletion events
async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Processing subscription deletion event');
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('Supabase not available, skipping subscription deletion');
      return;
    }
    
    // Get user_id from subscription metadata
    const userId = subscription.metadata?.user_id || subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }
    
    // Update subscription status to canceled using Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        ended_at: new Date().toISOString(),
        canceled_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error updating subscription status:', error);
    } else {
      console.log(`Subscription canceled for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling subscription deletion event:', error);
  }
}

// HEAD route for webhook URL verification
export async function HEAD() {
  return new NextResponse(
    JSON.stringify({ status: 'ok' }), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
} 