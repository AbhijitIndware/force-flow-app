import {imageBaseUrl} from '../features/apiBaseUrl';

export const FORBIDDEN_NAME_CHARACTERS = /[<>\-{}\[\]\x00-\x1F\x7F]/;

export function hasForbiddenNameCharacters(value?: string | null): boolean {
  return !!value && FORBIDDEN_NAME_CHARACTERS.test(value);
}

export function getForbiddenNameMessage(fieldLabel: string): string {
  return `${fieldLabel} cannot contain <, >, -, {, }, [, ], or control characters.`;
}

export function normalizeMediaUrl(uri?: string | null): string {
  if (!uri) return '';
  if (/^https?:\/\//i.test(uri)) return uri;
  if (uri.startsWith(imageBaseUrl)) return uri;
  if (uri.startsWith('/')) return `${imageBaseUrl}${uri}`;
  return `${imageBaseUrl}/${uri}`;
}

export function isPrivateMediaUrl(uri?: string | null): boolean {
  return !!uri && normalizeMediaUrl(uri).includes('/private/files/');
}

export function buildAuthHeaders(authState?: {
  sId?: string | null;
  employee?: {zone?: string | null} | null;
  api_credentials?: {api_key?: string | null; api_secret?: string | null} | null;
  api_key?: string | null;
  api_secret?: string | null;
  zone?: string | null;
} | null): Record<string, string> {
  if (!authState) return {};

  const sId = authState.sId ?? '';
  const zone = authState.employee?.zone ?? authState.zone ?? '';
  const apiKey = authState.api_credentials?.api_key ?? authState.api_key ?? '';
  const apiSecret =
    authState.api_credentials?.api_secret ?? authState.api_secret ?? '';

  const headers: Record<string, string> = {};

  if (sId) {
    headers.sId = sId;
  }
  if (zone) {
    headers.zone = zone;
  }
  if (apiKey && apiSecret) {
    headers.Authorization = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;
  }

  return headers;
}

function parseSeconds(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? Math.ceil(value) : null;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.ceil(parsed);
    }
  }
  return null;
}

function extractSecondsFromMessage(message?: string | null): number | null {
  if (!message) return null;
  const compact = message.toLowerCase();
  const match = compact.match(/(\d+)\s*(second|seconds|minute|minutes|min|mins|hour|hours|hr|hrs)/);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  if (unit.startsWith('hour') || unit.startsWith('hr')) {
    return amount * 60 * 60;
  }
  if (unit.startsWith('minute') || unit.startsWith('min')) {
    return amount * 60;
  }
  return amount;
}

export function getRetryAfterSeconds(result: any): number | null {
  const headerValue =
    result?.meta?.response?.headers?.get?.('Retry-After') ??
    result?.meta?.response?.headers?.get?.('retry-after');
  const fromHeader = parseSeconds(headerValue);
  if (fromHeader) return fromHeader;

  const data = result?.error?.data ?? result?.data ?? result;
  const directKeys = [
    data?.retry_after_seconds,
    data?.retryAfterSeconds,
    data?.retry_after,
    data?.retryAfter,
    data?.retry_after_secs,
    data?.lockout_seconds,
    data?.lockout_duration_seconds,
    data?.block_seconds,
  ];

  for (const entry of directKeys) {
    const parsed = parseSeconds(entry);
    if (parsed) return parsed;
  }

  return extractSecondsFromMessage(
    typeof data?.message === 'string'
      ? data.message
      : data?.message?.message ?? data?.message?.detail ?? data?.exception,
  );
}

export function getRetryAfterUntil(result: any): number | null {
  const seconds = getRetryAfterSeconds(result);
  return seconds ? Date.now() + seconds * 1000 : null;
}

export function getResetToken(payload: any): string | null {
  const token =
    payload?.message?.reset_token ??
    payload?.message?.data?.reset_token ??
    payload?.reset_token ??
    payload?.data?.reset_token;
  return typeof token === 'string' && token.trim() ? token : null;
}

export function isExpiredTokenError(error: any): boolean {
  const data = error?.data ?? error;
  const message =
    typeof data?.message === 'string'
      ? data.message
      : data?.message?.message ?? data?.exception ?? '';
  return /expired.*token|token.*expired|reset token/i.test(message);
}

export function isLockedOutPayload(payload: any): boolean {
  return payload?.locked_out === true || payload?.message?.locked_out === true;
}

