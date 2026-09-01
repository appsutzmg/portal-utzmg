import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { mapDbUserToSession } from '@/lib/user-profile';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { ok: false, message: 'El nombre debe tener al menos 2 caracteres.' },
        { status: 400 }
      );
    }

    if (name.length > 120) {
      return NextResponse.json(
        { ok: false, message: 'El nombre es demasiado largo (máx. 120 caracteres).' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      include: {
        roles: { include: { role: true } },
      },
    });

    const sessionUser = mapDbUserToSession(updatedUser);

    const token = await createSessionToken({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      avatarUrl: sessionUser.avatarUrl,
      roles: sessionUser.roles,
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'PROFILE_NAME_UPDATE',
      targetResource: `user:${user.email}`,
      details: { previousName: user.name, newName: name },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Nombre actualizado',
      user: sessionUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Error al actualizar nombre:', error);
    return NextResponse.json({ ok: false, message: 'Error al guardar el nombre' }, { status: 500 });
  }
}
