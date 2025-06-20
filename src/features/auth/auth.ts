import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {createSlice} from '@reduxjs/toolkit';
import {apiBaseUrl} from '../apiBaseUrl.js';
import {ILogin, RLogin} from '../../types/authType';

//Auth api calling
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
  }),
  tagTypes: ['Login'],
  endpoints: builder => ({
    login: builder.mutation<RLogin, ILogin>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.login.login',
        method: 'POST',
        body,
      }),
    }),
  }),
});

interface InitialState {
  status?: String | null;
  loading?: Boolean;
  error?: Boolean;
  user: any | null;
  api_credentials: any | null;
  employee: any | null;
  sId: string | null;
}
const initialState: InitialState = {
  status: null,
  loading: false,
  error: false,
  user: null,
  api_credentials: null,
  employee: null,
  sId: null,
};

//auth api response handling(saving the token)
export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    logout: state => {
      state.status = null;
      state.loading = false;
      state.error = false;
      state.user = null;
      state.api_credentials = null;
      state.employee = null;
      state.sId = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.status = 'Fullfilled';
        state.loading = false;
        state.error = false;
        state.employee = action?.payload.message?.employee;
        state.api_credentials = action?.payload.message?.api_credentials;
        state.user = action?.payload.message?.user;
        state.sId = action?.payload.message?.user?.sid;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, state => {
        state.status = 'Rejected';
        state.loading = false;
        state.error = true;
      })
      .addMatcher(authApi.endpoints.login.matchPending, state => {
        state.status = 'Pending';
        state.loading = true;
        state.error = false;
      });
  },
});

export const {logout} = authSlice.actions;
export default authSlice.reducer;
export const {useLoginMutation} = authApi;
