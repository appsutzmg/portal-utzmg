import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'utzmg-portal-secure-jwt-secret-key-2026-xyz-institutional'
);

const ALLOWED_DOMAIN = process.env.INSTITUTIONAL_DOMAIN || 'utzmg.edu.mx';
const SESSION_COOKIE_NAME = 'utzmg_session';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  roles: string[];
  isAdmin: boolean;
}

export function isValidInstitutionalEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return cleanEmail.endsWith(`@${ALLOWED_DOMAIN}`);
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  roles: string[];
}): Promise<string> {
  const isAdmin = user.roles.includes('admin');

  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
    isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function createSSOLaunchToken(user: UserSession, targetAppCode: string): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    targetApp: targetAppCode,
    institution: 'UTZMG',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m') // 5 minutos de validez para el handshake
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      avatarUrl: (payload.avatarUrl as string) || null,
      roles: (payload.roles as string[]) || [],
      isAdmin: !!payload.isAdmin,
    };
  } catch (err) {
    return null;
  }
}

export async function getCurrentUserFromCookie(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await verifyToken(sessionCookie.value);
  if (!session) return null;

  // Re-validar en base de datos para asegurar roles y estado actualizados
  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!dbUser || dbUser.status !== 'ACTIVE') {
    return null;
  }

  const roles = dbUser.roles.map((r) => r.role.name);
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    roles,
    isAdmin: roles.includes('admin'),
  };
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<UserSession | null> {
  // Primero intentar desde cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  let token = sessionCookie?.value;

  // Si no está en cookie, intentar desde Authorization Header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const session = await verifyToken(token);
  if (!session) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!dbUser || dbUser.status !== 'ACTIVE') {
    return null;
  }

  const roles = dbUser.roles.map((r) => r.role.name);
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    roles,
    isAdmin: roles.includes('admin'),
  };
}

export { SESSION_COOKIE_NAME, ALLOWED_DOMAIN };
