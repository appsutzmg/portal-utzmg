import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createSSOLaunchToken } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
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

    if (app.status === 'INACTIVE' && !user.isAdmin) {
      return NextResponse.json(
        { ok: false, message: 'La aplicación no se encuentra disponible actualmente.' },
        { status: 403 }
      );
    }

    // Verificar permiso por rol
    if (!user.isAdmin && app.requiredRoles && app.requiredRoles.trim() !== '') {
      const allowedRoles = app.requiredRoles.split(',').map((r) => r.trim().toLowerCase());
      const hasPermission = user.roles.some((role) => allowedRoles.includes(role.toLowerCase()));

      if (!hasPermission) {
        await logAuditEvent({
          userId: user.id,
          userEmail: user.email,
          action: 'APP_ACCESS_DENIED',
          targetResource: `app:${app.code}`,
          details: { requiredRoles: app.requiredRoles, userRoles: user.roles },
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Browser',
        });

        return NextResponse.json(
          { ok: false, message: 'No cuenta con los roles necesarios para acceder a esta aplicación.' },
          { status: 403 }
        );
      }
    }

    // Registrar en auditoría el lanzamiento de la app
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_LAUNCH',
      targetResource: `app:${app.code}`,
      details: {
        appName: app.name,
        authType: app.authType,
        destinationUrl: app.url,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    let targetLaunchUrl = app.url;

    // Si el tipo de autenticación es SSO_JWT_TOKEN, adjuntar token de lanzamiento
    if (app.authType === 'SSO_JWT_TOKEN') {
      const ssoToken = await createSSOLaunchToken(user, app.code);
      const separator = app.url.includes('?') ? '&' : '?';
      targetLaunchUrl = `${app.url}${separator}sso_token=${encodeURIComponent(ssoToken)}`;
    }

    return NextResponse.json({
      ok: true,
      launchUrl: targetLaunchUrl,
      openIn: app.openIn,
      authType: app.authType,
      appName: app.name,
    });
  } catch (error) {
    console.error('Error al lanzar aplicación:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno al procesar el acceso a la aplicación' },
      { status: 500 }
    );
  }
}
