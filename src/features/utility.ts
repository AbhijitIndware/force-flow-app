import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { apiBaseUrl } from './apiBaseUrl';
import { RootState } from '../store/store';

// We avoid importing from ./auth/auth to prevent circular dependencies.
// Action types are derived from the 'authSlice' slice name.
const LOGOUT_TYPE = 'authSlice/logout';
const SET_SESSION_EXPIRED_TYPE = 'authSlice/setSessionExpired';
const SET_GLOBAL_ERROR_TYPE = 'authSlice/setGlobalError';

export const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const sId = (getState() as RootState).persistedReducer.authSlice.sId;
    const zone = (getState() as RootState).persistedReducer.authSlice.employee?.zone;

    const api_key = (getState() as RootState).persistedReducer.authSlice?.api_credentials?.api_key;
    const api_secret = (getState() as RootState).persistedReducer.authSlice?.api_credentials?.api_secret;

    const encodedAuth = btoa(`${api_key}:${api_secret}`);

    if (sId) {
      headers.set('sId', `${sId}`);
      headers.set('zone', `${zone}`);
    }
    if (api_key && api_secret) {
      headers.set('Authorization', `Basic ${encodedAuth}`);
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
  console.log("🚀 ~ baseQueryWithAuthGuard ~ result:", result)

  if (result?.error) {
    if (result.error.status === 401) {
      // Show the session-expired banner, then log out after a short delay
      api.dispatch({ type: SET_SESSION_EXPIRED_TYPE, payload: true });
      setTimeout(() => {
        api.dispatch({ type: SET_SESSION_EXPIRED_TYPE, payload: false });
        api.dispatch({ type: LOGOUT_TYPE });
      }, 3000);
    } else {
      // Dispatch other errors to global state
      api.dispatch({ type: SET_GLOBAL_ERROR_TYPE, payload: result.error });
    }
  }
  return result;
};


export const baseQueryForTada = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const api_key = (getState() as RootState).persistedReducer.authSlice?.api_credentials?.api_key;
    const api_secret = (getState() as RootState).persistedReducer.authSlice?.api_credentials?.api_secret;

    const encodedAuth = btoa(`${api_key}:${api_secret}`);

    if (api_key && api_secret) {
      headers.set('Authorization', `Basic ${encodedAuth}`);
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
  console.log("🚀 ~ baseQueryForTadaWithAuthGuard ~ result:", result)

  if (result?.error) {
    if (result.error.status === 401) {
      // Show the session-expired banner, then log out after a short delay
      api.dispatch({ type: SET_SESSION_EXPIRED_TYPE, payload: true });
      setTimeout(() => {
        api.dispatch({ type: SET_SESSION_EXPIRED_TYPE, payload: false });
        api.dispatch({ type: LOGOUT_TYPE });
      }, 3000);
    } else {
      // Dispatch other errors to global state
      api.dispatch({ type: SET_GLOBAL_ERROR_TYPE, payload: result.error });
    }
  }
  return result;
};
