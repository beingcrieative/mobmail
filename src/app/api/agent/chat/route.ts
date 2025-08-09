import { NextRequest, NextResponse } from 'next/server';
import { securitySanitization } from '@/lib/security/sanitization';

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
  context?: Partial<AgentContext> & {
    onboardingSpec?: {
      enabled: boolean;
      targetFields: string[];
      current?: Record<string, string>;
    }
  };
}

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
    // Get user identifier for rate limiting (from IP if no user ID available)
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const identifier = `${userIp}-${userAgent.substring(0, 20)}`;

    // Check rate limiting first
    const rateLimitCheck = securitySanitization.checkRateLimit(
      identifier, 
      'agent-chat'
    );

    if (!rateLimitCheck.allowed) {
      securitySanitization.logSecurityEvent({
        type: 'rate_limit',
        endpoint: '/api/agent/chat',
        severity: 'medium',
        details: { identifier, resetTime: rateLimitCheck.resetTime }
      });

      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitCheck.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
            'X-RateLimit-Reset': rateLimitCheck.resetTime.toString()
          }
        }
      );
    }

    // Parse and validate request body
    const body: ChatRequest = await request.json();
    
    // Validate request structure
    const validationResult = securitySanitization.validateAgentChatRequest.safeParse(body);
    if (!validationResult.success) {
      securitySanitization.logSecurityEvent({
        type: 'validation_failure',
        endpoint: '/api/agent/chat',
        severity: 'medium',
        details: { errors: validationResult.error.errors }
      });

      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { message, sessionId, context } = validationResult.data;

    // Sanitize and validate user input
    const sanitizedInput = securitySanitization.sanitizePromptInput(message);
    
    if (sanitizedInput.blocked) {
      securitySanitization.logSecurityEvent({
        type: 'injection_attempt',
        endpoint: '/api/agent/chat',
        severity: 'high',
        details: { reason: sanitizedInput.reason, originalLength: message.length }
      });

      return NextResponse.json(
        { 
          error: 'Input contains potentially harmful content',
          message: 'Sorry, ik kan je bericht niet verwerken. Probeer een andere formulering.'
        },
        { status: 400 }
      );
    }

    // Use Google Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('GEMINI_API_KEY missing');
      return NextResponse.json({
        message: 'AI-assistent niet beschikbaar (configuratie ontbreekt).',
        actions: [],
        sessionId,
        timestamp: Date.now(),
        fallback: true
      });
    }

    // Build context string for the AI
    const businessContext = context?.business ? `
BUSINESS INFORMATIE:
- Naam: ${context.business.name}
- Diensten: ${context.business.services?.join(', ') || 'Niet gespecificeerd'}
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

    const onboardingContext = context?.onboardingSpec?.enabled ? `
ONBOARDING DOEL:
Je voert een korte, efficiënte onboarding uit. Verzamel uitsluitend de gevraagde velden en stel alleen noodzakelijke vervolgvraag wanneer iets onduidelijk is. Houd het gesprek kort en professioneel.

TE VERZAMELEN VELDEN (exacte sleutels): ${context.onboardingSpec.targetFields.join(', ')}
HUIDIGE WAARDEN (indien aanwezig): ${context.onboardingSpec.current ? JSON.stringify(context.onboardingSpec.current) : '{}'}

ANTWOORDFORMAT (JSON):
{
  "message": "Korte, behulpzame NL-tekst",
  "onboarding": {
    "fields": { /* subset van velden met ingevulde waarden */ },
    "missing": [ /* nog benodigde velden */ ],
    "readyToSave": boolean
  },
  "actions": []
}

WEGWIJZER:
- Vraag maximaal één ding tegelijk.
- Hergebruik bestaande waarden; vraag niet opnieuw wat al bekend is.
- Wanneer readyToSave true is, is de dataset minimaal compleet (name, mobileNumber) en mag opgeslagen worden.
` : '';

    const fullContext = `${businessContext}${recentTranscriptionsContext}${activeActionsContext}${onboardingContext}`;

    // Build Gemini request payload (REST)
    const systemInstruction = `${AGENT_SYSTEM_PROMPT}${fullContext ? `\n\nCONTEXT:\n${fullContext}` : ''}`;
    const geminiBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: sanitizedInput.sanitizedInput }]
        }
      ],
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        response_mime_type: 'application/json'
      }
    } as any;

    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify(geminiBody)
    });

    if (!geminiRes.ok) {
      const errTxt = await geminiRes.text();
      throw new Error(`Gemini API error: ${geminiRes.status} ${errTxt}`);
    }

    const geminiJson = await geminiRes.json();
    const aiResponse = extractGeminiText(geminiJson);

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Try to parse JSON response, fallback to plain text
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // Try to extract fenced JSON
      const fenced = extractFencedJson(aiResponse);
      if (fenced) {
        parsedResponse = fenced;
      } else {
        // Extract first line as message if no valid JSON
        const fallbackMsg = (aiResponse || '').split('\n').slice(0, 2).join(' ').trim() || 'Ik ben er. Zullen we beginnen met je naam en mobiele nummer?';
        parsedResponse = { message: fallbackMsg, actions: [] };
      }
    }

    // Validate response structure
    if (!parsedResponse.message) {
      parsedResponse.message = aiResponse;
    }
    if (!Array.isArray(parsedResponse.actions)) {
      parsedResponse.actions = [];
    }

    // Sanitize AI response content
    parsedResponse.message = securitySanitization.sanitizeAiResponse(parsedResponse.message);
    
    // Sanitize action content
    if (parsedResponse.actions && Array.isArray(parsedResponse.actions)) {
      parsedResponse.actions = parsedResponse.actions.map((action: any) => ({
        ...action,
        title: securitySanitization.sanitizeHtml(action.title || '', { allowedTags: [] }),
        description: securitySanitization.sanitizeHtml(action.description || '', { allowedTags: [] }),
        content: securitySanitization.sanitizeHtml(action.content || '', { allowedTags: ['p', 'br'] })
      }));
    }

    const response = NextResponse.json({
      message: parsedResponse.message,
      actions: parsedResponse.actions,
      onboarding: parsedResponse.onboarding || null,
      sessionId,
      timestamp: Date.now()
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-RateLimit-Remaining', rateLimitCheck.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitCheck.resetTime.toString());

    return response;

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
    model: 'gemini-2.5-flash',
    timestamp: Date.now()
  });
}

function extractGeminiText(json: any): string {
  try {
    const parts = json?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => p?.text ?? '').join(' ').trim();
    }
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string' ? text : '';
  } catch {
    return '';
  }
}

function extractFencedJson(text: string): any | null {
  try {
    if (!text) return null;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenceMatch ? fenceMatch[1] : text;
    const trimmed = candidate.trim();
    if (!trimmed) return null;
    // Remove potential trailing commas
    const safe = trimmed.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(safe);
  } catch {
    return null;
  }
}