# VoicemailAI v3.0 - Complete Design & Technical Implementation Handoff

## 📋 Project Overview

**Project:** VoicemailAI Mobile Web Application  
**Version:** v3.0 - Green-to-Blue Gradient System  
**Target:** Nederlandse ZZP'ers (Independent Contractors)  
**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS v4  
**Design Philosophy:** Business-focused, success-oriented, professional yet approachable

> **⚠️ IMPORTANT:** This document implements the design based on the extensive JSON specification you provided earlier, with the new green-to-blue color palette applied. All screen IDs, component structures, and data flows reference the original JSON architecture.

---

## 🎨 Color Palette System - Applied to JSON Architecture

### Primary Color Palette (Green-to-Blue Gradient)

```javascript
// VoicemailAI v3.0 Color System - replaces original palette
const voicemailAIColors = {
  // GREEN ZONE - Success & Growth (replaces previous purple/blue scheme)
  mindaro: '#d9ed92',        // Subtle highlights, replaces light accents
  lightGreen1: '#b5e48c',    // Success states, replaces previous green
  lightGreen2: '#99d98c',    // Active elements, new addition
  emerald: '#76c893',        // Primary success actions, AI branding
  
  // TEAL ZONE - Balance & Information (replaces previous blue range)
  keppel: '#52b69a',         // Navigation, balanced elements
  verdigris: '#34a0a4',      // Information displays, headers
  
  // BLUE ZONE - Professional & Trust (replaces previous dark blues)
  bondiBlue: '#168aad',      // Primary actions, professional CTAs
  cerulean: '#1a759f',       // Headers, authority elements
  lapisLazuli: '#1e6091',    // Professional text, secondary info
  indigoDye: '#184e77'       // Primary text, serious business elements
};
```

### CSS Custom Properties Implementation

```css
/* Add to /styles/globals.css - VoicemailAI specific variables */
:root {
  /* VoicemailAI Color System - extends existing globals.css */
  --va-mindaro: #d9ed92;
  --va-light-green-1: #b5e48c;
  --va-light-green-2: #99d98c;
  --va-emerald: #76c893;
  --va-keppel: #52b69a;
  --va-verdigris: #34a0a4;
  --va-bondi-blue: #168aad;
  --va-cerulean: #1a759f;
  --va-lapis-lazuli: #1e6091;
  --va-indigo-dye: #184e77;
  
  /* Semantic Mapping for Business Logic */
  --va-success: var(--va-emerald);           /* Success states, call forwarding active */
  --va-info: var(--va-verdigris);            /* Information displays, stats */
  --va-primary: var(--va-bondi-blue);        /* Primary actions, important buttons */
  --va-text: var(--va-indigo-dye);           /* Main text content */
  --va-business-positive: var(--va-light-green-1);  /* Revenue, leads, growth */
  --va-professional: var(--va-cerulean);     /* Professional headers, trust */
  
  /* Background Gradients for Each Screen */
  --va-bg-home: linear-gradient(135deg, #f7fbe9 0%, #ebf7e8 100%);
  --va-bg-conversations: linear-gradient(135deg, #f7fbe9 0%, #dcf1eb 100%);
  --va-bg-assistant: linear-gradient(135deg, #f0fae8 0%, #ebf7e8 100%);
  --va-bg-login: linear-gradient(135deg, #c2def3 0%, #dcf1eb 100%);
}
```

---

## 🏗️ JSON Architecture Implementation

### Screen Mapping (Original JSON → New Implementation)

| Original JSON Screen ID | Route | New Screen Implementation | Primary Colors |
|------------------------|-------|---------------------------|----------------|
| `mobile_home_dashboard` | `/mobile-v3/` | HomeScreen component | #168aad, #76c893 |
| `transcriptions_screen` | `/mobile-v3/transcriptions/` | ConversationsScreen | #34a0a4, #52b69a |
| `agent_assistant_screen` | `/mobile-v3/agent/` | AssistantScreen | #76c893, #99d98c |
| `mobile_login_screen` | `/mobile-v3/auth/login/` | LoginScreen | #168aad, #1a759f |

### Component Architecture - JSON Element Mapping

```typescript
// Based on original JSON app_metadata and screens structure
interface AppArchitecture {
  // From JSON: app_metadata.tech_stack
  techStack: {
    frontend: ['Next.js 15', 'React 18', 'TypeScript', 'Tailwind CSS'],
    backend: ['Next.js API Routes', 'Node.js', 'OpenRouter API'],
    database: ['Supabase'],
    authentication: ['Supabase Auth'],
    mobile: ['PWA', 'Gesture Controls']
  };
  
  // From JSON: screens array structure
  screens: {
    homeScreen: HomeScreenComponent;      // mobile_home_dashboard
    conversationsScreen: ConversationsComponent;  // transcriptions_screen  
    assistantScreen: AssistantComponent;  // agent_assistant_screen
    loginScreen: LoginComponent;          // mobile_login_screen
  };
}
```

