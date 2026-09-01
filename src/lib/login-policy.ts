/**
 * Acceso por usuario/correo sin verificación de Google.
 * Solo habilitar en desarrollo local (ALLOW_EMAIL_ONLY_LOGIN=true).
 * En producción debe usarse únicamente Google OAuth.
 */
export function isEmailOnlyLoginAllowed(): boolean {
  return process.env.ALLOW_EMAIL_ONLY_LOGIN === 'true';
}

/** Misma política, expuesta al cliente vía NEXT_PUBLIC_*. */
export function isEmailOnlyLoginAllowedClient(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_EMAIL_ONLY_LOGIN === 'true';
}
