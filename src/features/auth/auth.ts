import { createApi } from '@reduxjs/toolkit/query/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { baseQueryWithAuthGuard } from '../utility';
import {
  ApiCredentials,
  Employee,
  EmployeeProfileResponse,
  ILogin,
  RCheckSession,
  RLogin,
} from '../../types/authType';
import { Distributor } from '../../types/baseType.js';
import { clearSecureSession, SecureSession } from '../../utils/secureStorage';

//Auth api calling
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['Login'],
  endpoints: builder => ({
    login: builder.mutation<RLogin, ILogin>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.login.login',
        method: 'POST',
        body,
      }),
    }),
    checkSession: builder.query<RCheckSession, { sId: string }>({
      query: ({ sId }) => ({
        url: `/method/salesforce_management.mobile_app_apis.authentications.login.check_session?sid=${sId}`,
        method: 'GET',
      }),
    }),
    getProfileData: builder.query<EmployeeProfileResponse, { emp_id: string }>({
      query: ({ emp_id }) => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.profile.profile_data',
        method: 'GET',
        params: {
          emp_id,
        },
      }),
    }),
    sendOtp: builder.mutation<
      { message: { success: boolean; message: string } },
      { email: string }
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.login.send_otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtpAndDelete: builder.mutation<
      { message: { success: boolean; reset_token: string; message: string } },
      { email: string; otp: string }
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.login.verify_otp_and_delete',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      { message: { success: boolean; message: string } },
      { reset_token: string; new_password: string }
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.login.reset_pwd',
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
  api_credentials: ApiCredentials | null;
  employee: Employee | null;
  sId: string | null;
  empId: string | null;
  distributor: Distributor | null | undefined;
  sessionExpired: boolean;
  globalError: any | null;
  resetToken: string | null;
  rateLimitUntil: number | null;
}
const initialState: InitialState = {
  status: null,
  loading: false,
  error: false,
  user: null,
  api_credentials: null,
  employee: null,
  sId: null,
  empId: null,
  distributor: null,
  sessionExpired: false,
  globalError: null,
  resetToken: null,
  rateLimitUntil: null,
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
      state.empId = null;
      state.sessionExpired = false;
      state.resetToken = null;
      state.rateLimitUntil = null;
    },
    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    setResetToken: (state, action) => {
      state.resetToken = action.payload;
    },
    clearResetToken: state => {
      state.resetToken = null;
    },
    setRateLimitUntil: (state, action) => {
      state.rateLimitUntil = action.payload;
    },
    restoreSession: (state, action) => {
      const session = action.payload as SecureSession | null;
      state.sId = session?.sid ?? null;
      state.api_credentials =
        session?.api_key && session?.api_secret
          ? { api_key: session.api_key, api_secret: session.api_secret }
          : null;
      state.empId = session?.emp_id ?? null;
      state.user = session?.user ?? null;
      state.employee =
        session?.zone || session?.designation
          ? ({ zone: session.zone, designation: session.designation } as unknown as Employee)
          : null;
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
        state.empId = action?.payload.message?.employee?.id;
        state.distributor = action?.payload.message?.distributor;
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
      })
      .addMatcher(
        authApi.endpoints.getProfileData.matchFulfilled,
        (state, action) => {
          state.status = 'Fullfilled';
          state.loading = false;
          state.error = false;
          state.employee = action?.payload?.message?.employee;
        },
      )
      .addMatcher(authApi.endpoints.getProfileData.matchRejected, state => {
        state.status = 'Rejected';
        state.loading = false;
        state.error = true;
      })
      .addMatcher(authApi.endpoints.getProfileData.matchPending, state => {
        state.status = 'Pending';
        state.loading = true;
        state.error = false;
      });
  },
});

export const {
  logout,
  setSessionExpired,
  setGlobalError,
  setResetToken,
  clearResetToken,
  setRateLimitUntil,
  restoreSession,
} = authSlice.actions;
export default authSlice.reducer;

// Async logout: clears Keychain (secure storage) before resetting in-memory
// Redux state. Used by profile screens and on session expiry.
export const performLogout = createAsyncThunk(
  'authSlice/performLogout',
  async (_, thunkAPI) => {
    await clearSecureSession();
    thunkAPI.dispatch(logout());
  },
);

export const {
  useLoginMutation,
  useCheckSessionQuery,
  useGetProfileDataQuery,
  useSendOtpMutation,
  useVerifyOtpAndDeleteMutation,
  useResetPasswordMutation,
} = authApi;
