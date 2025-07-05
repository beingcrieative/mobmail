import { Stripe } from 'stripe';

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(stripeKey || '', {
  apiVersion: '2025-02-24.acacia',
  appInfo: {
    name: 'VoicemailAI',
    version: '1.0.0',
  },
});

export default stripe; 