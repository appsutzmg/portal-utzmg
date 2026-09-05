import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { validateImageDataUrl } from '@/lib/image-data-url';
import { canUserAccessApplication } from '@/lib/app-access';

export const dynamic = 'force-dynamic';

const MAX_LOGO_BYTES = 300 * 1024;

function normalizeLogoUrl(logoUrl: unknown): string | null | undefined {
  if (logoUrl === undefined) return undefined;
  if (logoUrl === null || logoUrl === '') return null;
  if (typeof logoUrl !== 'string') return undefined;
  const validation = validateImageDataUrl(logoUrl, MAX_LOGO_BYTES);
  if (!validation.ok) {
    throw new Error(validation.message);
  }
  return logoUrl;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('adminView') === 'true' && user.isAdmin;
    const accessCatalog = searchParams.get('accessCatalog') === 'true';
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    // Catálogo completo con indicador de acceso (solicitudes de permiso)
    if (accessCatalog) {
      const catalogApps = await prisma.application.findMany({
        where: {
          isVisible: true,
          status: { notIn: ['INACTIVE', 'PENDING_PUBLISH'] },
        },
        orderBy: { orderIndex: 'asc' },
      });

      const applications = catalogApps.map((app) => ({
        ...app,
        canAccess: canUserAccessApplication(user, { requiredRoles: app.requiredRoles }),
      }));

      return NextResponse.json({ ok: true, applications });
    }

    // Si es vista admin, obtiene todo
    if (adminView) {
      const apps = await prisma.application.findMany({
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      });
      return NextResponse.json({ ok: true, applications: apps });
    }

    // Para vista normal de usuario: filtrar por roles y visibilidad
    const allApps = await prisma.application.findMany({
      where: {
        isVisible: true,
        status: { notIn: ['INACTIVE', 'PENDING_PUBLISH'] },
        ...(category ? { category } : {}),
      },
      orderBy: { orderIndex: 'asc' },
    });

    const authorizedApps = allApps.filter((app) =>
      canUserAccessApplication(user, { requiredRoles: app.requiredRoles })
    );

    // Filtro adicional de búsqueda de texto si aplica
    const filteredApps = search
      ? authorizedApps.filter(
          (app) =>
            app.name.toLowerCase().includes(search) ||
            app.description.toLowerCase().includes(search) ||
            app.category.toLowerCase().includes(search)
        )
      : authorizedApps;

    return NextResponse.json({ ok: true, applications: filteredApps });
  } catch (error) {
    console.error('Error al obtener aplicaciones:', error);
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
    const {
      name,
      code,
      description,
      url,
      icon,
      logoUrl,
      category,
      authType,
      openIn,
      orderIndex,
      status,
      isVisible,
      requiredRoles,
    } = body;

    if (!name || !code || !url) {
      return NextResponse.json(
        { ok: false, message: 'El nombre, código único y URL son obligatorios.' },
        { status: 400 }
      );
    }

    // Normalizar slug de código
    const cleanCode = code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    // Verificar si ya existe código
    const existing = await prisma.application.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, message: `Ya existe una aplicación con el código '${cleanCode}'.` },
        { status: 400 }
      );
    }

    let normalizedLogo: string | null | undefined;
    try {
      normalizedLogo = normalizeLogoUrl(logoUrl);
    } catch (err) {
      return NextResponse.json(
        { ok: false, message: err instanceof Error ? err.message : 'Logo no válido' },
        { status: 400 }
      );
    }

    const newApp = await prisma.application.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        description: description?.trim() || '',
        url: url.trim(),
        icon: icon?.trim() || 'Grid',
        ...(normalizedLogo !== undefined && { logoUrl: normalizedLogo }),
        category: category?.trim() || 'Académica',
        authType: authType || 'GOOGLE_SESSION',
        openIn: openIn || '_blank',
        orderIndex: typeof orderIndex === 'number' ? orderIndex : 0,
        status: status || 'ACTIVE',
        isVisible: isVisible !== undefined ? isVisible : true,
        requiredRoles: Array.isArray(requiredRoles) ? requiredRoles.join(',') : requiredRoles || '',
      },
    });

    // Registrar en auditoría
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'APP_CREATE',
      targetResource: `app:${newApp.code}`,
      details: { name: newApp.name, url: newApp.url, requiredRoles: newApp.requiredRoles },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Browser',
    });

    return NextResponse.json({
      ok: true,
      message: 'Aplicación registrada exitosamente',
      application: newApp,
    });
  } catch (error) {
    console.error('Error al registrar aplicación:', error);
    return NextResponse.json(
      { ok: false, message: 'Error interno al registrar la aplicación' },
      { status: 500 }
    );
  }
}