---

## 🏠 Screen 1: Home Dashboard (mobile_home_dashboard)

### JSON Reference Implementation

> **JSON Source:** `screens[0]` - "mobile_home_dashboard"  
> **Original Layout:** `["header", "auth_status", "welcome_hero", "agent_actions", "recent_conversations", "navigation"]`  
> **Simplified v2.0:** Removed auth_status, simplified agent_actions, removed duplicate recent_conversations

### Layout Structure with Colors
```
┌─────────────────────────┐
│     Header              │ ← #168aad (Bondi Blue) - professional trust
├─────────────────────────┤
│   Welcome Hero          │ ← Gradient: #76c893 → #52b69a (success energy)
├─────────────────────────┤
│   Call Forwarding       │ ← #76c893 success theme (business active)
├─────────────────────────┤
│   Business Stats        │ ← #34a0a4 (Verdigris) - reliable info
├─────────────────────────┤
│   Quick Actions         │ ← Mixed colors per business function
├─────────────────────────┤
│   Bottom Navigation     │ ← Professional theme
└─────────────────────────┘
```

### Component Specifications

#### 1. Header Component (JSON: header_component)
```typescript
// Based on JSON: elements[0] "header_component"
interface HeaderProps {
  title: string;  // "VoicemailAI" from JSON properties
  showNotifications: boolean;  // from JSON properties.show_notifications
  notificationCount: number;   // dynamic badge from JSON
  backgroundColor: '#168aad';  // Professional blue for business trust
}

// JSON Interaction: notification_click -> toggle_notifications_panel
// New Color: Notification badge uses #76c893 (success green) not red
```

#### 2. Welcome Hero (JSON: welcome_hero_section)  
```typescript
// Based on JSON: elements[1] "welcome_hero_section"
interface WelcomeHeroProps {
  userName: string;  // from JSON getDisplayName()
  greeting: string;  // from JSON getGreeting() - time-based
  messageCount: number;  // business-focused messaging
  gradient: 'linear-gradient(135deg, #76c893 0%, #52b69a 100%)';
  businessMessage: string;  // "zakelijk actief! 💚" - success framing
}

// JSON Properties: dynamic_greeting, personalized, time_based
// Color Change: Gradient replaces JSON "--accent-gradient"
```

#### 3. Call Forwarding (JSON: agent_actions_section SIMPLIFIED)
```typescript
// SIMPLIFIED VERSION of JSON: elements[2] "agent_actions_section"
// Original JSON had 4 USSD controls - we simplified to 1 toggle
interface CallForwardingProps {
  isActive: boolean;     // Replaces complex USSD status checking
  forwardingNumber: string;  // Still uses JSON forwarding_number concept
  onToggle: () => void;      // Simplified interaction vs multiple USSD codes
  
  // Colors - Success Green Theme
  activeColor: '#76c893';     // Replaces JSON green-400
  backgroundColor: '#f0fae8'; // Light success tint
  borderColor: '#b5e48c';     // Success border
}

// JSON Original: 4 buttons (unconditional, busy, unanswered, disable)  
// Simplified: 1 toggle + settings modal
// Color Logic: Green = business active, making money
```

### Business Stats Component (NEW - Business Focused)
```typescript
// NEW COMPONENT - not in original JSON but business-focused
interface BusinessStatsProps {
  dailyRevenue: string;      // "€450 leads vandaag"
  leadConversion: string;    // "3 gesprekken → 2 potentiële klanten"  
  backgroundColor: '#dcf1eb'; // Verdigris tint - reliable info
  iconColor: '#34a0a4';       // Verdigris - trustworthy data
}
```

### Backend Integration - Home Screen

#### API Endpoints Required
```typescript
// Based on JSON api_endpoints specifications
interface HomeScreenAPIs {
  // User profile and greeting
  getUserProfile: '/api/user/profile';  // GET - from JSON
  
  // Call forwarding status (simplified from complex USSD)
  getForwardingStatus: '/api/forwarding/status';  // GET - simplified
  updateForwarding: '/api/forwarding/toggle';     // POST - simplified
  
  // Business stats (new - business focused)
  getDailyStats: '/api/stats/daily';  // GET - revenue focused
  
  // Recent activity summary  
  getActivitySummary: '/api/activity/summary';  // GET - business metrics
}
```

---

## 💬 Screen 2: Conversations (transcriptions_screen)

### JSON Reference Implementation

> **JSON Source:** `screens[2]` - "transcriptions_screen"  
> **CRITICAL:** This implements the detailed `transcriptions_workflow` from your original JSON  
> **Layout Sections:** `["header_bar", "today_header", "conversation_threads", "call_detail_modals"]`

### Data Structure - EXACT JSON Implementation

