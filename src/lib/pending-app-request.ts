import type { NewAppRequestForm } from './access-request-messages';

export function slugifyAppCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function mapAuthTypeLabelToValue(labelOrValue: string): string {
  const raw = labelOrValue.trim();
  if (['SSO_JWT_TOKEN', 'GOOGLE_SESSION', 'DIRECT_LINK'].includes(raw)) {
    return raw;
  }
  const lower = raw.toLowerCase();
  if (lower.includes('sso')) return 'SSO_JWT_TOKEN';
  if (lower.includes('google')) return 'GOOGLE_SESSION';
  return 'DIRECT_LINK';
}

export function resolveRequiredRolesFromRequest(form: NewAppRequestForm): string {
  if (form.visibility === 'Solo perfiles específicos') {
    return (form.visibilityRoles || '')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
      .join(',');
  }
  return '';
}

export function buildPendingAppCode(form: NewAppRequestForm): string {
  const fromCode = form.appCode?.trim() ? slugifyAppCode(form.appCode) : '';
  const fromName = slugifyAppCode(form.appName);
  return fromCode || fromName || `app-${Date.now()}`;
}

export function buildRequestNotes(form: NewAppRequestForm): string {
  return JSON.stringify({
    responsible: form.responsible,
    department: form.department || null,
    supportEmail: form.supportEmail || null,
    desiredDate: form.desiredDate || null,
    ssoUrl: form.ssoUrl || null,
    visibility: form.visibility,
    comment: form.comment || null,
  });
}
