import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://*.supabase.co;"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  // Fast path for public routes (e.g. /, /order/*, /track):
  if (!isAdminRoute) {
    return applySecurityHeaders(NextResponse.next());
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Service role client to query admin_users without RLS blocking
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  let user = null;
  const cookiesList = request.cookies.getAll();
  const hasAuthCookie = cookiesList.some(
    (c) => c.name.includes('auth-token') || c.name.includes('sb-')
  );

  if (hasAuthCookie) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      // Suppress refresh token errors
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
      );
    }
    const { data: adminUser } = await adminSupabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
      );
    }
  }

  // Protect admin page routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    const { data: adminUser } = await adminSupabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // If already logged in admin trying to access login page, redirect to dashboard
  if (pathname === '/admin/login' && user) {
    const { data: adminUser } = await adminSupabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (adminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
