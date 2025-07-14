# VoicemailAI UI Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Architecture](#database-architecture)
4. [API Endpoints](#api-endpoints)
5. [Component Structure](#component-structure)
6. [Design System](#design-system)
7. [Authentication Flow](#authentication-flow)
8. [Data Flow](#data-flow)
9. [Mobile Experience](#mobile-experience)
10. [Development Setup](#development-setup)
11. [UI Components Reference](#ui-components-reference)

---

## Architecture Overview

VoicemailAI follows a sophisticated dual-interface architecture optimized for both desktop and mobile experiences:

### Dual Interface Strategy
- **Desktop Interface**: Traditional web application with navbar/footer layout
- **Mobile Interface**: Native app-like experience with gesture-based interactions and PWA capabilities

### Key Design Principles
- **Mobile-First**: Primary focus on mobile user experience
- **Gesture-Driven**: Swipe and touch-based interactions
- **Performance-Optimized**: Lazy loading and code splitting
- **Accessibility-First**: WCAG compliance and screen reader support

---

## Technology Stack

### Frontend Framework
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS 4.0** for styling
- **Framer Motion 11.0** for animations and gestures

### State Management
- **Custom Hooks**: `useAuth` for authentication state
- **Local Storage + Cookies**: Dual storage strategy for SSR compatibility
- **React Context**: Minimal context usage for theme/settings

### Animation & Interactions
- **Framer Motion**: Advanced animations, page transitions, gesture handling
- **CSS Variables**: Dynamic theming and responsive design
- **Intersection Observer**: Scroll-triggered animations

### Icons & Assets
- **Lucide React**: Consistent icon library
- **Next.js Image**: Optimized image loading
- **PWA Icons**: 192x192 and 512x512 for app installation

---

## Database Architecture

### Dual Database Strategy

#### 1. PostgreSQL (via Prisma)
**Primary database for user management and subscriptions**

```prisma
// User Management
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  companyName   String?
  mobileNumber  String?
  information   String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  subscription  Subscription?
}

// Subscription Management
model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  status               String    // active, canceled, past_due, etc.
  priceId              String    // Stripe price ID
  quantity             Int
  cancelAtPeriodEnd    Boolean   @default(false)
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  endedAt              DateTime?
  cancelAt             DateTime?
  canceledAt           DateTime?
  trialStart           DateTime?
  trialEnd             DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  user                 User      @relation(fields: [userId], references: [id])
}

// Stripe Products & Pricing
model Product {
  id          String   @id        // Stripe product ID
  name        String
  description String?
  active      Boolean  @default(true)
  image       String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  prices      Price[]
}

model Price {
  id              String   @id     // Stripe price ID
  productId       String
  active          Boolean  @default(true)
  currency        String           // USD, EUR, etc.
  interval        String?          // month, year
  intervalCount   Int?             // billing frequency
  unitAmount      Int              // price in cents
  type            String   @default("one_time") // recurring, one_time
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  product         Product  @relation(fields: [productId], references: [id])
}
```

#### 2. Supabase (PostgreSQL)
**Secondary database for voicemail transcriptions and real-time features**

```sql
-- Voicemail transcriptions table
call_transcriptions (
  id: string (primary key),
  client_id: string,
  transcript: json[], -- Array of transcription segments
  audio_url: string,
  duration: number,
  created_at: timestamp,
  updated_at: timestamp
)

-- User profiles table (extends Prisma User)
profiles (
  id: string (primary key, matches Prisma User.id),
  name: string,
  company_name: string,
  mobile_number: string,
  information: text,
  cal_username: string,    -- Cal.com integration
  cal_api_key: string,     -- Cal.com API key
  cal_event_type_id: string, -- Cal.com event type
  created_at: timestamp,
  updated_at: timestamp
)

-- Subscriptions table (synced with Stripe)
subscriptions (
  id: string (primary key),
  user_id: string,
  status: string,
  price_id: string,
  quantity: number,
  current_period_start: timestamp,
  current_period_end: timestamp,
  created_at: timestamp,
  updated_at: timestamp
)
```

---

## API Endpoints

### Authentication & User Management
- `GET /api/user/profile` - Get user profile data
- `PUT /api/user/profile` - Update user profile
- `GET /api/contact/check` - Check contact existence
- `POST /api/contact` - Create new contact

### Subscription Management
- `GET /api/subscriptions/status?userId={id}` - Get subscription status
- `POST /api/subscriptions/create` - Create new subscription
- `POST /api/subscriptions/sync` - Sync subscription with Stripe
- `POST /api/checkout` - Create Stripe checkout session

### Voicemail & Transcriptions
- `GET /api/transcriptions?clientId={id}` - Get transcriptions (optionally filtered by client)
- `GET /api/transcriptions-backup` - Backup transcriptions endpoint

### Payment Processing
- `POST /api/stripe/session` - Create Stripe session
- `POST /api/webhook/stripe` - Handle Stripe webhooks

### Development Endpoints
- `GET /api/dev/list-stripe-prices` - List available Stripe prices
- `POST /api/dev/create-test-subscription` - Create test subscription
- `POST /api/dev/setup-subscriptions-table` - Initialize subscriptions table
- `POST /api/dev/test-webhook` - Test webhook functionality

---

## Component Structure

### Layout Components (`/src/components/layout/`)
- **`Navbar.tsx`**: Desktop navigation with authentication state
- **`Footer.tsx`**: Standard footer component
- **`CookieBanner.tsx`**: GDPR compliance banner
- **`CookieSettings.tsx`**: Cookie management interface

### Authentication Components (`/src/components/auth/`)
- **`LoginForm.tsx`**: Desktop login form
- **`RegisterForm.tsx`**: Desktop registration form

### Mobile Components (`/src/components/mobile-v3/`)
- **`Header.tsx`**: Mobile-optimized header with gestures
- **`BottomNavigation.tsx`**: Tab-based navigation with Framer Motion
- **`AuthStatus.tsx`**: Mobile authentication status indicator
- **`AuthDebugInfo.tsx`**: Debug information for development

### Mobile Authentication (`/src/components/mobile-v3/auth/`)
- **`MobileLoginForm.tsx`**: Gesture-optimized login form
- **`MobileForgotPasswordForm.tsx`**: Password reset form
- **`MobileResetPasswordForm.tsx`**: Password reset completion

### Calendar Components (`/src/components/calendar/`)
- **`Calendar.tsx`**: Main calendar component
- **`CalendarEmbed.tsx`**: Cal.com embed integration
- **`CalendarSetup.tsx`**: Calendar configuration
- **`MobileUserCalendar.tsx`**: Mobile-optimized calendar

### Settings Components (`/src/components/settings/`)
- **`UserProfileForm.tsx`**: User profile management
- **`ForwardingSettings.tsx`**: Call forwarding configuration
- **`ManualTab.tsx`**: Manual setup instructions
- **`ErrorBoundary.tsx`**: Error handling wrapper
- **`MobileSettingsWizard.tsx`**: Mobile setup wizard
- **`MobileTimeBlockingSettings.tsx`**: Mobile time blocking

### Statistics Components (`/src/components/statistics/`)
- **`StatsOverview.tsx`**: Overview dashboard
- **`TranscriptionsTable.tsx`**: Transcriptions data table

### Contact Components (`/src/components/contact/`)
- **`ContactForm.tsx`**: Contact form
- **`ChatButton.tsx`**: Chat widget integration

### Demo Components (`/src/components/demo/`)
- **`ElevenLabsWidget.tsx`**: Voice synthesis demo

### Debug Components (`/src/components/debug/`)
- **`SupabaseTest.tsx`**: Supabase connection testing

---

## Design System

### Color Palette
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Typography
- **Primary Font**: Arial, Helvetica, sans-serif
- **Responsive Scaling**: 16px base to prevent mobile zoom
- **Hierarchy**: Clear h1-h6 structure with Tailwind utilities

### Spacing System
- **Base Grid**: 8px system via Tailwind spacing scale
- **Touch Targets**: 44px minimum for mobile interactions
- **Safe Areas**: iOS notch and bottom navigation considerations

### Animation Patterns
- **Page Transitions**: Smooth enter/exit animations
- **Gesture Feedback**: Visual feedback for swipe interactions
- **Loading States**: Skeleton screens and spinners
- **Micro-interactions**: Tap feedback and hover states

---

## Authentication Flow

### Architecture
```typescript
// Custom hook for authentication state
export function useAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: boolean,
    user: { id: string, email: string } | null,
    loading: boolean,
    error: string | null
  });

  // Actions
  const login = (email: string, password: string) => Promise<boolean>;
  const logout = () => Promise<void>;
  const refreshAuth = () => Promise<void>;
}
```

### Storage Strategy
- **Dual Storage**: localStorage + cookies for SSR compatibility
- **Cross-tab Sync**: Storage event listeners for multi-tab support
- **Automatic Cleanup**: Session expiration and cleanup

### Session Management
- **Supabase Auth**: Primary authentication provider
- **Cookie-based**: Custom cookie storage for server-side rendering
- **Token Refresh**: Automatic token refresh and validation

---

## Data Flow

### Client-side Data Flow
1. **Authentication Check**: `useAuth` hook validates stored credentials
2. **API Calls**: Authenticated requests with automatic token handling
3. **State Management**: Component-level state with hooks
4. **Real-time Updates**: Supabase subscriptions for live data

### Server-side Data Flow
1. **API Routes**: Next.js API routes with middleware protection
2. **Database Queries**: Prisma for PostgreSQL, Supabase client for real-time
3. **Authentication**: Cookie-based user identification
4. **Error Handling**: Comprehensive error responses and logging

### Data Sources by Component

#### Dashboard Components
- **User Profile**: `GET /api/user/profile` → profiles table
- **Subscription Status**: `GET /api/subscriptions/status` → subscriptions table
- **Transcriptions**: `GET /api/transcriptions` → call_transcriptions table

#### Mobile Components
- **Voicemails**: Real-time Supabase subscription to call_transcriptions
- **Calendar**: Cal.com API integration via user profile
- **Settings**: Local state with API persistence

---

## Mobile Experience

### Progressive Web App (PWA)
```json
// manifest.json
{
  "name": "VoicemailAI",
  "short_name": "VoicemailAI",
  "description": "AI-powered voicemail management",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/mobile-v3",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Mobile Layout Structure
```typescript
// Mobile-V3 Layout
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container">
      <Header />
      <main className="content-area">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
```

### Gesture Interactions
- **Swipe Navigation**: Framer Motion pan gestures
- **Pull-to-Refresh**: Custom refresh implementation
- **Swipe Actions**: Archive/delete voicemails
- **Tap Feedback**: Visual feedback for all interactions

---

## Development Setup

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Pricing (Environment-specific)
STRIPE_PRICE_BASIC_MONTHLY="price_..."
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_ENTERPRISE_MONTHLY="price_..."

# Application
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
NEXT_PUBLIC_DEV_BYPASS_STRIPE="true"
```

### Development Commands
```bash
# Core development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linting

# Database operations
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma studio    # Open Prisma studio
```

---

## UI Components Reference

### Desktop Pages
- **`/`**: Landing page with hero section
- **`/dashboard`**: Main dashboard with statistics
- **`/login`**: Authentication page
- **`/register`**: User registration
- **`/pricing`**: Subscription plans
- **`/dashboard/settings`**: User settings
- **`/dashboard/statistics`**: Analytics view
- **`/dashboard/subscription`**: Subscription management

### Mobile Pages (`/mobile-v3/`)
- **`/mobile-v3`**: Mobile dashboard
- **`/mobile-v3/auth/login`**: Mobile login
- **`/mobile-v3/voicemails`**: Voicemail management
- **`/mobile-v3/calendar`**: Calendar integration
- **`/mobile-v3/analytics`**: Mobile analytics
- **`/mobile-v3/profile`**: User profile
- **`/mobile-v3/transcriptions`**: Transcription history

### Component Props & Usage

#### BottomNavigation
```typescript
interface BottomNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

// Usage
<BottomNavigation currentPath="/mobile-v3/voicemails" onNavigate={handleNavigate} />
```

#### MobileLoginForm
```typescript
interface MobileLoginFormProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
}

// Features
- Gesture-based interactions
- Automatic form validation
- Loading states with animations
- Error handling with toast notifications
```

#### TranscriptionsTable
```typescript
interface TranscriptionsTableProps {
  transcriptions: Transcription[];
  onRefresh: () => void;
  loading: boolean;
}

// Features
- Real-time updates
- Sorting and filtering
- Responsive design
- Export functionality
```

---

## Performance Optimizations

### Code Splitting
- **Route-based**: Automatic page-level splitting
- **Component-based**: Lazy loading for heavy components
- **Dynamic imports**: Runtime component loading

### Image Optimization
- **Next.js Image**: Automatic optimization and lazy loading
- **WebP Support**: Modern image format support
- **Responsive Images**: Multiple sizes for different viewports

### Animation Performance
- **GPU Acceleration**: Hardware-accelerated transforms
- **Reduced Motion**: Respects user accessibility preferences
- **Throttled Animations**: Performance-conscious animation timing

---

## Accessibility Features

### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling
- **Semantic HTML**: Proper heading hierarchy
- **Focus Management**: Keyboard navigation support

### Visual Accessibility
- **High Contrast**: Dark mode support
- **Color Blindness**: Color-independent design
- **Text Scaling**: Responsive text sizing

### Motor Accessibility
- **Large Touch Targets**: 44px minimum
- **Gesture Alternatives**: Keyboard equivalents
- **Timeout Extensions**: Configurable interaction timeouts

---

## Future Enhancements

### Design System Improvements
- **Design Tokens**: Centralized design token system
- **Component Library**: Documented component library
- **Storybook**: Component documentation and testing

### Performance Enhancements
- **Service Worker**: Offline functionality
- **Caching Strategy**: Intelligent cache management
- **Bundle Optimization**: Further code splitting

### Accessibility Improvements
- **Voice Control**: Voice navigation support
- **Keyboard Shortcuts**: Advanced keyboard navigation
- **Screen Reader Optimization**: Enhanced ARIA implementation

---

This documentation provides a comprehensive overview of the VoicemailAI UI architecture, components, and implementation details. Use this as a reference for understanding the current system and planning improvements or redesigns.