import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import {apiBaseUrl} from './apiBaseUrl';
import {RootState} from '../store/store';
import {
  clearSecureSession,
  getCachedSecureSession,
} from '../utils/secureStorage';
import {getRetryAfterUntil} from '../utils/security';

// We avoid importing from ./auth/auth to prevent circular dependencies.
// Action types are derived from the 'authSlice' slice name.
const LOGOUT_TYPE = 'authSlice/logout';
const SET_SESSION_EXPIRED_TYPE = 'authSlice/setSessionExpired';
const SET_GLOBAL_ERROR_TYPE = 'authSlice/setGlobalError';
const SET_RATE_LIMIT_UNTIL_TYPE = 'authSlice/setRateLimitUntil';
const SET_UPDATE_REQUIRED_TYPE = 'authSlice/setUpdateRequired';

// 503 "The server is busy": retry once after this delay (never loop).
const BUSY_RETRY_DELAY_MS = 3000;
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

function getBodyMessage(data: any): string | undefined {
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.message?.message === 'string') return data.message.message;
  if (typeof data?.exception === 'string') return data.exception;
  return undefined;
}

export const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'omit',
  prepareHeaders: (headers, {getState}) => {
    const auth = (getState() as RootState).persistedReducer.authSlice;
    const secure = getCachedSecureSession();

    const sId = auth.sId || secure?.sid || '';
    const zone = auth.employee?.zone || secure?.zone || '';

    const api_key = auth?.api_credentials?.api_key || secure?.api_key || '';
    const api_secret =
      auth?.api_credentials?.api_secret || secure?.api_secret || '';

    if (sId) {
      headers.set('sId', `${sId}`);
      if (zone) {
        headers.set('zone', `${zone}`);
      }
    }
    if (api_key && api_secret) {
      headers.set('Authorization', `Basic ${btoa(`${api_key}:${api_secret}`)}`);
    }
    return headers;
  },
});


// Runs a request, retrying once on 503, and applies the app-wide handling
// for 401 / 426 / 429 and other errors.
const withGuards =
  (
    query: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  ): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
  async (args, api, extraOptions) => {
    let result = await query(args, api, extraOptions);
    if (result?.error?.status === 503) {
      await wait(BUSY_RETRY_DELAY_MS);
      result = await query(args, api, extraOptions);
    }

    if (result?.error) {
      const status = result.error.status;
      if (status === 401) {
        // Show the session-expired banner, then log out after a short delay
        api.dispatch({type: SET_SESSION_EXPIRED_TYPE, payload: true});
        setTimeout(() => {
          api.dispatch({type: SET_SESSION_EXPIRED_TYPE, payload: false});
          clearSecureSession();
          api.dispatch({type: LOGOUT_TYPE});
        }, 3000);
      } else if (status === 426) {
        // Upgrade Required: this app version is no longer accepted.
        api.dispatch({
          type: SET_UPDATE_REQUIRED_TYPE,
          payload:
            getBodyMessage(result.error.data) ??
            'Update required! Please install the latest version of the app.',
        });
      } else if (status === 429) {
        // HTTP 429 Too Many Requests: Parse Retry-After header/body and set countdown
        const until = getRetryAfterUntil(result);
        if (until) {
          api.dispatch({type: SET_RATE_LIMIT_UNTIL_TYPE, payload: until});
        }
        api.dispatch({type: SET_GLOBAL_ERROR_TYPE, payload: result.error});
      } else {
        // 403 and others: don't log out, just record the error
        api.dispatch({type: SET_GLOBAL_ERROR_TYPE, payload: result.error});
      }
    }
    return result;
  };

export const baseQueryWithAuthGuard = withGuards(baseQuery);

export const baseQueryForTada = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'omit',
  prepareHeaders: (headers, {getState}) => {
    const auth = (getState() as RootState).persistedReducer.authSlice;
    const secure = getCachedSecureSession();

    const api_key = auth?.api_credentials?.api_key || secure?.api_key || '';
    const api_secret =
      auth?.api_credentials?.api_secret || secure?.api_secret || '';

    if (api_key && api_secret) {
      headers.set('Authorization', `Basic ${btoa(`${api_key}:${api_secret}`)}`);
    }
    return headers;
  },
});

export const baseQueryForTadaWithAuthGuard = withGuards(baseQueryForTada);
