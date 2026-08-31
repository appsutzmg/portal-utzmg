import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { ok: false, message: 'Acceso denegado. Se requieren permisos de Administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search } },
              { name: { contains: search } },
            ],
          }
        : undefined,
      include: {
        roles: {
          include: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      roles: u.roles.map((r) => r.role.name),
      roleDisplayNames: u.roles.map((r) => r.role.displayName),
    }));

    return NextResponse.json({ ok: true, users: formattedUsers });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ ok: false, error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { ok: false, message: 'Acceso denegado. Se requieren permisos de Administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, roleNames, status } = body;

    if (!userId) {
      return NextResponse.json({ ok: false, message: 'userId es requerido' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (!targetUser) {
      return NextResponse.json({ ok: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar estado si viene en el payload
    if (status) {
      await prisma.user.update({
        where: { id: userId },
        data: { status },
      });
    }

    // Actualizar roles si vienen en el payload
    if (Array.isArray(roleNames)) {
      // Eliminar roles actuales
      await prisma.userRole.deleteMany({
        where: { userId },
      });

      // Buscar IDs de los nuevos roles
      const rolesToAssign = await prisma.role.findMany({
        where: { name: { in: roleNames } },
      });

      // Crear asignaciones
      for (const role of rolesToAssign) {
        await prisma.userRole.create({
          data: {
            userId,
            roleId: role.id,
          },
        });
      }

      // Registrar en auditoría
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        action: 'ROLE_UPDATE',
        targetResource: `user:${targetUser.email}`,
        details: {
          previousRoles: targetUser.roles.map((r) => r.role.name),
          newRoles: roleNames,
        },
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Browser',
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Roles actualizados correctamente para ${targetUser.email}`,
    });
  } catch (error) {
    console.error('Error al actualizar roles de usuario:', error);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
