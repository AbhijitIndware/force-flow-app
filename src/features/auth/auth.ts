import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {createSlice} from '@reduxjs/toolkit';
import {apiBaseUrl} from '../apiBaseUrl.js';
import {ILogin, RLogin} from '../../types/authType';

let payload: any;
let token: null | string = null;

//Registration api calling
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
  }),
  tagTypes: ['Login'],
  endpoints: builder => ({
    login: builder.mutation<RLogin, ILogin>({
      query: body => ({
        url: '/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response, meta) => {
        const _token = meta?.response?.headers?.get('authorization');
        // const decodedToken: any =
        //   token && typeof token === 'string'
        //     ? jwtDecode<JwtPayload>(token as string)
        //     : null;
        token = _token!;
        // payload = decodedToken;
        return response as RLogin;
      },
    }),
  }),
});

interface InitialState {
  status?: String | null;
  loading?: Boolean;
  error?: Boolean;
  token?: string | null;
  data?: any;
}
const initialState: InitialState = {
  status: null,
  loading: false,
  error: false,
  token: null,
  data: null,
};

//login api response handling(saving the token)
export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    logout: state => {
      state.status = null;
      state.loading = false;
      state.error = false;
      state.token = null;
      state.data = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, state => {
        state.status = 'Fullfilled';
        state.loading = false;
        state.error = false;
        state.token = token;
        state.data = payload;
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
