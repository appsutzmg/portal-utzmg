import { NextRequest, NextResponse } from 'next/server';
import { signInInstitutionalUser } from '@/lib/institutional-login';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { isEmailOnlyLoginAllowed } from '@/lib/login-policy';

export async function POST(request: NextRequest) {
  try {
    if (!isEmailOnlyLoginAllowed()) {
      return NextResponse.json(
        {
          ok: false,
          message: 'El acceso por correo está deshabilitado. Use Ingresar con Google.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, avatarUrl } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    const result = await signInInstitutionalUser({
      email,
      name,
      avatarUrl,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
      loginMethod: 'institutional_email',
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: result.status || 500 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: result.message,
      user: result.user,
      token: result.token,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: result.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { ok: false, message: 'Ocurrió un error inesperado al procesar el inicio de sesión' },
      { status: 500 }
    );
  }
}
