import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {apiBaseUrl} from '../apiBaseUrl';
import {
  ExpenseClaimPayload,
  RExpenseClaimByEmp,
  RExpenseClaimType,
} from '../../types/baseType';
import {createSlice} from '@reduxjs/toolkit';

const API_KEY = '92131bbf2e5bbe6';
const API_SECRET = 'fb1ce2ebc69ffb0';

const encodedAuth = btoa(`${API_KEY}:${API_SECRET}`);

// Base api calling ---
export const tadaApi = createApi({
  reducerPath: 'tadaApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: headers => {
      headers.set('Authorization', `Basic ${encodedAuth}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Expense'],
  endpoints: builder => ({
    getExpenseCity: builder.query<RExpenseClaimType, void>({
      query: () => ({
        url: `/resource/City`,
        method: 'GET',
      }),
    }),

    //Expense
    getExpenseEmployeeList: builder.query<RExpenseClaimType, void>({
      query: () => ({
        url: `/resource/Employee`,
        method: 'GET',
      }),
    }),
    getExpenseClaimType: builder.query<RExpenseClaimType, void>({
      query: () => ({
        url: `/resource/Expense%20Claim%20Type`,
        method: 'GET',
      }),
    }),
    getExpenseClaimByEmployee: builder.query<
      RExpenseClaimByEmp,
      {employee: string}
    >({
      query: ({employee}) => ({
        url: `/method/softsens.api.get_expense_rows_by_employee?employee=${employee}`,
        method: 'GET',
        // params: {
        //   filters: JSON.stringify([
        //     ['Expense Claim', 'employee', '=', employee],
        //   ]),
        // },
      }),
    }),
    getClaimList: builder.query<RExpenseClaimType, void>({
      query: () => ({
        url: `/resource/Expense%20Claim`,
        method: 'GET',
      }),
    }),
    getClaimById: builder.query<RExpenseClaimType, {claimId: string}>({
      query: ({claimId}) => ({
        url: `/resource/Expense%20Claim/${claimId}`,
        method: 'GET',
      }),
    }),

    //Expense Mutation
    createExpenseClaim: builder.mutation<any, ExpenseClaimPayload>({
      query: body => ({
        url: `/resource/Expense%20Claim`,
        method: 'POST',
        body,
      }),
    }),
  }),
});
export const {
  //Expense
  useGetExpenseClaimTypeQuery,
  useGetExpenseEmployeeListQuery,
  useGetExpenseClaimByEmployeeQuery,
  useGetClaimListQuery,
  useGetClaimByIdQuery,
  useGetExpenseCityQuery,

  //Expense Mutation
  useCreateExpenseClaimMutation,
} = tadaApi;

interface PjpState {
  loading: boolean;
  error: boolean;
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
}

const initialState: PjpState = {
  loading: false,
  error: false,
  status: 'idle',
};

export const tadaSlice = createSlice({
  name: 'tadaSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {},
});

export const {} = tadaSlice.actions;
export default tadaSlice.reducer;