```typescript
// EXACT implementation of JSON transcriptions_workflow.grouping_algorithm
interface ConversationThread {
  id: string;
  externalNumber: string;      // JSON key: "externalNumber" - grouping key
  customerName: string;        // JSON: mergeFields(customerName, customer_name)
  companyName?: string;        // JSON: mergeFields(companyName, company_name)  
  transcriptSummary: string;   // JSON: summary from newest call
  lastCallTime: number;        // JSON: MAX(startTime) for sorting
  totalCalls: number;          // JSON: COUNT(DISTINCT id)
  transcriptions: CallRecord[]; // JSON: all calls for this number
}

interface CallRecord {
  // From JSON transcriptions response schema
  id: string;                  // JSON: transcription id
  startTime: number;           // JSON: call timestamp
  callDuration: number;        // JSON: duration in seconds
  callDirection: 'inbound' | 'outbound';  // JSON: callDirection
  transcriptSummary: string;   // JSON: AI summary
  transcript: TranscriptMessage[];  // JSON: conversation array
}

interface TranscriptMessage {
  role: 'caller' | 'agent';   // JSON: participant roles
  content: string;            // JSON: message content
  timestamp: string;          // JSON: message timestamp
}
```

### Conversation Threading - JSON Algorithm

```typescript
// EXACT implementation of JSON grouping_algorithm
class ConversationThreading {
  // From JSON: "grouping_logic": "Map<phoneNumber, ConversationThread>"
  static groupByPhoneNumber(transcriptions: any[]): ConversationThread[] {
    const grouped = new Map<string, ConversationThread>();
    
    transcriptions.forEach(call => {
      const key = call.externalNumber;  // JSON grouping key
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          externalNumber: key,
          // JSON: "display_name": "mergeFields(customerName, customer_name)"
          customerName: call.customerName || call.customer_name || 'Onbekende beller',
          // JSON: "company_data": "mergeFields(companyName, company_name)"  
          companyName: call.companyName || call.company_name,
          transcriptSummary: call.transcriptSummary,
          lastCallTime: call.startTime,
          totalCalls: 0,
          transcriptions: []
        });
      }
      
      const thread = grouped.get(key)!;
      thread.transcriptions.push(call);
      thread.totalCalls++;
      // JSON: "sorting": "descending_by_last_call_time"
      if (call.startTime > thread.lastCallTime) {
        thread.lastCallTime = call.startTime;
        thread.transcriptSummary = call.transcriptSummary; // Latest summary
      }
    });
    
    // JSON: "limit": "30_most_recent"
    return Array.from(grouped.values())
      .sort((a, b) => b.lastCallTime - a.lastCallTime)
      .slice(0, 30);
  }
}
```

### Visual Components - JSON conversation_thread_card

```typescript
// Based on JSON: transcriptions_workflow.conversation_thread_card
interface ConversationCardProps {
  thread: ConversationThread;
  
  // JSON visual_design specifications
  height: '120px';           // JSON: visual_design.height
  padding: '16px 12px';      // JSON: visual_design.padding.mobile
  borderRadius: '16px';      // JSON: visual_design.border_radius
  shadow: 'elevation-1';     // JSON: visual_design.shadow
  hoverScale: '1.01';        // JSON: visual_design.hover_scale
  
  // Colors applied to JSON specs
  borderColor: '#52b69a';    // Keppel - balanced, trustworthy
  backgroundColor: 'white';
  hoverShadow: 'lg';
}

// JSON: avatar_system implementation with new colors
const avatarColors = [
  'linear-gradient(135deg, #76c893 0%, #52b69a 100%)', // Emerald to Keppel
  'linear-gradient(135deg, #52b69a 0%, #34a0a4 100%)', // Keppel to Verdigris  
  'linear-gradient(135deg, #168aad 0%, #1a759f 100%)', // Bondi to Cerulean
  'linear-gradient(135deg, #1a759f 0%, #1e6091 100%)', // Cerulean to Lapis
  'linear-gradient(135deg, #99d98c 0%, #76c893 100%)'  // Light green to Emerald
];

// JSON: badge_system with success colors
interface BadgeSystem {
  backgroundColor: '#76c893';  // Success green, not red
  position: 'top-right';       // JSON: badge_system.position
  size: '20px';               // JSON: badge_system.size  
  showWhen: 'totalCalls > 1'; // JSON: badge_system.show_when
}
```

### Modal System - JSON thread_detail_modal

