import prisma from './prisma';

interface LogAuditParams {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  targetResource?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent({
  userId,
  userEmail,
  action,
  targetResource,
  details,
  ipAddress,
  userAgent,
}: LogAuditParams) {
  try {
    const detailsStr = typeof details === 'object' && details !== null 
      ? JSON.stringify(details) 
      : details;

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        targetResource: targetResource || null,
        details: detailsStr || null,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Portal-UTZMG-Client',
      },
    });
  } catch (error) {
    console.error('⚠️ Error al registrar evento de auditoría:', error);
  }
}
