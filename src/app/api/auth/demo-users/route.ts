import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (process.env.ENABLE_DEMO_ACCOUNTS !== 'true') {
      return NextResponse.json({ ok: true, users: [] });
    }

    const users = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        roles: {
          include: { role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      roles: u.roles.map((r) => r.role.displayName),
      roleKeys: u.roles.map((r) => r.role.name),
      isAdmin: u.roles.some((r) => r.role.name === 'admin'),
    }));

    return NextResponse.json({ ok: true, users: formattedUsers });
  } catch (error) {
    console.error('Error al obtener usuarios demo:', error);
    return NextResponse.json({ ok: false, users: [] }, { status: 500 });
  }
}
