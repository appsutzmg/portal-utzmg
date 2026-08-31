const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Configurando roles y aplicaciones de la UTZMG...');

  // Limpiar aplicaciones anteriores para dejar exactamente las 2 requeridas
  await prisma.application.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 1. Roles Institucionales Exactos
  const rolesData = [
    {
      name: 'admin',
      displayName: 'Administrador',
      description: 'Acceso total y administración del portal, catálogo y ambas aplicaciones',
    },
    {
      name: 'profesor',
      displayName: 'Profesor',
      description: 'Acceso a Proyectos Integradores y Sistema de Tutorías',
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

  const roleMap = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: { ...r, isSystem: true },
    });
    roleMap[r.name] = role;
  }
  console.log('✅ Roles institucionales creados');

  // 2. Las 2 Aplicaciones Institucionales Actuales
  const applicationsData = [
    {
      code: 'proyectos-integradores',
      name: 'Sistema de Evaluación de Proyectos Integradores',
      description: 'Plataforma para asignación de jurados, registro de rúbricas de evaluación, fechas de exposición y actas de proyectos integradores.',
      url: 'https://evaluacion-proyectos-frontend-wkgt.onrender.com/sso',
      icon: 'FolderKanban',
      category: 'Académica',
      authType: 'SSO_JWT_TOKEN',
      openIn: '_blank',
      orderIndex: 1,
      status: 'ACTIVE',
      isVisible: true,
      requiredRoles: 'admin,profesor,asistente,coordinador_proyectos',
    },
    {
      code: 'tutorias',
      name: 'Sistema de Gestión de Tutorías',
      description: 'Plataforma institucional para el seguimiento tutorial, registro de sesiones individuales/grupales, concentrados y evaluación cualitativa.',
      url: 'https://script.google.com/a/macros/utzmg.edu.mx/s/AKfycbyGEEIK0ohZB3eECRYPZXdVmJbECsIHUTiql5U3J78HNonoSBp242blSAHwePj8wDhe/exec',
      icon: 'Users',
      category: 'Académica',
      authType: 'GOOGLE_SESSION',
      openIn: '_blank',
      orderIndex: 2,
      status: 'ACTIVE',
      isVisible: true,
      requiredRoles: 'admin,profesor,tutor,direccion_academica',
    },
  ];

  for (const app of applicationsData) {
    await prisma.application.create({
      data: app,
    });
  }
  console.log('✅ Las 2 aplicaciones institucionales registradas con sus roles autorizados');

  // 3. Usuarios de Demostración para Pruebas de Roles (@utzmg.edu.mx)
  const usersData = [
    {
      email: 'admin@utzmg.edu.mx',
      name: 'Administrador Institucional UTZMG',
      roles: ['admin'],
    },
    {
      email: 'profesor@utzmg.edu.mx',
      name: 'Profesor / Docente',
      roles: ['profesor'],
    },
    {
      email: 'coordinador.proyectos@utzmg.edu.mx',
      name: 'Coordinador de Proyectos',
      roles: ['coordinador_proyectos'],
    },
    {
      email: 'asistente.proyectos@utzmg.edu.mx',
      name: 'Asistente de Proyectos',
      roles: ['asistente'],
    },
    {
      email: 'tutor@utzmg.edu.mx',
      name: 'Tutor Institucional',
      roles: ['tutor'],
    },
    {
      email: 'direccion.academica@utzmg.edu.mx',
      name: 'Dirección Académica',
      roles: ['direccion_academica'],
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: { email: u.email, name: u.name, status: 'ACTIVE' },
    });

    for (const roleName of u.roles) {
      const role = roleMap[roleName];
      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }
  }
  console.log('✅ Usuarios de prueba creados para cada rol');

  // 4. Bitácora de Auditoría
  await prisma.auditLog.create({
    data: {
      userEmail: 'sistema@utzmg.edu.mx',
      action: 'SYSTEM_INITIALIZATION',
      targetResource: 'portal:config_actualizada',
      details: JSON.stringify({
        message: 'Portal UTZMG configurado con las 2 aplicaciones actuales y sus roles autorizados.',
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'Portal-UTZMG-Seed',
    },
  });

  console.log('🚀 Base de datos sincronizada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
