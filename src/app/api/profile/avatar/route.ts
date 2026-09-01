import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { mapDbUserToSession } from '@/lib/user-profile';

export const dynamic = 'force-dynamic';

const MAX_AVATAR_BYTES = 200 * 1024; // 200 KB

function isValidImageDataUrl(dataUrl: string): boolean {
  return /^data:image\/(jpeg|jpg|png|webp);base64,/.test(dataUrl);
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { avatarData } = body;

    if (!avatarData || typeof avatarData !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'Se requiere una imagen válida.' },
        { status: 400 }
      );
    }

    if (!isValidImageDataUrl(avatarData)) {
      return NextResponse.json(
        { ok: false, message: 'Formato no válido. Use JPG, PNG o WebP.' },
        { status: 400 }
      );
    }

    const base64Part = avatarData.split(',')[1] || '';
    const approxBytes = Math.ceil((base64Part.length * 3) / 4);

    if (approxBytes > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { ok: false, message: 'La imagen es muy grande. Máximo 200 KB.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: avatarData },
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
      action: 'PROFILE_AVATAR_UPDATE',
      targetResource: `user:${user.email}`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Foto de perfil actualizada',
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
    console.error('Error al actualizar avatar:', error);
    return NextResponse.json({ ok: false, message: 'Error al guardar la foto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
      include: {
        roles: { include: { role: true } },
      },
    });

    const sessionUser = mapDbUserToSession(updatedUser);

    const token = await createSessionToken({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      avatarUrl: null,
      roles: sessionUser.roles,
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Foto de perfil eliminada',
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
    console.error('Error al eliminar avatar:', error);
    return NextResponse.json({ ok: false, message: 'Error al eliminar la foto' }, { status: 500 });
  }
}
