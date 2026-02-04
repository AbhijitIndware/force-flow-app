import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import {apiBaseUrl} from './apiBaseUrl';
import {RootState} from '../store/store';
import {logout} from './auth/auth';

export const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, {getState}) => {
    const sId = (getState() as RootState).persistedReducer.authSlice.sId;
    // console.log('🚀 ~ sId:', sId);

    if (sId) {
      headers.set('sId', `${sId}`);
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
  // console.log('🚀 ~ baseQueryWithAuthGuard ~ result:', result);

  if (result?.error && result?.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};
