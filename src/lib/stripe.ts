import { Stripe } from 'stripe';

let stripeInstance: Stripe | null = null;

// Get Stripe instance with lazy loading
export function getStripe(): Stripe | null {
  // Return cached instance if available
  if (stripeInstance) {
    return stripeInstance;
  }
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.warn('Missing STRIPE_SECRET_KEY environment variable');
    return null;
  }
  
  // Create and cache the Stripe instance
  stripeInstance = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia',
    appInfo: {
      name: 'VoicemailAI',
      version: '1.0.0',
    },
  });
  
  return stripeInstance;
}

// For backwards compatibility, export default as getStripe
export default getStripe; 