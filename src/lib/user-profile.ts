type DbUserWithRoles = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  status: string;
  roles: Array<{ role: { name: string; displayName: string } }>;
};

export interface PortalUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
  roleLabels: string[];
  isAdmin: boolean;
}

export function mapDbUserToSession(dbUser: DbUserWithRoles): PortalUserProfile {
  const roles = dbUser.roles.map((r) => r.role.name);
  const roleLabels = dbUser.roles.map((r) => r.role.displayName);

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    roles,
    roleLabels,
    isAdmin: roles.includes('admin'),
  };
}

export function getUserSubtitle(user: Pick<PortalUserProfile, 'roleLabels' | 'email'>): string {
  if (user.roleLabels.length > 0) {
    return user.roleLabels.join(' · ');
  }
  return user.email;
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}
