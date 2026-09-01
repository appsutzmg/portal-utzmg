import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function slugifyRoleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const roles = await prisma.role.findMany({
      orderBy: [{ isSystem: 'desc' }, { displayName: 'asc' }],
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      userCount: role._count.users,
    }));

    return NextResponse.json({ ok: true, roles: formattedRoles });
  } catch (error) {
    console.error('Error al obtener roles:', error);
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
    const { name, displayName, description } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json(
        { ok: false, message: 'El nombre visible del rol es obligatorio.' },
        { status: 400 }
      );
    }

    const roleName = name ? slugifyRoleName(name) : slugifyRoleName(displayName);

    if (!roleName) {
      return NextResponse.json(
        { ok: false, message: 'El identificador del rol no es válido.' },
        { status: 400 }
      );
    }

    const existing = await prisma.role.findUnique({ where: { name: roleName } });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: `Ya existe un rol con el identificador "${roleName}".` },
        { status: 400 }
      );
    }

    const newRole = await prisma.role.create({
      data: {
        name: roleName,
        displayName: displayName.trim(),
        description: description?.trim() || null,
        isSystem: false,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'ROLE_CREATE',
      targetResource: `role:${newRole.name}`,
      details: {
        displayName: newRole.displayName,
        description: newRole.description,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: 'Rol creado correctamente',
      role: newRole,
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    return NextResponse.json({ ok: false, message: 'Error interno al crear el rol' }, { status: 500 });
  }
}
