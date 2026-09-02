export const PORTAL_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'apps@utzmg.edu.mx';

export const NEW_APP_REQUEST_SUBJECT =
  'Solicitud de alta en Portal UTZMG — Nueva aplicación';

export const NEW_APP_REQUEST_BODY = `Estimado equipo del Portal UTZMG,

Solicito registrar la siguiente aplicación en el catálogo institucional:

1. Nombre de la aplicación:
2. Código sugerido (slug, ej. mi-sistema):
3. URL de la aplicación (https://...):
4. Descripción breve (2–4 oraciones para la tarjeta del portal):

5. Categoría (marque una):
   [ ] Académica   [ ] Gestión   [ ] Servicios   [ ] Administración

6. Logo adjunto (PNG/JPG/WebP/SVG, máx. 300 KB):  [ ] Sí   [ ] No

7. ¿Quién debe ver la tarjeta en el portal?
   [ ] Toda la comunidad @utzmg.edu.mx
   [ ] Solo perfiles específicos (indique cuáles):
       _______________________________________________

8. Tipo de acceso desde el portal (marque una):
   [ ] SSO Portal — sin volver a iniciar sesión
   [ ] Sesión Google del navegador
   [ ] Enlace directo / login propio

9. URL técnica para SSO (si aplica):
10. Responsable de la aplicación (nombre y correo @utzmg.edu.mx):
11. Área o departamento:
12. Correo de soporte para usuarios finales:
13. Fecha deseada de publicación:

Gracias.`;

export function buildAppAccessRequestMessage(params: {
  userName: string;
  userEmail: string;
  userRoles: string[];
  appName: string;
  appCode: string;
  comment?: string;
}): { subject: string; body: string } {
  const rolesLabel =
    params.userRoles.length > 0 ? params.userRoles.join(', ') : '(sin roles asignados)';

  const body = `Solicitud de acceso — Portal UTZMG

Aplicación solicitada: ${params.appName}
Código: ${params.appCode}

Datos del solicitante:
- Nombre: ${params.userName}
- Correo: ${params.userEmail}
- Roles actuales en el portal: ${rolesLabel}

Motivo o comentario:
${params.comment?.trim() || '(indique por qué necesita acceso a esta aplicación)'}

Gracias.`;

  return {
    subject: `Solicitud de acceso — ${params.appName}`,
    body,
  };
}

export function buildGeneralAccessRequestMessage(params: {
  userName: string;
  userEmail: string;
  userRoles: string[];
  appName: string;
  comment?: string;
}): { subject: string; body: string } {
  const rolesLabel =
    params.userRoles.length > 0 ? params.userRoles.join(', ') : '(sin roles asignados)';

  const body = `Solicitud de acceso — Portal UTZMG

Aplicación o sistema: ${params.appName}

Datos del solicitante:
- Nombre: ${params.userName}
- Correo: ${params.userEmail}
- Roles actuales en el portal: ${rolesLabel}

Motivo o comentario:
${params.comment?.trim() || '(describa el acceso que necesita)'}

Gracias.`;

  return {
    subject: `Solicitud de acceso — ${params.appName}`,
    body,
  };
}

export function buildNewAppRequestMessage(): { subject: string; body: string } {
  return {
    subject: NEW_APP_REQUEST_SUBJECT,
    body: NEW_APP_REQUEST_BODY,
  };
}
