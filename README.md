# VoicemailAI Mobile v3 🚀

Een geavanceerde mobiele applicatie voor voicemail transcriptie en AI-gestuurde communicatie. Volledig geoptimaliseerd voor mobile-first ervaring met professionele zakelijke features.

## ✨ Features

### 📱 Mobile-First Design
- **Responsive Interface**: Geoptimaliseerd voor alle mobiele apparaten
- **Gesture Navigation**: Intuïtieve swipe-based interactions
- **Touch-Optimized**: Alle elementen zijn touch-friendly (44px+ targets)
- **Framer Motion**: Vloeiende 60fps animaties

### 🔐 Advanced Authentication
- **Complete Auth Flow**: Login, registratie, wachtwoord reset
- **Mobile-Optimized**: Touch-vriendelijke forms met validatie
- **Supabase Integration**: Veilige auth met cookie management
- **Route Protection**: Middleware voor beveiligde routes

### 🧙‍♂️ Settings Wizard
- **7-Step Onboarding**: Professionele setup wizard
- **Swipe Navigation**: Gesture-based stap navigatie
- **Real-time Validation**: Live form validatie per stap
- **Progress Tracking**: Visuele voortgangs indicator

### 📅 Enhanced Calendar
- **Full CRUD Operations**: Creëer, bewerk, verwijder events
- **Mobile UX**: Touch-geoptimaliseerde interface
- **API Integration**: Real-time synchronisatie
- **Cal.com Ready**: Voorbereid voor Cal.com integratie

### ⏰ Time Blocking System
- **Professional Interface**: Zakelijke time management tools
- **Preset Blocks**: 6 voorgedefinieerde tijdblokken
- **Copy Functions**: Dupliceer blokken tussen dagen
- **Visual Design**: Emoji-icons voor snelle herkenning

### 📞 Voicemail Features
- **Real-time Transcriptions**: AI-powered voicemail naar tekst
- **Smart Analytics**: Inzichten in communicatie patronen
- **Export Functions**: Exporteer data naar verschillende formaten
- **Cloud Storage**: Veilige opslag via Supabase

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: App Router met Server Components
- **React 18**: Latest React features
- **TypeScript**: Complete type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Advanced animations

### Backend & Database
- **Dual Architecture**: Prisma (PostgreSQL) + Supabase
- **Supabase Auth**: Complete authenticatie systeem
- **Real-time Features**: Live data synchronisatie
- **Stripe Integration**: Subscription management

### Development
- **Turbopack**: Ultra-fast development builds
- **ESLint**: Code quality enforcement
- **TypeScript Strict**: Maximum type safety

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- Supabase account
- Stripe account (optional voor payments)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd voicemailai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Build for Production

```bash
# Build optimized version
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── mobile-v3/         # Mobile v3 interface (MAIN)
│   └── (auth)/           # Authentication pages
├── components/            # React components
│   ├── mobile-v3/        # Mobile v3 components
│   ├── auth/             # Auth components
│   └── settings/         # Settings components
├── lib/                  # Utilities & config
└── middleware.ts         # Route protection
```

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Environment Variables

Required environment variables for production:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_DOMAIN=your_domain.com
NEXT_PUBLIC_FORWARDING_NUMBER=your_phone_number

# Database
DATABASE_URL=your_postgres_connection_string
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Transcriptions
- `GET /api/transcriptions` - Get voicemail transcriptions
- `POST /api/transcriptions` - Create new transcription

### Subscriptions
- `GET /api/subscriptions/status` - Check subscription status
- `POST /api/checkout` - Create Stripe checkout session

## 🔐 Security Features

- **Security Headers**: Comprehensive security headers
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Zod-based validation
- **Route Protection**: Middleware-based auth protection
- **Environment Security**: Secure environment variable handling

## 📱 Mobile Optimization

- **Mobile-First**: Designed for mobile devices first
- **Touch Targets**: All buttons 44px+ for accessibility
- **Gesture Support**: Swipe navigation throughout
- **Performance**: Optimized for mobile networks
- **Progressive Enhancement**: Works on all devices

## 🧪 Testing

The application has been comprehensively tested:

- ✅ **15/15 Test Suites Passed**
- ✅ **Authentication Flow**: Complete end-to-end testing
- ✅ **Mobile UX**: Touch-first design validation
- ✅ **API Integration**: Success/failure scenarios
- ✅ **Performance**: Mobile network optimization

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

Voor support en vragen, neem contact op via [support@voicemailai.nl](mailto:support@voicemailai.nl)

---

**VoicemailAI Mobile v3** - Professionele voicemail transcriptie voor moderne bedrijven 🚀