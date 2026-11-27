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

// The server reports many failures as HTTP 200 with `message.status: "error"`
// or `message.success: false`, so unwrap() doesn't throw. Call this after
// unwrap() to send those to the catch block; getUserFacingError reads the
// server's message from the thrown value.
export function assertServerSuccess<T>(res: T): T {
  const body = (res as any)?.message;
  if (body?.status === 'error' || body?.success === false) {
    throw {data: res};
  }
  return res;
}

// True unless the body says it failed (`success: false` or
// `status: "error"`). Some endpoints answer success without a `success`
// field, so don't require `success === true`.
export function isServerSuccess(res: any): boolean {
  const body = res?.message;
  return !(body?.success === false || body?.status === 'error');
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

// The server's answer body (`message` object) from either a resolved
// response or a thrown RTK Query error, so callers can read `error_code`,
// `data` and other fields on every HTTP status.
export function getServerBody(resOrError: any): any {
  const root = resOrError?.data ?? resOrError;
  const body = root?.message;
  return body && typeof body === 'object' ? body : root ?? {};
}

export function getServerErrorCode(resOrError: any): string | undefined {
  return getServerBody(resOrError)?.error_code;
}

// Warnings Frappe attaches to a successful answer (`_server_messages`).
// Only show these where the server's notes are meant for the user (stock
// count); elsewhere they are internal and must be ignored.
export function getServerWarnings(res: any): string[] {
  const raw = res?._server_messages ?? res?.data?._server_messages;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) return [];
    return rows
      .map(row => {
        if (typeof row !== 'string') return '';
        try {
          const parsed = JSON.parse(row);
          return typeof parsed?.message === 'string' ? parsed.message : '';
        } catch {
          return row;
        }
      })
      .map(text => text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(text => text && !UNSAFE_MESSAGE_PATTERN.test(text));
  } catch {
    return [];
  }
}
