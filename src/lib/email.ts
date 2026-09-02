import nodemailer from 'nodemailer';

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
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.text,
  });
}
