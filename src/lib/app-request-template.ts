export { NEW_APP_REQUEST_BODY as APP_REQUEST_EMAIL_TEMPLATE } from './access-request-messages';

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
