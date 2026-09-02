export {
  PORTAL_ADMIN_EMAIL,
  NEW_APP_REQUEST_SUBJECT,
  NEW_APP_REQUEST_BODY,
  buildAppAccessRequestMessage,
  buildGeneralAccessRequestMessage,
  buildNewAppRequestMessage,
} from './access-request-messages';

import {
  PORTAL_ADMIN_EMAIL,
  buildAppAccessRequestMessage,
  buildGeneralAccessRequestMessage,
  buildNewAppRequestMessage,
} from './access-request-messages';

/** @deprecated Usar API /api/access-requests para envío directo */
export function buildMailtoLink(params: {
  to?: string;
  subject: string;
  body: string;
}): string {
  const to = params.to || PORTAL_ADMIN_EMAIL;
  const query = new URLSearchParams({
    subject: params.subject,
    body: params.body,
  });
  return `mailto:${to}?${query.toString()}`;
}

/** @deprecated Usar API /api/access-requests */
export function buildNewAppRequestMailto(): string {
  const { subject, body } = buildNewAppRequestMessage();
  return buildMailtoLink({ subject, body });
}

/** @deprecated Usar API /api/access-requests */
export function buildAppAccessRequestMailto(params: {
  userName: string;
  userEmail: string;
  userRoles: string[];
  appName: string;
  appCode: string;
  comment?: string;
}): string {
  const { subject, body } = buildAppAccessRequestMessage(params);
  return buildMailtoLink({ subject, body });
}

/** @deprecated Usar API /api/access-requests */
export function buildGeneralAccessRequestMailto(params: {
  userName: string;
  userEmail: string;
  userRoles: string[];
  appName: string;
  comment?: string;
}): string {
  const { subject, body } = buildGeneralAccessRequestMessage(params);
  return buildMailtoLink({ subject, body });
}
