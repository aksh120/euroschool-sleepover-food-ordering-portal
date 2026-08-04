import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Fast path for public routes (e.g. /, /order/*, /track):
  // Return response immediately without initializing Supabase auth clients on edge!
  if (!pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
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

  // Protect admin routes (except login)
  if (pathname !== '/admin/login') {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    const { data: adminUser } = await adminSupabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
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
      return NextResponse.redirect(url);
    }
  }

  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
