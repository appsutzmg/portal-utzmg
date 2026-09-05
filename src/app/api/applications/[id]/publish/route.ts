import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { ok: false, message: 'Acceso denegado. Se requieren permisos de Administrador.' },
        { status: 403 }
      );
    }

    const app = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!app) {
      return NextResponse.json({ ok: false, message: 'Aplicación no encontrada' }, { status: 404 });
    }

    if (app.status !== 'PENDING_PUBLISH') {
      return NextResponse.json(
        { ok: false, message: 'Esta aplicación no está pendiente de publicación.' },
        { status: 400 }
      );
    }

    const published = await prisma.application.update({
      where: { id: app.id },
      data: {
        status: 'ACTIVE',
        isVisible: true,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_PUBLISH',
      targetResource: `app:${published.code}`,
      details: {
        name: published.name,
        requestedByEmail: published.requestedByEmail,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Portal-UTZMG-Client',
    });

    return NextResponse.json({
      ok: true,
      message: `La aplicación "${published.name}" ya está publicada en el portal.`,
      application: published,
    });
  } catch (error) {
    console.error('Error al publicar aplicación:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno al publicar la aplicación' },
      { status: 500 }
    );
  }
}
