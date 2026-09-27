import {isExpiredTokenError} from './security';

const UNSAFE_MESSAGE_PATTERN = /Traceback|File "|Exception|Error:/i;

function getFrappeServerMessage(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const rows = JSON.parse(value);
    if (!Array.isArray(rows)) return undefined;
    for (const row of rows) {
      if (typeof row !== 'string') continue;
      try {
        const parsed = JSON.parse(row);
        if (typeof parsed?.message === 'string') return parsed.message;
      } catch {
        if (row.trim()) return row;
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function getUserFacingError(
  error: any,
  fallback = 'Something went wrong. Please try again.'
): string {
  const data = error?.data ?? error;

  const msg =
    typeof data?.message === 'string'
      ? data.message
      : data?.message?.message ?? getFrappeServerMessage(data?._server_messages) ??
        data?.exception;

  if (msg && !UNSAFE_MESSAGE_PATTERN.test(msg)) {
    return msg;
  }

  const status = error?.status;

  if (status === 401) {
    return 'Session expired. Please log in again.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait before trying again.';
  }

  if (status === 404) {
    return 'Requested resource was not found.';
  }

  if (status >= 500) {
    return 'Server error. Please try again later.';
  }

  return fallback;
}

export function getPermissionErrorMessage(error: any): string {
  const data = error?.data ?? error;
  const message =
    typeof data?.message === 'string'
      ? data.message
      : data?.message?.message ?? data?.exception;

  if (message && !UNSAFE_MESSAGE_PATTERN.test(message)) {
    return message;
  }

  return 'You do not have permission to access this data.';
}

export function isExpiredResetTokenError(error: any): boolean {
  return isExpiredTokenError(error);
}

export function getSafeServerMessage(
  message: unknown,
  fallback?: string,
): string | undefined {
  if (typeof message !== 'string') {
    return fallback;
  }

  if (UNSAFE_MESSAGE_PATTERN.test(message)) {
    return fallback;
  }

  return message;
}
