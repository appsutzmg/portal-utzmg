import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  isValidInstitutionalEmail, 
  createSessionToken, 
  SESSION_COOKIE_NAME,
  ALLOWED_DOMAIN 
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validación estricta de dominio institucional (@utzmg.edu.mx)
    if (!isValidInstitutionalEmail(cleanEmail)) {
      await logAuditEvent({
        userEmail: cleanEmail,
        action: 'AUTH_LOGIN_REJECTED',
        targetResource: 'portal:login',
        details: { reason: `Dominio no permitido. Debe ser @${ALLOWED_DOMAIN}` },
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Browser',
      });

      return NextResponse.json(
        {
          ok: false,
          message: `Acceso restringido. Solo se permiten cuentas institucionales con dominio @${ALLOWED_DOMAIN}`,
        },
        { status: 403 }
      );
    }

    // 2. Buscar o auto-aprovisionar usuario
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      // Determinar nombre a partir del correo si no viene especificado
      const derivedName = name || cleanEmail.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      
      // Auto-aprovisionar usuario
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: derivedName,
          status: 'ACTIVE',
          lastLoginAt: new Date(),
        },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });

      // Asignar rol por defecto
      let defaultRoleName = 'profesor';
      if (cleanEmail === 'apps@utzmg.edu.mx' || cleanEmail.includes('admin')) {
        defaultRoleName = 'admin';
      } else if (cleanEmail.includes('tutor')) {
        defaultRoleName = 'tutor';
      } else if (cleanEmail.includes('coordinad') || cleanEmail.includes('proyecto')) {
        defaultRoleName = 'coordinador_proyectos';
      } else if (cleanEmail.includes('asistent')) {
        defaultRoleName = 'asistente';
      } else if (cleanEmail.includes('direccion') || cleanEmail.includes('academica') || cleanEmail.includes('da@')) {
        defaultRoleName = 'direccion_academica';
      }

      const defaultRole = await prisma.role.findUnique({
        where: { name: defaultRoleName },
      });

      if (defaultRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
          },
        });
      }

      // Re-cargar usuario con sus roles
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });
    } else {
      // Actualizar fecha de último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { ok: false, message: 'La cuenta se encuentra inactiva o suspendida. Contacte al administrador.' },
        { status: 403 }
      );
    }

    const roles = user.roles.map((r) => r.role.name);

    // 3. Generar token de sesión JWT
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles,
    });

    // 4. Registrar auditoría de login
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'AUTH_LOGIN_SUCCESS',
      targetResource: 'portal:login',
      details: { roles, loginMethod: 'institutional_oauth' },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles,
        isAdmin: roles.includes('admin'),
      },
      token,
    });

    // Establecer cookie HttpOnly
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 horas
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
