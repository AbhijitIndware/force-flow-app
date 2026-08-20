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

// We avoid importing from ./auth/auth to prevent circular dependencies.
// Action types are derived from the 'authSlice' slice name.
const LOGOUT_TYPE = 'authSlice/logout';
const SET_SESSION_EXPIRED_TYPE = 'authSlice/setSessionExpired';
const SET_GLOBAL_ERROR_TYPE = 'authSlice/setGlobalError';

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

export const baseQueryWithAuthGuard: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error) {
    if (result.error.status === 401) {
      // Show the session-expired banner, then log out after a short delay
      api.dispatch({type: SET_SESSION_EXPIRED_TYPE, payload: true});
      setTimeout(() => {
        api.dispatch({type: SET_SESSION_EXPIRED_TYPE, payload: false});
        clearSecureSession();
        api.dispatch({type: LOGOUT_TYPE});
      }, 3000);
    } else {
      // Dispatch other errors to global state
      api.dispatch({type: SET_GLOBAL_ERROR_TYPE, payload: result.error});
    }
  }
  return result;
};

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

export const baseQueryForTadaWithAuthGuard: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryForTada(args, api, extraOptions);

  if (result?.error) {
    if (result.error.status === 401) {
      // Show the session-expired banner, then log out after a short delay
      api.dispatch({type: SET_SESSION_EXPIRED_TYPE, payload: true});
      setTimeout(() => {
        api.dispatch({type: SET_SESSION_EXPIRED_TYPE, payload: false});
        clearSecureSession();
        api.dispatch({type: LOGOUT_TYPE});
      }, 3000);
    } else {
      // Dispatch other errors to global state
      api.dispatch({type: SET_GLOBAL_ERROR_TYPE, payload: result.error});
    }
  }
  return result;
};
