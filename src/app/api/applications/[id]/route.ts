import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const app = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!app) {
      return NextResponse.json({ ok: false, message: 'Aplicación no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, application: app });
  } catch (error) {
    console.error('Error al obtener aplicación:', error);
    return NextResponse.json({ ok: false, error: 'Error del servidor' }, { status: 500 });
  }
}

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
    const {
      name,
      code,
      description,
      url,
      icon,
      category,
      authType,
      openIn,
      orderIndex,
      status,
      isVisible,
      requiredRoles,
    } = body;

    const formattedRoles = Array.isArray(requiredRoles)
      ? requiredRoles.join(',')
      : requiredRoles !== undefined
      ? requiredRoles
      : existingApp.requiredRoles;

    const updatedApp = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code.trim().toLowerCase() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(icon !== undefined && { icon: icon.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(authType !== undefined && { authType }),
        ...(openIn !== undefined && { openIn }),
        ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
        ...(status !== undefined && { status }),
        ...(isVisible !== undefined && { isVisible: Boolean(isVisible) }),
        requiredRoles: formattedRoles,
      },
    });

    // Registrar auditoría
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_UPDATE',
      targetResource: `app:${updatedApp.code}`,
      details: { previous: existingApp, updated: updatedApp },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: 'Aplicación actualizada correctamente',
      application: updatedApp,
    });
  } catch (error) {
    console.error('Error al actualizar aplicación:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno al actualizar la aplicación' },
      { status: 500 }
    );
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

    const appToDelete = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!appToDelete) {
      return NextResponse.json({ ok: false, message: 'Aplicación no encontrada' }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id: params.id },
    });

    // Registrar auditoría
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_DELETE',
      targetResource: `app:${appToDelete.code}`,
      details: { name: appToDelete.name, code: appToDelete.code },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: `La aplicación '${appToDelete.name}' ha sido eliminada.`,
    });
  } catch (error) {
    console.error('Error al eliminar aplicación:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno al eliminar la aplicación' },
      { status: 500 }
    );
  }
}
