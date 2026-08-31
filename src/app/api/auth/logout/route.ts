import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (user) {
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: 'AUTH_LOGOUT',
        targetResource: 'portal:logout',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Browser',
      });
    }

    const response = NextResponse.json({ ok: true, message: 'Sesión cerrada correctamente' });
    
    // Eliminar cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json({ ok: false, error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
