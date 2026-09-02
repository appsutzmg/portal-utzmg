/** Plantilla de correo para solicitar alta de una aplicación en el Portal UTZMG */
export const APP_REQUEST_EMAIL_TEMPLATE = `Asunto: Solicitud de alta en Portal UTZMG — Nueva aplicación

Estimado equipo del Portal UTZMG (apps@utzmg.edu.mx),

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
   [ ] SSO Portal — sin volver a iniciar sesión (requiere integración técnica)
   [ ] Sesión Google del navegador
   [ ] Enlace directo / login propio de la aplicación

9. URL técnica para SSO (si aplica):
10. Responsable de la aplicación (nombre y correo @utzmg.edu.mx):
11. Área o departamento:
12. Correo de soporte para usuarios finales:
13. Fecha deseada de publicación:

Gracias.
`;

export const PORTAL_ROLES = [
  { code: 'admin', label: 'Administrador', note: 'Acceso total al portal y administración' },
  { code: 'profesor', label: 'Profesor', note: 'Tutorías (no incluye Proyectos Integradores)' },
  { code: 'coordinador_proyectos', label: 'Coordinador de Proyectos', note: 'Proyectos Integradores' },
  { code: 'asistente', label: 'Asistente', note: 'Apoyo en Proyectos Integradores' },
  { code: 'tutor', label: 'Tutor', note: 'Sistema de Tutorías' },
  { code: 'direccion_academica', label: 'Dirección Académica', note: 'Supervisión académica / Tutorías' },
] as const;

export const AUTH_TYPE_OPTIONS = [
  {
    value: 'SSO_JWT_TOKEN',
    label: 'SSO Portal (sin doble login)',
    detail: 'Como Proyectos y Tutorías. Requiere mismo JWT_SECRET y URL con soporte sso_token.',
  },
  {
    value: 'GOOGLE_SESSION',
    label: 'Sesión Google del navegador',
    detail: 'El usuario ya inició sesión en Google; la app usa esa sesión.',
  },
  {
    value: 'DIRECT_LINK',
    label: 'Enlace directo',
    detail: 'Abre la URL tal cual; login propio o sitio público.',
  },
] as const;

export const APP_CATEGORIES = ['Académica', 'Gestión', 'Servicios', 'Administración'] as const;
