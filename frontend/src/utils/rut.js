/**
 * Utilidades de RUT chileno: formato progresivo al teclear y
 * validación del dígito verificador (módulo 11).
 */

const RUT_BODY_DV_RE = /^\d{1,2}(?:\.\d{3}){2}-([\dKk])$/;

function groupBody(body) {
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function onlyRutChars(value) {
  return String(value || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();
}

/**
 * Reformatea lo tecleado a NN.NNN.NNN-DV de forma progresiva.
 * El último carácter siempre se trata como DV; si aún no existe, se omite el guion.
 */
export function formatRut(value) {
  const clean = onlyRutChars(value);
  if (!clean) return '';
  if (clean.length === 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${groupBody(body)}-${dv}`;
}

/**
 * Valida formato completo y dígito verificador (módulo 11).
 */
export function isValidRut(rut) {
  const normalized = String(rut || '').trim();
  const match = RUT_BODY_DV_RE.exec(normalized);
  if (!match) return false;
  const dv = match[1].toUpperCase();
  const body = normalized.slice(0, normalized.lastIndexOf('-')).replace(/\./g, '');

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
  return dv === expected;
}
