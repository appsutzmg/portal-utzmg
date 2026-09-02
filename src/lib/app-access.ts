export function normalizeRoleName(role: string): string {
  return role.trim().toLowerCase();
}

export function parseRequiredRoles(requiredRoles: string | null | undefined): string[] {
  if (!requiredRoles || !requiredRoles.trim()) return [];
  return requiredRoles.split(',').map(normalizeRoleName).filter(Boolean);
}

export function getUserRoleSet(roles: string[]): Set<string> {
  return new Set(roles.map(normalizeRoleName));
}

export interface AppAccessTarget {
  requiredRoles: string;
}

export interface AppAccessUser {
  roles: string[];
  isAdmin?: boolean;
}

/** true si el usuario puede ver y lanzar la aplicación */
export function canUserAccessApplication(
  user: AppAccessUser,
  app: AppAccessTarget,
  options?: { adminBypass?: boolean }
): boolean {
  const adminBypass = options?.adminBypass !== false;
  if (adminBypass && user.isAdmin) return true;

  const required = parseRequiredRoles(app.requiredRoles);
  // Sin roles requeridos = abierto a toda la comunidad institucional autenticada
  if (required.length === 0) return true;

  const userRoles = getUserRoleSet(user.roles);
  return required.some((role) => userRoles.has(role));
}
