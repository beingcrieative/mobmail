import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

// Only allow this route in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to generate Stripe signature
function generateStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

export async function POST(request: Request) {
  // Prevent use in production
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, planId = 'pro-monthly' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required in the request body' },
        { status: 400 }
      );
    }

    // Create a mock Stripe checkout session
    const mockSession = {
      id: 'cs_test_' + Math.random().toString(36).substring(7),
      customer: 'cus_' + Math.random().toString(36).substring(7),
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        plan_id: planId
      },
      subscription: 'sub_' + Math.random().toString(36).substring(7)
    };

    // Create the webhook event payload
    const webhookPayload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: mockSession
      }
    });

    // Generate Stripe signature
    const signature = generateStripeSignature(webhookPayload, webhookSecret);

    // Call the webhook handler directly
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature
      },
      body: webhookPayload
    });

    const webhookResult = await webhookResponse.json();

    return NextResponse.json({
      message: 'Webhook test completed',
      webhookResult,
      mockSession,
      signature
    });
  } catch (error) {
    console.error('Error in webhook test:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 