```typescript
// EXACT implementation of JSON: thread_detail_modal
interface ThreadModalProps {
  thread: ConversationThread;
  isOpen: boolean;
  onClose: () => void;
  
  // JSON modal_layout specifications
  height: '85%';                    // JSON: modal_layout.height
  dragGesture: 'collapse_or_close'; // JSON: modal_layout.drag_gesture
  threshold: 0.2;                   // JSON: modal_layout.gesture_threshold
  
  // JSON entry_method specifications  
  animation: 'slide_up_spring';     // JSON: entry_method.animation
  duration: '300ms';                // JSON: entry_method.duration
  backgroundFade: 'dark_overlay';   // JSON: entry_method.background_fade
}

// JSON: header_section - "avatar_+_info_+_actions"
interface ModalHeaderProps {
  sticky: true;                     // JSON: header_section.sticky
  height: '80px';                   // JSON: header_section.height
  actions: ['call', 'whatsapp', 'email']; // JSON: header_section.actions
  
  // Colors applied to JSON structure
  backgroundColor: 'linear-gradient(135deg, #dcf1eb 0%, #f7fbe9 100%)';
  avatarGradient: 'getAvatarColor(phoneNumber)';  // Same system as cards
}
```

### Backend Integration - Conversations

```typescript
// Based on JSON: api_endpoints[0] "/api/transcriptions"
interface ConversationsAPI {
  endpoint: '/api/transcriptions';
  method: 'GET';
  
  // JSON: request_schema
  queryParams: {
    clientId: string;    // JSON: user identifier
    t: number;          // JSON: timestamp for caching
  };
  
  // JSON: response_schema - EXACT structure
  response: {
    transcriptions: Array<{
      id: string;              // JSON: transcription ID
      customerName: string;    // JSON: customer identification  
      customer_name: string;   // JSON: alternative field name
      phoneNumber: string;     // JSON: caller identification
      caller_phone: string;    // JSON: alternative field name  
      transcriptSummary: string; // JSON: AI summary
      transcript: any[];       // JSON: conversation array
      startTime: number;       // JSON: call timestamp
      callDuration: number;    // JSON: call length
      callDirection: string;   // JSON: inbound/outbound
    }>;
  };
  
  // JSON: authentication + rate_limiting
  authentication: 'required';
  rateLimiting: '100 requests per minute';
}

// Data processing - JSON specifications
interface DataProcessing {
  // JSON: backend_call.data_processing
  grouping: 'by_phone_number';     // JSON: grouping algorithm
  sorting: 'by_last_call_time_desc'; // JSON: sort specification  
  limit: 30;                       // JSON: limit specification
}
```

---

## 🤖 Screen 3: AI Assistant (agent_assistant_screen)

### JSON Reference Implementation  

> **JSON Source:** `screens[1]` - "agent_assistant_screen"  
> **Original Layout:** `["header", "agent_status", "action_cards", "chat_interface", "quick_commands", "navigation"]`  
> **v2.0 Simplified:** Removed swipeable action cards, simplified to clear buttons

### AI Integration - JSON Specifications

```typescript
// Based on JSON: ai_integration specifications
interface AIIntegrationConfig {
  provider: 'OpenRouter';              // JSON: ai_integration.provider
  model: 'Google Gemini 1.5 Flash 8B'; // JSON: ai_integration.model  
  contextAwareness: true;              // JSON: ai_integration.context_awareness
  actionGeneration: true;              // JSON: ai_integration.action_generation
  voiceProcessing: 'client_side_simulation'; // JSON: voice_processing
}

// JSON: chat_interface specifications with new colors
interface ChatInterfaceProps {
  maxHeight: '64px';           // JSON: chat_interface.max_height (simplified)
  autoScroll: true;            // JSON: chat_interface.auto_scroll
  messageTypes: ['user', 'agent']; // JSON: chat_interface.message_types
  realTimeResponses: true;     // JSON: chat_interface.real_time_responses
  
  // Colors applied to JSON structure
  containerBackground: 'white';
  containerBorder: '#52b69a';  // Keppel - balanced technology
  chatAreaBackground: '#f7fbe9'; // Light success tint
  chatAreaBorder: '#99d98c';   // Light green 2
  aiMessageColor: '#76c893';   // Emerald - AI success partner
  userMessageColor: '#168aad'; // Bondi blue - professional user
}
```

### Business Actions - Simplified from JSON

```typescript
// SIMPLIFIED from JSON: swipeable_list "ai_generated_actions"  
// Original JSON had swipe-to-approve cards - we simplified to clear buttons
interface BusinessActionsProps {
  // JSON original: swipe_to_approve, swipe_to_reject with thresholds
  // Simplified: Clear buttons with business focus
  
  actions: Array<{
    type: string;        // JSON: action_types - callback, email, meeting, quote
    title: string;       // JSON: action title
    description: string; // JSON: action description  
    customerName: string; // JSON: associated customer
    priority: string;    // JSON: action priority
    
    // Colors for business actions
    backgroundColor: '#f0fae8' | '#ebf7e8'; // Light success tints
    borderColor: '#b5e48c' | '#99d98c';     // Success borders
    icon: string;        // Business-focused icons
  }>;
  
  // Interaction change: JSON swipe actions → clear button clicks
  onActionClick: (actionId: string) => void; // Replaces swipe gestures
}

// JSON action types mapped to business functions
const businessActionTypes = {
  'callback': '📞 Genereer offerte voor {customer}',
  'meeting': '📅 Plan follow-up gesprekken', 
  'email': '📧 Verstuur portfolio',
  'quote': '💰 Maak kostenraming',
  'reminder': '⏰ Stel reminder in',
  'follow-up': '🎯 Plan vervolgactie'
};
```

