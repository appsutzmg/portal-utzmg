/** Validación compartida para imágenes en base64 (avatar, logos de apps). */

export const IMAGE_DATA_URL_REGEX = /^data:image\/(jpeg|jpg|png|webp|svg\+xml);base64,/;

export function isValidImageDataUrl(dataUrl: string): boolean {
  return IMAGE_DATA_URL_REGEX.test(dataUrl);
}

export function estimateBase64Bytes(dataUrl: string): number {
  const base64Part = dataUrl.split(',')[1] || '';
  return Math.ceil((base64Part.length * 3) / 4);
}

export function validateImageDataUrl(
  dataUrl: string,
  maxBytes: number
): { ok: true } | { ok: false; message: string } {
  if (!isValidImageDataUrl(dataUrl)) {
    return { ok: false, message: 'Formato no válido. Use JPG, PNG, WebP o SVG.' };
  }

  if (estimateBase64Bytes(dataUrl) > maxBytes) {
    const maxKb = Math.round(maxBytes / 1024);
    return { ok: false, message: `La imagen es muy grande. Máximo ${maxKb} KB.` };
  }

  return { ok: true };
}
