# Mobile-Only Deployment Instructions

## Security Checklist ✅

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env.local` and fill in production values
- [ ] Use Vercel's environment variables feature (not committed to repo)
- [ ] Never commit `.env.local` to version control

### 2. Security Headers
✅ Implemented in `next.config.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- X-XSS-Protection: 1; mode=block

### 3. CVE-2025-29927 Mitigation
✅ Implemented in `src/middleware.ts`:
- User-Agent validation and sanitization
- Request header length limits
- CSRF protection for non-GET requests
- Origin validation

### 4. Authentication Security
✅ Implemented:
- Cookie-based authentication with httpOnly flags
- Supabase RLS policies
- Protected route middleware
- Auth token validation

### 5. Mobile-Specific Security
✅ Implemented:
- Restricted access to mobile-v3 routes only
- Automatic redirects from desktop routes
- Mobile-optimized middleware

## Deployment Steps

### 1. Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. Environment Variables in Vercel
Set these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_DOMAIN`
- `STRIPE_PRICE_BASIC_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_ENTERPRISE_MONTHLY`
- `NEXT_PUBLIC_DEV_BYPASS_STRIPE`
- `NEXT_PUBLIC_FORWARDING_NUMBER`
- `DATABASE_URL`

### 3. Domain Configuration
1. Add custom domain in Vercel dashboard
2. Update `NEXT_PUBLIC_DOMAIN` environment variable
3. Configure DNS records as instructed by Vercel

### 4. Post-Deployment Verification
- [ ] Test mobile-v3 interface functionality
- [ ] Verify all API routes work correctly
- [ ] Test authentication flow
- [ ] Verify transcriptions loading
- [ ] Test subscription management
- [ ] Check security headers with online tools

## Security Best Practices

### 1. Regular Updates
- Keep Next.js updated to latest version
- Monitor for new security advisories
- Update dependencies regularly

### 2. Monitoring
- Set up Vercel analytics
- Monitor API error rates
- Track authentication failures

### 3. Backup Strategy
- Regular database backups
- Environment variable backups
- Code repository backups

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check package.json dependencies
2. **Environment Variables**: Verify all required vars are set
3. **Authentication Issues**: Check Supabase configuration
4. **API Errors**: Verify database connection

### Security Headers Check:
Use online tools like:
- Security Headers (securityheaders.com)
- Mozilla Observatory
- SSL Labs

## API Routes Available for Mobile:

### Essential Routes:
- `GET /api/transcriptions` - Fetch voicemail transcriptions
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/subscriptions/status` - Check subscription status
- `POST /api/checkout` - Create Stripe checkout session

### Authentication:
- Handled by Supabase client-side
- Cookie-based session management
- Automatic token refresh

## Performance Optimizations:

### Implemented:
- Turbopack for fast development
- Package import optimization
- Mobile-first responsive design
- Framer Motion optimizations

### Recommended:
- Enable Vercel Analytics
- Set up caching strategies
- Monitor Core Web Vitals

## Compliance:

### GDPR Considerations:
- User data processing consent
- Data retention policies
- Right to data deletion

### Mobile App Store Requirements:
- Privacy policy link
- Terms of service
- Data handling transparency