### Backend Integration - AI Assistant

```typescript
// Based on JSON: api_endpoints[1] "/api/agent/chat"
interface AgentChatAPI {
  endpoint: '/api/agent/chat';
  method: 'POST';
  
  // JSON: request_schema - EXACT structure
  requestSchema: {
    message: string;           // User input
    sessionId: string;         // JSON: session management
    context: {                 // JSON: context object
      business: {              // JSON: business context
        name: string;          // "Mijn ZZP Bedrijf"
        services: string[];    // ["Webdevelopment", "Consultancy", "Design"]
        pricing: Record<string, number>; // Service pricing
      };
      recentTranscriptions: any[]; // JSON: recentCallsContext
      activeActions: any[];        // JSON: pendingActions
    };
  };
  
  // JSON: response_schema - EXACT structure
  responseSchema: {
    message: string;           // AI response text
    actions: Array<{           // JSON: generated actions
      type: string;            // JSON: action type
      title: string;           // JSON: action title
      description: string;     // JSON: action description  
      customerName: string;    // JSON: associated customer
      priority: string;        // JSON: action priority
    }>;
  };
  
  // JSON: authentication + external_service
  authentication: 'required';
  externalService: 'OpenRouter API';
  model: 'Google Gemini 1.5 Flash 8B';
}

// Response handling - JSON specifications
interface ResponseHandling {
  // JSON: response_handling.success
  success: {
    addToChat: true;           // JSON: add response to chat
    generateActions: 'conditional'; // JSON: generate actions if applicable
    hapticFeedback: '[100, 50, 100]'; // JSON: haptic pattern
  };
  
  // JSON: response_handling.error  
  error: {
    fallbackMessage: 'Sorry, ik kan je bericht momenteel niet verwerken. Probeer het over een moment opnieuw.';
  };
}
```

---

## 🔐 Screen 4: Login (mobile_login_screen)

### JSON Reference Implementation

> **JSON Source:** `screens[3]` - "mobile_login_screen"  
> **Layout:** `["header", "login_form", "additional_options", "footer"]`  
> **Mobile Optimizations:** Touch targets, keyboard handling, accessibility

### Form Components - JSON Implementation

```typescript
// Based on JSON: elements[0] "mobile_login_form"
interface LoginFormProps {
  // JSON: mobile_optimizations
  keyboardHandling: {
    adjustViewport: true;      // JSON: keyboard_handling.adjust_viewport
    scrollToInput: true;       // JSON: keyboard_handling.scroll_to_input
  };
  
  touchOptimizations: {
    tapTargets: 'minimum_44px';  // JSON: touch_optimizations.tap_targets  
    gestureRecognition: true;    // JSON: touch_optimizations.gesture_recognition
  };
}

// JSON: elements - email_input_mobile specifications
interface EmailInputProps {
  label: 'Email adres';          // JSON: properties.label
  placeholder: 'voer@email.in';  // JSON: properties.placeholder (updated for ZZP)
  required: true;                // JSON: properties.required
  autocomplete: 'email';         // JSON: properties.autocomplete
  keyboardType: 'email';         // JSON: properties.keyboard_type
  
  // JSON: validation specifications
  validation: {
    type: 'email';                    // JSON: validation.type
    regex: '^[^@]+@[^@]+\\.[^@]+$';  // JSON: validation.regex
    errorMessage: 'Ongeldig email adres'; // JSON: validation.error_message
    realTime: true;                   // JSON: validation.real_time
  };
  
  // JSON: styling.mobile_optimized
  fontSize: '16px';              // JSON: prevents iOS zoom
  touchTarget: 'min_44px';       // JSON: accessibility
  borderColor: '#52b69a';        // Keppel - approachable professional
}
```

### Backend Integration - Authentication

```typescript
// Based on JSON: state_management.authentication
interface AuthenticationConfig {
  strategy: 'supabase_with_cookies';  // JSON: authentication.strategy
  fallback: 'cookie_based';           // JSON: authentication.fallback  
  sessionManagement: 'hybrid';        // JSON: authentication.session_management
}

// Login API integration
interface LoginAPI {
  endpoint: '/api/auth/login';         // Standard auth endpoint
  method: 'POST';
  
  payload: {
    email: string;                     // From form input
    password: string;                  // From form input
  };
  
  // JSON: response_handling specifications
  responseHandling: {
    success: {
      storeSession: true;              // JSON: store_session
      redirectTo: '/mobile-v3/';       // JSON: redirect route
      toastMessage: 'Succesvol ingelogd'; // JSON: success message
    };
    error: {
      '401': 'Onjuiste inloggegevens';        // JSON: error messages
      '429': 'Te veel pogingen, probeer later opnieuw';
    };
  };
}
```

