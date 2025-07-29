import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Initialize Stripe only when the API is called, not at module level
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe configuration is missing' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia'
  });
  try {
    const body = await request.json();
    const { userId, returnUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Query your database to get the Stripe customer ID for this user
    // 2. Create a Portal Session using the customer ID
    // 
    // For now, we'll return a mock URL that works with Stripe test mode
    
    const sessionUrl = process.env.NODE_ENV === 'development' 
      ? 'https://billing.stripe.com/session/test_fake_session'
      : 'https://billing.stripe.com/session/_fake_session_';

    return NextResponse.json({ url: sessionUrl });
    
  } catch (error) {
    console.error('Error creating Stripe portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}