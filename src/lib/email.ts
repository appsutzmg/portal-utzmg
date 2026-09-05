import nodemailer from 'nodemailer';

const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 12000);

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getSmtpPort(): number {
  const port = Number(process.env.SMTP_PORT || 587);
  return Number.isFinite(port) ? port : 587;
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'portal@utzmg.edu.mx'
  );
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} excedió el tiempo de espera (${ms} ms).`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function sendInstitutionalEmail(params: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error(
      'El envío de correo no está configurado. Contacte al administrador del portal.'
    );
  }

  const port = getSmtpPort();
  const secure =
    process.env.SMTP_SECURE === 'true' || (port === 465 && process.env.SMTP_SECURE !== 'false');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port,
    secure,
    requireTLS: port === 587,
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.replace(/^["']|["']$/g, '').trim(),
    },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });

  try {
    await withTimeout(
      transporter.sendMail({
        from: getFromAddress(),
        to: params.to,
        replyTo: params.replyTo,
        subject: params.subject,
        text: params.text,
      }),
      SMTP_TIMEOUT_MS,
      'El envío de correo'
    );
  } finally {
    transporter.close();
  }
}
