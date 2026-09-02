const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rolesData = [
  {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso total y administración del portal, catálogo y ambas aplicaciones',
  },
  {
    name: 'profesor',
    displayName: 'Profesor',
    description: 'Acceso al Sistema de Tutorías (no incluye Proyectos Integradores)',
  },
  {
    name: 'coordinador_proyectos',
    displayName: 'Coordinador de Proyectos',
    description: 'Coordinación y gestión de proyectos integradores',
  },
  {
    name: 'asistente',
    displayName: 'Asistente',
    description: 'Asistencia y soporte en proyectos integradores',
  },
  {
    name: 'tutor',
    displayName: 'Tutor',
    description: 'Seguimiento tutorial y sesiones de tutoría individual y grupal',
  },
  {
    name: 'direccion_academica',
    displayName: 'Dirección Académica',
    description: 'Supervisión académica de tutorías y reportes institucionales',
  },
];

const applicationsData = [
  {
    code: 'proyectos-integradores',
    name: 'Sistema de Evaluación de Proyectos Integradores',
    description:
      'Plataforma para asignación de jurados, registro de rúbricas de evaluación, fechas de exposición y actas de proyectos integradores.',
    url: 'https://evaluacion-proyectos-frontend-wkgt.onrender.com/sso',
    icon: 'FolderKanban',
    category: 'Académica',
    authType: 'SSO_JWT_TOKEN',
    openIn: '_blank',
    orderIndex: 1,
    status: 'ACTIVE',
    isVisible: true,
    requiredRoles: 'admin,coordinador_proyectos,asistente',
  },
  {
    code: 'tutorias',
    name: 'Sistema de Gestión de Tutorías',
    description:
      'Plataforma institucional para el seguimiento tutorial, registro de sesiones individuales/grupales, concentrados y evaluación cualitativa.',
    url: 'https://script.google.com/a/macros/utzmg.edu.mx/s/AKfycbyGEEIK0ohZB3eECRYPZXdVmJbECsIHUTiql5U3J78HNonoSBp242blSAHwePj8wDhe/exec',
    icon: 'Users',
    category: 'Académica',
    authType: 'SSO_JWT_TOKEN',
    openIn: '_blank',
    orderIndex: 2,
    status: 'ACTIVE',
    isVisible: true,
    requiredRoles: 'admin,profesor,tutor,direccion_academica',
  },
];

async function main() {
  console.log('🌱 Sincronizando datos iniciales del Portal UTZMG (modo seguro)...');

  if (process.env.SEED_FORCE_RESET === 'true') {
    console.warn('⚠️ SEED_FORCE_RESET=true — borrando catálogo, usuarios y roles (solo desarrollo).');
    await prisma.auditLog.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
  }

  const roleMap = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: { ...r, isSystem: true },
    });
    roleMap[r.name] = role;
  }
  console.log('✅ Roles institucionales verificados');

  const syncApps = process.env.SEED_SYNC_APPS === 'true';
  for (const app of applicationsData) {
    if (syncApps) {
      await prisma.application.upsert({
        where: { code: app.code },
        update: {
          name: app.name,
          description: app.description,
          url: app.url,
          icon: app.icon,
          category: app.category,
          authType: app.authType,
          openIn: app.openIn,
          orderIndex: app.orderIndex,
          status: app.status,
          isVisible: app.isVisible,
          requiredRoles: app.requiredRoles,
        },
        create: app,
      });
    } else {
      await prisma.application.upsert({
        where: { code: app.code },
        update: {},
        create: app,
      });
    }
  }
  console.log(
    syncApps
      ? '✅ Aplicaciones sincronizadas desde seed (SEED_SYNC_APPS=true)'
      : '✅ Aplicaciones verificadas (solo crea faltantes; no modifica las existentes)'
  );

  const adminEmail = 'apps@utzmg.edu.mx';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Administrador Institucional UTZMG',
      status: 'ACTIVE',
    },
    create: {
      email: adminEmail,
      name: 'Administrador Institucional UTZMG',
      status: 'ACTIVE',
    },
  });

  const adminRole = roleMap.admin;
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }
  console.log(`✅ Usuario administrador verificado (${adminEmail})`);

  const initLog = await prisma.auditLog.findFirst({
    where: { action: 'SYSTEM_INITIALIZATION' },
  });

  if (!initLog) {
    await prisma.auditLog.create({
      data: {
        userEmail: 'sistema@utzmg.edu.mx',
        action: 'SYSTEM_INITIALIZATION',
        targetResource: 'portal:config_actualizada',
        details: JSON.stringify({
          message: 'Portal UTZMG inicializado con aplicaciones y roles base.',
        }),
        ipAddress: '127.0.0.1',
        userAgent: 'Portal-UTZMG-Seed',
      },
    });
  }

  console.log('🚀 Seed completado sin borrar datos existentes.');
  console.log('   Tip: en producción use MongoDB Atlas (DATABASE_URL mongodb+srv://...).');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
