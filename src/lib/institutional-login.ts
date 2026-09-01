import prisma from './prisma';
import { createSessionToken, isValidInstitutionalEmail, ALLOWED_DOMAIN } from './auth';
import { logAuditEvent } from './audit';
import { mapDbUserToSession } from './user-profile';

export interface InstitutionalSignInInput {
  email: string;
  name?: string;
  avatarUrl?: string | null;
  ipAddress?: string;
  userAgent?: string;
  loginMethod?: string;
}

export interface InstitutionalSignInResult {
  ok: boolean;
  message?: string;
  status?: number;
  user?: ReturnType<typeof mapDbUserToSession>;
  token?: string;
}

function deriveNameFromEmail(email: string): string {
  return email
    .split('@')[0]
    .replace(/\./g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveDefaultRole(email: string): string {
  if (email === 'apps@utzmg.edu.mx' || email.includes('admin')) return 'admin';
  if (email.includes('tutor')) return 'tutor';
  if (email.includes('coordinad') || email.includes('proyecto')) return 'coordinador_proyectos';
  if (email.includes('asistent')) return 'asistente';
  if (email.includes('direccion') || email.includes('academica') || email.includes('da@')) {
    return 'direccion_academica';
  }
  return 'profesor';
}

function resolveDisplayName(input: InstitutionalSignInInput, email: string): string {
  const provided = input.name?.trim();
  if (provided) return provided;
  return deriveNameFromEmail(email);
}

function shouldUpdateNameOnLogin(
  input: InstitutionalSignInInput,
  currentName: string,
  email: string,
  newName: string
): boolean {
  if (input.loginMethod === 'google_oauth' && input.name?.trim()) {
    return true;
  }

  const derivedFromEmail = deriveNameFromEmail(email);
  if (newName === derivedFromEmail) {
    return false;
  }

  if (currentName === derivedFromEmail) {
    return true;
  }

  return Boolean(input.name?.trim() && input.name.trim() !== currentName);
}

export async function signInInstitutionalUser(
  input: InstitutionalSignInInput
): Promise<InstitutionalSignInResult> {
  const cleanEmail = input.email.trim().toLowerCase();

  if (!isValidInstitutionalEmail(cleanEmail)) {
    await logAuditEvent({
      userEmail: cleanEmail,
      action: 'AUTH_LOGIN_REJECTED',
      targetResource: 'portal:login',
      details: { reason: `Dominio no permitido. Debe ser @${ALLOWED_DOMAIN}` },
      ipAddress: input.ipAddress || '127.0.0.1',
      userAgent: input.userAgent || 'Browser',
    });

    return {
      ok: false,
      status: 403,
      message: `Acceso restringido. Solo se permiten cuentas institucionales con dominio @${ALLOWED_DOMAIN}`,
    };
  }

  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: {
      roles: { include: { role: true } },
    },
  });

  const displayName = resolveDisplayName(input, cleanEmail);
  const picture = input.avatarUrl?.trim() || null;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: displayName,
        avatarUrl: picture,
        status: 'ACTIVE',
        lastLoginAt: new Date(),
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    const defaultRole = await prisma.role.findUnique({
      where: { name: resolveDefaultRole(cleanEmail) },
    });

    if (defaultRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: defaultRole.id },
      });
    }

    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: { include: { role: true } } },
    });
  } else {
    const updateData: { lastLoginAt: Date; name?: string; avatarUrl?: string | null } = {
      lastLoginAt: new Date(),
    };

    if (shouldUpdateNameOnLogin(input, user.name, cleanEmail, displayName)) {
      updateData.name = displayName;
    }

    if (picture) {
      const hasCustomAvatar = user.avatarUrl?.startsWith('data:');
      const isGooglePicture = picture.includes('googleusercontent.com');
      if (!hasCustomAvatar || isGooglePicture) {
        updateData.avatarUrl = picture;
      }
    }

    if (updateData.name || updateData.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: { include: { role: true } } },
      });
    }
  }

  if (!user || user.status !== 'ACTIVE') {
    return {
      ok: false,
      status: 403,
      message: 'La cuenta se encuentra inactiva o suspendida. Contacte al administrador.',
    };
  }

  const sessionUser = mapDbUserToSession(user);

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
    action: 'AUTH_LOGIN_SUCCESS',
    targetResource: 'portal:login',
    details: { roles: sessionUser.roles, loginMethod: input.loginMethod || 'institutional' },
    ipAddress: input.ipAddress || '127.0.0.1',
    userAgent: input.userAgent || 'Browser',
  });

  return {
    ok: true,
    message: 'Inicio de sesión exitoso',
    user: sessionUser,
    token,
  };
}
