import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return new NextResponse(
        JSON.stringify({ error: 'Session ID is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return new NextResponse(
      JSON.stringify(session), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error retrieving session:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 