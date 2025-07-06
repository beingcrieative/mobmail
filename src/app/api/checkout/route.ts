import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

// Define valid plan IDs
type PlanId = 
  | 'basic-monthly' 
  | 'pro-monthly' 
  | 'enterprise-monthly' 
  | 'basic-yearly' 
  | 'pro-yearly' 
  | 'enterprise-yearly';

export async function POST(request: Request) {
  // Prices for different plans - using Stripe test price IDs
  const PRICE_IDS: Record<PlanId, string> = {
    'basic-monthly': process.env.STRIPE_PRICE_BASIC_MONTHLY || 'price_placeholder',
    'pro-monthly': process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_placeholder',
    'enterprise-monthly': process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_placeholder',
    'basic-yearly': process.env.STRIPE_PRICE_BASIC_YEARLY || 'price_placeholder',
    'pro-yearly': process.env.STRIPE_PRICE_PRO_YEARLY || 'price_placeholder',
    'enterprise-yearly': process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_placeholder'
  };

  // Check if we should enable development bypass
  const enableDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_STRIPE === 'true';

  // For development fallback
  const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
  try {
    console.log('Checkout API: Received request');
    
    const body = await request.json();
    const { planId, userId, email } = body;
    
    console.log('Checkout data:', { planId, userId, email });

    if (!planId) {
      return new NextResponse(
        JSON.stringify({ error: 'Plan ID is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if planId is valid
    if (!Object.keys(PRICE_IDS).includes(planId)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid plan selected' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Stripe instance
    const stripe = getStripe();
    if (!stripe) {
      return new NextResponse(
        JSON.stringify({ error: 'Payment processing is currently unavailable' }), 
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the price ID for the selected plan
    const priceId = PRICE_IDS[planId as PlanId];
    console.log(`Using price ID: ${priceId} for plan: ${planId}`);
    
    // In development mode, we can bypass Stripe checkout if configured to do so
    if (process.env.NODE_ENV !== 'production' && enableDevBypass) {
      // Check if we should skip Stripe (if price IDs are placeholders or not set)
      if (priceId === 'price_placeholder' || priceId === 'YOUR_BASIC_MONTHLY_PRICE_ID' || 
          priceId === 'YOUR_PRO_MONTHLY_PRICE_ID' || priceId === 'YOUR_ENTERPRISE_MONTHLY_PRICE_ID' ||
          !priceId.startsWith('price_')) {
        console.log('Development mode: Using direct success redirect instead of Stripe');
        
        // Record the subscription attempt in the database
        try {
          await fetch(`${DOMAIN}/api/subscriptions/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, planId }),
          });
        } catch (err) {
          console.warn('Failed to record subscription in development mode:', err);
        }
        
        // Return a special response for dev mode
        return new NextResponse(
          JSON.stringify({ 
            dev_mode: true,
            url: `${DOMAIN}/dashboard/order/success?plan=${planId}`
          }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Create a checkout session using Stripe API
    console.log('Creating Stripe checkout session');
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'ideal'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${DOMAIN}/dashboard/order/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
        cancel_url: `${DOMAIN}/dashboard/order?canceled=true`,
        client_reference_id: userId,
        customer_email: email,
        metadata: {
          plan_id: planId,
          user_id: userId,
          email: email
        }
      });

      console.log('Checkout session created:', session.id);
      
      // Return the checkout session URL
      return new NextResponse(
        JSON.stringify({ url: session.url }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (stripeError: any) {
      console.error('Stripe checkout creation failed:', stripeError);
      
      // If we're in development mode, we can fall back to direct success
      if (process.env.NODE_ENV !== 'production' && enableDevBypass) {
        console.log('Falling back to development mode redirect after Stripe error');
        return new NextResponse(
          JSON.stringify({ 
            dev_mode: true,
            error_message: stripeError.message,
            url: `${DOMAIN}/dashboard/order/success?plan=${planId}`
          }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // In production, return the error
      throw stripeError;
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'An error occurred during checkout',
        message: error.message 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 