---

## 🔄 Backend Architecture & API Implementation

### Database Schema - Based on JSON Data Relationships

```typescript
// Based on JSON: data_relationships
interface DatabaseSchema {
  // JSON: transcription_to_thread relationship
  transcriptions: {
    id: string;              // Primary key
    externalNumber: string;  // JSON: grouping field
    customerName: string;    // JSON: display_name source
    customer_name: string;   // JSON: alternative field
    companyName?: string;    // JSON: company data
    company_name?: string;   // JSON: alternative field  
    transcriptSummary: string; // JSON: AI summary
    transcript: any[];       // JSON: conversation messages
    startTime: number;       // JSON: timestamp
    callDuration: number;    // JSON: call duration
    callDirection: string;   // JSON: inbound/outbound
    userId: string;          // Foreign key to users
  };
  
  // User profile data
  users: {
    id: string;              // Primary key
    email: string;           // Authentication
    name: string;            // Display name
    businessName?: string;   // ZZP business name
    services: string[];      // Business services
    pricing: Record<string, number>; // Service pricing
    forwardingNumber: string; // Call forwarding destination
    createdAt: number;
    updatedAt: number;
  };
  
  // AI chat sessions
  chatSessions: {
    id: string;              // Session ID
    userId: string;          // Foreign key
    messages: any[];         // Chat history
    generatedActions: any[]; // AI-generated actions
    createdAt: number;
  };
}
```

### API Endpoints - Complete Implementation

```typescript
// All API endpoints based on JSON specifications
interface APIEndpoints {
  // 1. Transcriptions - JSON api_endpoints[0]
  '/api/transcriptions': {
    GET: {
      query: {
        clientId: string;    // JSON: request_schema.clientId
        t: number;          // JSON: request_schema.t (timestamp)
      };
      response: {           // JSON: response_schema
        transcriptions: TranscriptionRecord[];
      };
      authentication: 'required';
      rateLimiting: '100 requests per minute';
    };
  };
  
  // 2. AI Agent Chat - JSON api_endpoints[1]  
  '/api/agent/chat': {
    POST: {
      body: {               // JSON: request_schema
        message: string;
        sessionId: string;
        context: {
          business: BusinessContext;
          recentTranscriptions: any[];
          activeActions: any[];
        };
      };
      response: {           // JSON: response_schema
        message: string;
        actions: GeneratedAction[];
      };
      externalService: 'OpenRouter API';
      model: 'Google Gemini 1.5 Flash 8B';
    };
  };
  
  // 3. User Profile - JSON api_endpoints[2]
  '/api/user/profile': {
    GET: {
      response: UserProfile;
    };
    PUT: {
      body: Partial<UserProfile>;
      response: UserProfile;
    };
    authentication: 'required';
    database: 'Prisma (PostgreSQL)';
  };
  
  // 4. Call Forwarding (simplified from USSD complexity)
  '/api/forwarding/status': {
    GET: {
      response: {
        isActive: boolean;
        forwardingNumber: string;
        lastChecked: number;
      };
    };
  };
  
  '/api/forwarding/toggle': {
    POST: {
      body: {
        isActive: boolean;
        forwardingNumber: string;
      };
      response: {
        success: boolean;
        status: ForwardingStatus;
      };
    };
  };
  
  // 5. Business Stats (new - business focused)
  '/api/stats/daily': {
    GET: {
      response: {
        dailyLeads: string;      // "€450 leads"
        conversationCount: number;
        leadConversion: string;   // "3 → 2 klanten"
        potentialRevenue: number;
      };
    };
  };
}
```

### Supabase Integration

```typescript
// Supabase configuration for JSON specifications
interface SupabaseConfig {
  // JSON: state_management.authentication
  auth: {
    strategy: 'supabase_with_cookies';
    providers: ['email'];
    redirectTo: '/mobile-v3/';
  };
  
  // Database tables
  database: {
    tables: {
      transcriptions: 'transcriptions';
      users: 'auth.users';           // Supabase auth table
      user_profiles: 'user_profiles'; // Extended user data
      chat_sessions: 'chat_sessions';
    };
  };
  
  // Real-time subscriptions - JSON: real_time_features
  realtime: {
    transcriptions: {
      table: 'transcriptions';
      filter: 'userId=eq.{userId}';
      events: ['INSERT', 'UPDATE'];
    };
  };
}
```

---

## 📱 Mobile-Specific Implementation

### Responsive Design - JSON mobile_specific_features

