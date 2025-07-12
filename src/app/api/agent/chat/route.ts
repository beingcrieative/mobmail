import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface AgentContext {
  business: {
    name: string;
    services: string[];
    pricing: Record<string, number>;
    availability: string;
    contact: string;
  };
  recentTranscriptions?: any[];
  activeActions?: any[];
  customerHistory?: any[];
}

interface ChatRequest {
  message: string;
  sessionId: string;
  context?: Partial<AgentContext>;
}

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API,
});

const AGENT_SYSTEM_PROMPT = `Je bent een AI business assistant voor een Nederlandse ZZP'er. Je rol is om te helpen met:

1. KLANTENSERVICE: Beantwoord vragen over diensten, prijzen en beschikbaarheid
2. ACTIE GENERATIE: Maak concrete acties voor de ZZP'er op basis van gesprekken
3. BUSINESS MANAGEMENT: Help met planning, follow-ups en administratie

GEDRAGSREGELS:
- Spreek Nederlands en wees professioneel maar toegankelijk
- Genereer altijd concrete, uitvoerbare acties
- Gebruik de business context om accurate antwoorden te geven
- Wees proactief in het voorstellen van vervolgstappen

ACTIE TYPES die je kunt genereren:
- callback: Terugbel instructies met specifieke timing
- email: Email concepten met volledige content
- meeting: Afspraak voorstellen met agenda punten
- quote: Offerte concepten met pricing details
- reminder: Follow-up reminders voor belangrijke zaken
- knowledge_update: Updates voor de business kennisbank

Antwoord altijd in dit JSON format:
{
  "message": "Je antwoord aan de ZZP'er",
  "actions": [
    {
      "type": "callback|email|meeting|quote|reminder|knowledge_update",
      "title": "Korte titel",
      "description": "Gedetailleerde beschrijving",
      "customerName": "Naam klant (indien van toepassing)",
      "priority": "high|medium|low",
      "suggestedTiming": "Wanneer dit moet gebeuren",
      "content": "Specifieke content zoals email tekst of offerte details"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId, context } = body;

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Build context string for the AI
    const businessContext = context?.business ? `
BUSINESS INFORMATIE:
- Naam: ${context.business.name}
- Diensten: ${context.business.services.join(', ')}
- Prijzen: ${JSON.stringify(context.business.pricing)}
- Beschikbaarheid: ${context.business.availability}
- Contact: ${context.business.contact}
` : '';

    const recentTranscriptionsContext = context?.recentTranscriptions?.length ? `
RECENTE GESPREKKEN:
${context.recentTranscriptions.map(t => 
  `- ${t.customerName}: ${t.transcriptSummary}`
).join('\n')}
` : '';

    const activeActionsContext = context?.activeActions?.length ? `
ACTIEVE ACTIES:
${context.activeActions.map(a => 
  `- ${a.title}: ${a.description}`
).join('\n')}
` : '';

    const fullContext = `${businessContext}${recentTranscriptionsContext}${activeActionsContext}`;

    // Call OpenRouter with Gemini
    const completion = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5-8b",
      messages: [
        {
          role: "system",
          content: AGENT_SYSTEM_PROMPT + (fullContext ? `\n\nCONTEXT:\n${fullContext}` : '')
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Try to parse JSON response, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // If not valid JSON, create a simple response
      parsedResponse = {
        message: aiResponse,
        actions: []
      };
    }

    // Validate response structure
    if (!parsedResponse.message) {
      parsedResponse.message = aiResponse;
    }
    if (!Array.isArray(parsedResponse.actions)) {
      parsedResponse.actions = [];
    }

    return NextResponse.json({
      message: parsedResponse.message,
      actions: parsedResponse.actions,
      sessionId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    
    // Provide a graceful fallback response
    return NextResponse.json({
      message: "Sorry, ik ondervind momenteel technische problemen. Probeer het over een moment opnieuw.",
      actions: [],
      error: true
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'Agent API is running',
    model: 'google/gemini-flash-1.5-8b',
    timestamp: Date.now()
  });
}