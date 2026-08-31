import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';

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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalApps,
      activeApps,
      totalUsers,
      totalRoles,
      totalLaunchesToday,
      totalLoginsToday,
      recentLogs,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'ACTIVE', isVisible: true } }),
      prisma.user.count(),
      prisma.role.count(),
      prisma.auditLog.count({
        where: {
          action: 'APP_LAUNCH',
          createdAt: { gte: todayStart },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'AUTH_LOGIN_SUCCESS',
          createdAt: { gte: todayStart },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalApps,
        activeApps,
        totalUsers,
        totalRoles,
        totalLaunchesToday,
        totalLoginsToday,
        recentLogs,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json({ ok: false, error: 'Error del servidor' }, { status: 500 });
  }
}