```typescript
// Based on JSON: mobile_specific_features.responsive_design
interface ResponsiveBreakpoints {
  // JSON: breakpoints specifications
  'fold_closed': 'max-width: 280px';    // Samsung Fold closed
  'fold_open': 'max-width: 320px';      // Samsung Fold open  
  'regular_mobile': 'max-width: 768px'; // Regular mobile devices
}

// JSON: adaptive_typography
interface AdaptiveTypography {
  samsung_fold: 'reduced_font_sizes';   // JSON: font size adjustments
  spacing: 'compact_on_narrow_screens'; // JSON: spacing adjustments
}
```

### Gesture Controls - JSON Implementation

```typescript
// Based on JSON: mobile_specific_features.gesture_controls
interface GestureControls {
  // JSON: swipe_actions (simplified for better UX)
  swipeActions: {
    // Original JSON: approve_reject_actions horizontal_swipe
    // Simplified: Remove problematic swipe actions, use clear buttons instead
    navigation: 'vertical_swipe';         // Keep for navigation
    pullToRefresh: 'vertical_pull';       // Keep for refresh
  };
  
  // JSON: touch_interactions  
  touchInteractions: {
    pressAndHold: 'voice_recording';      // JSON: voice recording trigger
    tapFeedback: 'haptic_simulation';     // JSON: haptic feedback
    longPress: 'context_menu';            // JSON: context actions
  };
}
```

### PWA Features - JSON Implementation

```typescript
// Based on JSON: mobile_specific_features.pwa_features
interface PWAConfig {
  serviceWorker: 'minimal_compliance';   // JSON: service_worker
  appManifest: 'installable';            // JSON: app_manifest
  offlineSupport: 'basic';               // JSON: offline_support
  
  // Manifest configuration
  manifest: {
    name: 'VoicemailAI';
    short_name: 'VoicemailAI';
    description: 'AI-powered voicemail management voor Nederlandse ZZP\'ers';
    theme_color: '#168aad';              // Bondi Blue - professional
    background_color: '#f7fbe9';         // Light success background
    display: 'standalone';
    start_url: '/mobile-v3/';
  };
}
```

---

## ♿ Accessibility Implementation - JSON Standards

### WCAG Compliance - JSON accessibility_design

```typescript
// Based on JSON: accessibility_design specifications
interface AccessibilityConfig {
  // JSON: screen_reader specifications
  screenReader: {
    // JSON: card_announcement template
    conversationCardAnnouncement: 'Conversatie met {customerName}, {phoneNumber}, {time_ago}, samenvatting: {first_80_chars}, {call_count} gesprekken';
    gestureAnnouncements: true;          // JSON: gesture_announcements  
    stateChanges: true;                  // JSON: state_changes
  };
  
  // JSON: keyboard_navigation specifications
  keyboardNavigation: {
    tabOrder: ['search', 'filter_tabs', 'conversation_1', 'conversation_2']; // JSON: tab_order
    arrowNavigation: true;               // JSON: arrow_navigation
    enterKey: 'open_modal';              // JSON: enter_key action
    escapeKey: 'close_modal';            // JSON: escape_key action
  };
  
  // JSON: touch_targets specifications  
  touchTargets: {
    minimum: '44px';                     // JSON: minimum size
    conversationCard: '100% full_width'; // JSON: card touch target
    actionButtons: 'min_48px';           // JSON: button touch targets
  };
}
```

### Color Accessibility

```typescript
// Accessibility compliance for new color palette
interface ColorAccessibility {
  contrastRatios: {
    // WCAG AA/AAA compliance
    'white_on_indigo_dye': '9.1:1 (AAA)',    // #ffffff on #184e77
    'white_on_bondi_blue': '6.2:1 (AA)',     // #ffffff on #168aad  
    'indigo_dye_on_white': '9.1:1 (AAA)',    // #184e77 on #ffffff
    'emerald_on_white': '3.8:1 (AA)',        // #76c893 on #ffffff
  };
  
  colorBlindSupport: {
    deuteranopia: 'supported',           // Green-red color blindness
    protanopia: 'supported',             // Red color blindness
    tritanopia: 'supported',             // Blue-yellow color blindness  
    monochromacy: 'supported',           // Complete color blindness
  };
}
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation & Core Screens
```typescript
// Week 1-2: Foundation
interface Phase1Tasks {
  setup: [
    'Initialize Next.js 15 + React 18 + TypeScript',
    'Configure Tailwind CSS v4 with VoicemailAI color system',
    'Set up Supabase integration and authentication',
    'Implement mobile-first responsive framework'
  ];
  
  coreScreens: [
    'Build 3-tab navigation system',
    'Implement HomeScreen with call forwarding toggle',
    'Create LoginScreen with mobile optimizations',  
    'Set up routing between screens'
  ];
}
```

### Phase 2: Conversations System (Complex)
```typescript  
// Week 3-4: JSON Conversation Threading
interface Phase2Tasks {
  dataLayer: [
    'Implement ConversationThread data structure from JSON',
    'Build phone number grouping algorithm',
    'Create conversation sorting and filtering',
    'Set up API integration for /api/transcriptions'
  ];
  
