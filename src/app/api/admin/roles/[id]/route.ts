import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

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

    const existingRole = await prisma.role.findUnique({ where: { id: params.id } });
    if (!existingRole) {
      return NextResponse.json({ ok: false, message: 'Rol no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, description } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json(
        { ok: false, message: 'El nombre visible del rol es obligatorio.' },
        { status: 400 }
      );
    }

    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: {
        displayName: displayName.trim(),
        description: description?.trim() || null,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'ROLE_UPDATE',
      targetResource: `role:${updatedRole.name}`,
      details: {
        previous: existingRole,
        updated: updatedRole,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: 'Rol actualizado correctamente',
      role: updatedRole,
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return NextResponse.json({ ok: false, message: 'Error interno al actualizar el rol' }, { status: 500 });
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

    const roleToDelete = await prisma.role.findUnique({
      where: { id: params.id },
      include: { _count: { select: { users: true } } },
    });

    if (!roleToDelete) {
      return NextResponse.json({ ok: false, message: 'Rol no encontrado' }, { status: 404 });
    }

    if (roleToDelete.isSystem) {
      return NextResponse.json(
        { ok: false, message: 'Los roles del sistema no pueden eliminarse.' },
        { status: 403 }
      );
    }

    if (roleToDelete._count.users > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `No se puede eliminar: ${roleToDelete._count.users} usuario(s) tienen asignado este rol.`,
        },
        { status: 400 }
      );
    }

    // Quitar el rol de las aplicaciones que lo referencian
    const appsWithRole = await prisma.application.findMany({
      where: {
        requiredRoles: { contains: roleToDelete.name },
      },
    });

    for (const app of appsWithRole) {
      const updatedRoles = app.requiredRoles
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r && r !== roleToDelete.name)
        .join(',');

      await prisma.application.update({
        where: { id: app.id },
        data: { requiredRoles: updatedRoles },
      });
    }

    await prisma.role.delete({ where: { id: params.id } });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'ROLE_DELETE',
      targetResource: `role:${roleToDelete.name}`,
      details: {
        displayName: roleToDelete.displayName,
        appsUpdated: appsWithRole.map((a) => a.code),
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: `El rol "${roleToDelete.displayName}" ha sido eliminado.`,
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    return NextResponse.json({ ok: false, message: 'Error interno al eliminar el rol' }, { status: 500 });
  }
}
