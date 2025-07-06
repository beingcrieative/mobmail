import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

// Only allow this route in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

export async function GET(request: Request) {
  // Prevent use in production
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    // Fetch all products from Stripe
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    });

    // Fetch all prices from Stripe
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ['data.product'],
    });

    // Format the data for easier use
    const formattedProducts = products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      default_price: product.default_price,
    }));

    // Group prices by product
    const pricesByProduct = prices.data.reduce((acc, price) => {
      const productId = typeof price.product === 'string' 
        ? price.product 
        : price.product.id;
      
      if (!acc[productId]) {
        acc[productId] = [];
      }
      
      acc[productId].push({
        id: price.id,
        currency: price.currency,
        unit_amount: price.unit_amount,
        nickname: price.nickname,
        type: price.type,
        recurring: price.recurring,
        lookup_key: price.lookup_key,
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    // Build recommended environment variable configuration
    const envConfig: Record<string, string> = {};
    
    // Map our standard plan IDs to Stripe price IDs
    for (const price of prices.data) {
      const product = typeof price.product === 'string' 
        ? null 
        : price.product;
      
      if (!product || product.deleted) continue;
      
      const productName = product.name?.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '') || '';
      
      let planKey = '';
      
      // Determine if this is basic, pro or enterprise
      if (productName.includes('basic') || product.name?.toLowerCase().includes('basic')) {
        planKey = 'BASIC';
      } else if (productName.includes('pro') || product.name?.toLowerCase().includes('pro')) {
        planKey = 'PRO';
      } else if (productName.includes('enterprise') || product.name?.toLowerCase().includes('enterprise')) {
        planKey = 'ENTERPRISE';
      } else {
        // Skip if we can't determine the plan level
        continue;
      }
      
      // Determine if monthly or yearly
      let interval = '';
      if (price.recurring) {
        if (price.recurring.interval === 'month') {
          interval = 'MONTHLY';
        } else if (price.recurring.interval === 'year') {
          interval = 'YEARLY';
        } else {
          // Skip if not monthly or yearly
          continue;
        }
      } else {
        // Skip if not recurring
        continue;
      }
      
      const envKey = `STRIPE_PRICE_${planKey}_${interval}`;
      envConfig[envKey] = price.id;
    }

    // Return all the data
    return NextResponse.json({
      products: formattedProducts,
      prices: prices.data,
      pricesByProduct,
      env_config: envConfig,
      instructions: "Copy the values from env_config to your .env.local file",
    });
  } catch (error: any) {
    console.error('Error fetching Stripe data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Stripe data', 
        details: error.message,
        next_steps: 'Check that your STRIPE_SECRET_KEY is correct in .env.local'
      },
      { status: 500 }
    );
  }
} 