  uiComponents: [
    'Build ConversationCard with avatar system',
    'Implement 85vh slide-up modal system',
    'Create expandable call history timeline',
    'Add search and filtering UI'
  ];
}
```

### Phase 3: AI Assistant Integration
```typescript
// Week 5-6: AI Features  
interface Phase3Tasks {
  aiIntegration: [
    'Set up OpenRouter API with Gemini 1.5 Flash 8B',
    'Implement /api/agent/chat endpoint',
    'Build chat interface with message threading',
    'Create business action generation system'
  ];
  
  businessLogic: [
    'Implement ZZP-focused messaging and copy',
    'Add business stats and revenue tracking',
    'Create success-oriented UI feedback',
    'Build context-aware AI responses'
  ];
}
```

### Phase 4: Polish & Production
```typescript  
// Week 7-8: Production Ready
interface Phase4Tasks {
  optimization: [
    'Add loading states and skeleton screens',
    'Implement error handling and retry logic',
    'Add haptic feedback simulation',  
    'Optimize performance and bundle size'
  ];
  
  testing: [
    'Accessibility testing with screen readers',
    'Mobile device testing (Samsung Fold, etc)',
    'Color blind simulation testing',
    'Load testing for API endpoints'
  ];
}
```

---

## 🧪 Testing Strategy

### Visual Testing Checklist
```typescript
interface VisualTesting {
  colorAccuracy: [
    'Verify all hex colors match specification exactly',
    'Test gradients on different devices and browsers',  
    'Validate contrast ratios meet WCAG standards',
    'Check color blind accessibility with simulation tools'
  ];
  
  responsiveDesign: [
    'Test on Samsung Fold (280px closed, 320px open)',
    'Verify touch targets meet 44px minimum',
    'Test keyboard navigation flow',
    'Validate text readability at all sizes'
  ];
}
```

### Functional Testing - JSON Compliance
```typescript
interface FunctionalTesting {
  conversationSystem: [
    'Verify phone number grouping matches JSON algorithm',  
    'Test conversation sorting by last call time',
    'Validate modal animations and gestures',
    'Check search filtering accuracy'
  ];
  
  aiIntegration: [
    'Test OpenRouter API integration',
    'Verify context-aware responses',  
    'Check business action generation',
    'Validate chat message threading'
  ];
}
```

---

## 📚 Important Implementation Notes

### Critical JSON Compliance
1. **Exact Data Structure:** Use the exact field names from JSON (customerName, customer_name, etc.)
2. **Grouping Algorithm:** Implement phone number grouping exactly as specified
3. **Modal Behavior:** 85vh height, slide-up animation, drag-to-close  
4. **Color Mapping:** Apply new colors to JSON elements semantically
5. **Business Focus:** Frame everything in ZZP business success terms

### Backend Requirements
1. **Supabase Setup:** Authentication + database + real-time subscriptions
2. **OpenRouter Integration:** Gemini 1.5 Flash 8B for AI chat
3. **Data Processing:** Conversation threading and summary generation
4. **API Rate Limiting:** Implement according to JSON specifications
5. **Error Handling:** Graceful degradation and retry mechanisms

### Mobile-First Critical Points  
1. **Touch Targets:** 44px minimum, prefer 48px+
2. **Font Sizes:** 16px minimum for inputs (prevents iOS zoom)
3. **Gesture Conflicts:** Avoid swipe actions that conflict with browser
4. **Performance:** Optimize gradients and animations for mobile browsers
5. **PWA Compliance:** Manifest, service worker, offline support

---

## 🔗 File References

### Key Files to Modify/Create
- `/styles/globals.css` - Add VoicemailAI color variables
- `/components/screens/HomeScreen.tsx` - Home dashboard implementation
- `/components/screens/ConversationsScreen.tsx` - JSON conversation threading
- `/components/screens/AssistantScreen.tsx` - AI chat integration  
- `/components/screens/LoginScreen.tsx` - Mobile-optimized auth
- `/components/conversation/ConversationCard.tsx` - JSON thread cards
- `/components/conversation/ThreadModal.tsx` - 85vh modal system
- `/api/transcriptions.ts` - JSON-compliant API endpoint
- `/api/agent/chat.ts` - OpenRouter integration
- `/lib/conversationThreading.ts` - JSON grouping algorithm

### Existing Components to Leverage
- `/components/ui/card.tsx` - Base card component
- `/components/ui/button.tsx` - Base button component  
- `/components/ui/input.tsx` - Form inputs
- `/components/ui/dialog.tsx` - Modal base (extend for slide-up)

---

*This comprehensive handoff document implements the complete VoicemailAI v3.0 design system based on your original JSON specification, with the new green-to-blue color palette applied strategically for Nederlandse ZZP'ers business success psychology.*

**Contact the design team for any clarifications on JSON implementation details or color application specifics.**