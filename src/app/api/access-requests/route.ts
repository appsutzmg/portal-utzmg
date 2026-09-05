import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { sendInstitutionalEmail, isEmailConfigured } from '@/lib/email';
import {
  PORTAL_ADMIN_EMAIL,
  buildAppAccessRequestMessage,
  buildGeneralAccessRequestMessage,
  buildNewAppRequestMessage,
  type NewAppRequestForm,
} from '@/lib/access-request-messages';
import {
  buildPendingAppCode,
  buildRequestNotes,
  mapAuthTypeLabelToValue,
  resolveRequiredRolesFromRequest,
  slugifyAppCode,
} from '@/lib/pending-app-request';

export const dynamic = 'force-dynamic';

type RequestType = 'app_access' | 'general_access' | 'new_app';

interface AccessRequestBody {
  type: RequestType;
  appCode?: string;
  appName?: string;
  comment?: string;
  newApp?: NewAppRequestForm;
}

async function ensureUniqueAppCode(baseCode: string): Promise<string> {
  let code = slugifyAppCode(baseCode) || `app-${Date.now()}`;
  let attempt = 0;

  while (attempt < 20) {
    const existing = await prisma.application.findUnique({ where: { code } });
    if (!existing) return code;
    attempt += 1;
    code = `${slugifyAppCode(baseCode).slice(0, 40)}-${attempt + 1}`;
  }

  return `${slugifyAppCode(baseCode).slice(0, 30)}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const body = (await request.json()) as AccessRequestBody;
    const { type, appCode, appName, comment, newApp } = body;

    if (!type || !['app_access', 'general_access', 'new_app'].includes(type)) {
      return NextResponse.json(
        { ok: false, message: 'Tipo de solicitud no válido.' },
        { status: 400 }
      );
    }

    let message: { subject: string; body: string };
    let targetResource: string;
    let pendingAppId: string | null = null;

    if (type === 'app_access') {
      if (!isEmailConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            message:
              'El envío de correo no está configurado en el servidor. Contacte al administrador del portal.',
          },
          { status: 503 }
        );
      }

      if (!appCode?.trim()) {
        return NextResponse.json(
          { ok: false, message: 'Debe indicar la aplicación.' },
          { status: 400 }
        );
      }

      const app = await prisma.application.findUnique({
        where: { code: appCode.trim().toLowerCase() },
      });

      if (!app) {
        return NextResponse.json(
          { ok: false, message: 'La aplicación indicada no existe en el portal.' },
          { status: 404 }
        );
      }

      message = buildAppAccessRequestMessage({
        userName: user.name,
        userEmail: user.email,
        userRoles: user.roles,
        appName: app.name,
        appCode: app.code,
        comment,
      });
      targetResource = `app:${app.code}`;
    } else if (type === 'general_access') {
      if (!isEmailConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            message:
              'El envío de correo no está configurado en el servidor. Contacte al administrador del portal.',
          },
          { status: 503 }
        );
      }

      const name = appName?.trim();
      if (!name) {
        return NextResponse.json(
          { ok: false, message: 'Indique el nombre de la aplicación o sistema.' },
          { status: 400 }
        );
      }

      message = buildGeneralAccessRequestMessage({
        userName: user.name,
        userEmail: user.email,
        userRoles: user.roles,
        appName: name,
        comment,
      });
      targetResource = `access:${name}`;
    } else {
      if (
        !newApp?.appName?.trim() ||
        !newApp?.appUrl?.trim() ||
        !newApp?.description?.trim() ||
        !newApp?.category?.trim() ||
        !newApp?.visibility?.trim() ||
        !newApp?.authType?.trim() ||
        !newApp?.responsible?.trim()
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              'Completa los campos obligatorios del formulario (nombre, URL, descripción, categoría, visibilidad, tipo de acceso y responsable).',
          },
          { status: 400 }
        );
      }

      const code = await ensureUniqueAppCode(buildPendingAppCode(newApp));
      const maxOrder = await prisma.application.aggregate({ _max: { orderIndex: true } });
      const nextOrder = (maxOrder._max.orderIndex ?? 0) + 1;
      const authType = mapAuthTypeLabelToValue(newApp.authType);
      const appUrl =
        authType === 'SSO_JWT_TOKEN' && newApp.ssoUrl?.trim()
          ? newApp.ssoUrl.trim()
          : newApp.appUrl.trim();

      const pendingApp = await prisma.application.create({
        data: {
          code,
          name: newApp.appName.trim(),
          description: newApp.description.trim(),
          url: appUrl,
          icon: 'Layers',
          category: newApp.category.trim(),
          authType,
          openIn: '_blank',
          orderIndex: nextOrder,
          status: 'PENDING_PUBLISH',
          isVisible: false,
          requiredRoles: resolveRequiredRolesFromRequest(newApp),
          requestedByEmail: user.email,
          requestedByName: user.name,
          requestNotes: buildRequestNotes(newApp),
        },
      });

      pendingAppId = pendingApp.id;
      message = buildNewAppRequestMessage({
        ...newApp,
        userName: user.name,
        userEmail: user.email,
      });
      targetResource = `app:${pendingApp.code}`;
    }

    let emailSent = false;
    let emailWarning: string | null = null;

    if (isEmailConfigured()) {
      try {
        await sendInstitutionalEmail({
          to: PORTAL_ADMIN_EMAIL,
          subject: message.subject,
          text: message.body,
          replyTo: user.email,
        });
        emailSent = true;
      } catch (err) {
        console.error('Error al enviar correo de solicitud:', err);
        emailWarning =
          'La solicitud quedó registrada, pero no se pudo enviar el correo al administrador.';
      }
    } else if (type === 'new_app') {
      emailWarning =
        'La solicitud quedó pendiente de publicar. El correo no está configurado en el servidor.';
    } else {
      return NextResponse.json(
        {
          ok: false,
          message:
            'El envío de correo no está configurado en el servidor. Contacte al administrador del portal.',
        },
        { status: 503 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: type === 'new_app' ? 'APP_REQUEST_PENDING' : 'ACCESS_REQUEST_SENT',
      targetResource,
      details: {
        type,
        appCode: appCode || null,
        appName: appName || newApp?.appName || null,
        pendingAppId,
        emailSent,
        adminEmail: PORTAL_ADMIN_EMAIL,
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Portal-UTZMG-Client',
    });

    if (type === 'new_app') {
      return NextResponse.json({
        ok: true,
        message: emailSent
          ? `Tu solicitud quedó pendiente de publicar y se envió un correo a ${PORTAL_ADMIN_EMAIL}.`
          : emailWarning ||
            'Tu solicitud quedó pendiente de publicar. El administrador la revisará en Gestión de Aplicaciones.',
        pendingAppId,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Tu solicitud fue enviada a ${PORTAL_ADMIN_EMAIL}. Te contactaremos pronto.`,
    });
  } catch (error) {
    console.error('Error al enviar solicitud de acceso:', error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo enviar la solicitud. Inténtalo de nuevo más tarde.',
      },
      { status: 500 }
    );
  }
}
