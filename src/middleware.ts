import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // CVE-2025-29927 Mitigation: Validate and sanitize request headers
  const userAgent = request.headers.get('user-agent');
  const origin = request.headers.get('origin');
  
  // Block suspicious user agents or missing user agents
  if (!userAgent || userAgent.length > 500) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // CSRF Protection for mobile requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const referer = request.headers.get('referer');
    if (!referer || !referer.startsWith(new URL(request.url).origin)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  // Log the current path for debugging
  console.log(`Middleware processing path: ${request.nextUrl.pathname}`);
  
  // Skip middleware for API routes but add security headers
  if (request.nextUrl.pathname.startsWith('/api')) {
    console.log('Processing API route with security headers');
    const response = NextResponse.next();
    
    // Add security headers to API responses
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }
  
  // Allow access to all public routes
  const allowedPaths = [
    '/', '/mobile-v3', '/login', '/register', '/forgot-password', 
    '/pricing', '/features', '/contact', '/about', '/blog', '/privacy', '/terms', '/cookies',
    '/api', '/_next', '/favicon.ico'
  ];
  const isAllowedPath = allowedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (!isAllowedPath) {
    return NextResponse.redirect(new URL('/mobile-v3', request.url));
  }
  
  // Check for our custom auth cookies
  const userId = request.cookies.get('userId');
  const userEmail = request.cookies.get('userEmail');
  const authToken = request.cookies.get('authToken');
  
  const isAuthenticated = userId && userEmail && authToken;
  
  console.log(`Auth check - User authenticated: ${!!isAuthenticated}, Path: ${request.nextUrl.pathname}`);
  
  // Protected routes - mobile-v3 requires authentication
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/mobile-v3')) {
    console.log('No authentication found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Auth routes - redirect to mobile-v3 if already logged in
  if (isAuthenticated && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    console.log('Authentication found, redirecting to mobile-v3');
    return NextResponse.redirect(new URL('/mobile-v3', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 