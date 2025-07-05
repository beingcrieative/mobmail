# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linting
```

### Common Development Tasks
```bash
# Database operations
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma studio    # Open Prisma studio

# Run single test (if tests exist)
npm test -- --testNamePattern="test name"
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with Framer Motion animations
- **Database**: Dual architecture - Prisma (PostgreSQL) + Supabase
- **Authentication**: Supabase Auth with custom cookie management
- **Payments**: Stripe integration with webhook handling
- **Calendar**: Cal.com embed integration

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (auth, subscriptions, transcriptions)
│   ├── dashboard/         # Protected dashboard area
│   ├── mobile/            # Mobile-optimized interfaces
│   └── (auth)/           # Authentication pages
├── components/            # Reusable React components
│   ├── auth/             # Authentication forms
│   ├── calendar/         # Cal.com integration
│   ├── settings/         # User settings and preferences
│   └── mobile/           # Mobile-specific components
├── lib/                  # Utility libraries
│   ├── db.ts            # Prisma client configuration
│   ├── supabase.ts      # Supabase client setup
│   └── stripe.ts        # Stripe integration
└── middleware.ts         # Route protection and auth
```

### Key Architectural Patterns

#### Authentication Flow
- Custom cookie-based authentication using Supabase Auth
- Route protection via middleware (`/src/middleware.ts`)
- Authentication state managed via `useUser` hook (`/src/lib/hooks/useUser.ts`)
- Protected routes redirect to `/login` if unauthenticated

#### Data Management
- **Dual Database**: Prisma for user/subscription data, Supabase for voicemail transcriptions
- **API Layer**: RESTful endpoints in `/src/app/api/`
- **Real-time Features**: Supabase subscriptions for voicemail updates

#### Subscription Management
- Stripe integration for payment processing
- Webhook handling at `/api/webhook/stripe/route.ts`
- Tiered plans: Basic, Pro, Enterprise
- Dev endpoints for testing subscription flows

### Mobile-First Design
- Dedicated mobile interfaces (`/mobile/`, `/mobile-v2/`)
- Gesture-based interactions with Framer Motion
- Progressive enhancement for desktop users
- Responsive design with Tailwind CSS

### Important Configuration Files
- `prisma/schema.prisma` - Database schema
- `src/lib/db.ts` - Prisma client
- `src/lib/supabase.ts` - Supabase configuration
- `src/middleware.ts` - Route protection
- `MOBILE_UX_DESIGN.md` - Mobile interface specifications

### API Routes Structure
```
/api/
├── checkout/           # Stripe checkout sessions
├── subscriptions/      # Subscription management
├── transcriptions/     # Voicemail transcription handling
├── user/profile/       # User profile management
└── webhook/stripe/     # Stripe webhook processing
```

### Development Notes
- Uses Turbopack for faster development builds
- Environment variables required for Supabase and Stripe
- Custom authentication middleware protects dashboard routes
- Mobile interfaces use gesture-based interactions
- Comprehensive dev API endpoints for testing

### Testing
- No specific test framework configured in package.json
- Manual testing via dev API endpoints
- Stripe testing via webhook test endpoints

## Mobile Interface Specifications

The mobile interface follows a gesture-first design optimized for personal growth and productivity tracking. Key features include:

- **Gesture Calendar**: Swipe-based time slot management
- **Voicemail Management**: Swipe actions for archive/delete
- **Growth Tracking**: AI-powered insights and progress visualization
- **Onboarding Flow**: Personalized setup wizard

Refer to `MOBILE_UX_DESIGN.md` for detailed mobile interface specifications and implementation guidelines.