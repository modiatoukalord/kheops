
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from './app/lib/auth-actions';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests for static files, API routes, and login page
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') || // A simple way to catch file extensions
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const { user } = await validateRequest();

  // If user is not logged in and tries to access a protected route (like /admin)
  if (!user && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Special handling for the root path if it requires auth for admin hub
  if (!user && request.nextUrl.searchParams.get('hub') === 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
  }


  // Redirect logged-in users from login page to home
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
