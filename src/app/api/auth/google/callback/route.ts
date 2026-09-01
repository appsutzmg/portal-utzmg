import { NextRequest, NextResponse } from 'next/server';
import { signInInstitutionalUser } from '@/lib/institutional-login';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${error || 'google_auth_failed'}`, getAppUrl())
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/login?error=google_not_configured', getAppUrl())
    );
  }

  try {
    const redirectUri = `${getAppUrl()}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Error al obtener token de Google:', tokenData);
      return NextResponse.redirect(new URL('/login?error=google_token_failed', getAppUrl()));
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userInfoRes.json();

    if (!userInfoRes.ok || !profile.email) {
      console.error('Error al obtener perfil de Google:', profile);
      return NextResponse.redirect(new URL('/login?error=google_profile_failed', getAppUrl()));
    }

    const email = String(profile.email).toLowerCase();

    if (!email.endsWith('@utzmg.edu.mx')) {
      return NextResponse.redirect(new URL('/login?error=domain_not_allowed', getAppUrl()));
    }

    const result = await signInInstitutionalUser({
      email,
      name: profile.name,
      avatarUrl: profile.picture || null,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
      loginMethod: 'google_oauth',
    });

    if (!result.ok || !result.token) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.message || 'login_failed')}`, getAppUrl())
      );
    }

    const response = NextResponse.redirect(new URL('/dashboard', getAppUrl()));

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error('Error en callback de Google OAuth:', err);
    return NextResponse.redirect(new URL('/login?error=google_callback_error', getAppUrl()));
  }
}
