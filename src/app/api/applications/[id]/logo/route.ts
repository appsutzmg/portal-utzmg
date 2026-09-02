import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { validateImageDataUrl } from '@/lib/image-data-url';

export const dynamic = 'force-dynamic';

const MAX_LOGO_BYTES = 300 * 1024; // 300 KB

export async function PUT(
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

    const existingApp = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!existingApp) {
      return NextResponse.json({ ok: false, message: 'Aplicación no encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { logoData } = body;

    if (!logoData || typeof logoData !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'Se requiere una imagen válida.' },
        { status: 400 }
      );
    }

    const validation = validateImageDataUrl(logoData, MAX_LOGO_BYTES);
    if (!validation.ok) {
      return NextResponse.json({ ok: false, message: validation.message }, { status: 400 });
    }

    const updatedApp = await prisma.application.update({
      where: { id: params.id },
      data: { logoUrl: logoData },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_UPDATE',
      targetResource: `app:${updatedApp.code}`,
      details: { field: 'logoUrl', name: updatedApp.name },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: 'Logo actualizado',
      application: updatedApp,
    });
  } catch (error) {
    console.error('Error al actualizar logo de aplicación:', error);
    return NextResponse.json({ ok: false, message: 'Error al guardar el logo' }, { status: 500 });
  }
}

export async function DELETE(
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

    const existingApp = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!existingApp) {
      return NextResponse.json({ ok: false, message: 'Aplicación no encontrada' }, { status: 404 });
    }

    const updatedApp = await prisma.application.update({
      where: { id: params.id },
      data: { logoUrl: null },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_UPDATE',
      targetResource: `app:${updatedApp.code}`,
      details: { field: 'logoUrl', action: 'removed', name: updatedApp.name },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: 'Logo eliminado',
      application: updatedApp,
    });
  } catch (error) {
    console.error('Error al eliminar logo de aplicación:', error);
    return NextResponse.json({ ok: false, message: 'Error al eliminar el logo' }, { status: 500 });
  }
}
