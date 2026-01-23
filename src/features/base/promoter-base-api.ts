import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQueryWithAuthGuard} from '../utility';
import {
  AttendanceData,
  GetInvoiceDetailsResponse,
  ICheckInRequest,
  ICheckOutRequest,
  ISalesInvoiceParams,
  PromoterAttendanceData,
  RAttendanceHistory,
  RAttendanceShift,
  RCheckIn,
  RCheckOut,
  RGetWarehousesWithStock,
  RPromoterAttendance,
  RSalesInvoiceList,
} from '../../types/baseType';
import {createSlice} from '@reduxjs/toolkit';

// Base api calling ---
export const promoterBaseApi = createApi({
  reducerPath: 'promoterBaseApi',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['Promoter'],
  endpoints: builder => ({
    //Daily PJP Activity Check-in ---
    promoterStatus: builder.query<RPromoterAttendance, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_get_attendance_status',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    getAvailableStore: builder.query<RAttendanceShift, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_get_employee_shift',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    promoterCheckin: builder.mutation<RCheckIn, ICheckInRequest>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_attendance_checkin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    promoterCheckOut: builder.mutation<RCheckOut, ICheckOutRequest>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_attendance_checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    getAttendanceHistory: builder.query<
      RAttendanceHistory,
      {
        page: number;
        page_size: number;
        from_date: string;
        to_date: string;
      }
    >({
      query: ({page, page_size, from_date, to_date}) => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_get_attendance_history`,
        method: 'GET',
        params: {
          page,
          page_size,
          from_date,
          to_date,
        },
      }),
      providesTags: ['Promoter'],
    }),
    getMonthlySummary: builder.query<any, {month: number; year: number}>({
      query: ({month, year}) => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_get_monthly_summary`,
        method: 'GET',
        params: {
          month,
          year,
        },
      }),
      providesTags: ['Promoter'],
    }),

    //Invoices
    getSalesInvoicesList: builder.query<
      RSalesInvoiceList,
      {
        status?: string;
        page: number;
        page_size: number;
        search?: string;
      }
    >({
      query: ({status, page, page_size, search}) => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.sales_invoice_mobile_api.get_sales_invoices_list`,
        method: 'GET',
        params: {
          status,
          page,
          page_size,
          search,
        },
      }),
      providesTags: ['Promoter'],
    }),
    getSalesInvoiceDetails: builder.query<
      GetInvoiceDetailsResponse,
      {invoice_id: string}
    >({
      query: ({invoice_id}) => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.sales_invoice_mobile_api.get_sales_invoice_details`,
        method: 'GET',
        params: {invoice_id},
      }),
      providesTags: ['Promoter'],
    }),
    createSalesInvoice: builder.mutation<any, ISalesInvoiceParams>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.sales_invoice_mobile_api.create_sales_invoice`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    submitSalesInvoice: builder.mutation<any, {invoice_id: string}>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.sales_invoice_mobile_api.submit_sales_invoice`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    getWarehousesWithStock: builder.query<
      RGetWarehousesWithStock,
      {item_code: string}
    >({
      query: ({item_code}) => ({
        url: `/method/salesforce_management.mobile_app_apis.promoter_app.promoter_masters.get_warehouses_with_stock`,
        method: 'GET',
        params: {item_code},
      }),
    }),
  }),
});
export const {
  usePromoterStatusQuery,
  useGetAvailableStoreQuery,
  usePromoterCheckinMutation,
  usePromoterCheckOutMutation,
  useGetAttendanceHistoryQuery,

  //Sales
  useGetSalesInvoicesListQuery,
  useCreateSalesInvoiceMutation,
  useLazyGetWarehousesWithStockQuery,
  useGetWarehousesWithStockQuery,
  useSubmitSalesInvoiceMutation,
  useGetSalesInvoiceDetailsQuery,
} = promoterBaseApi;

interface PromoterState {
  loading: boolean;
  error: boolean;
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  promoterStatus?: AttendanceData | null;
}

const initialState: PromoterState = {
  loading: false,
  error: false,
  status: 'idle',
  promoterStatus: null,
};

export const promoterSlice = createSlice({
  name: 'promoterSlice',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addMatcher(
        promoterBaseApi.endpoints.promoterStatus.matchPending,
        state => {
          state.status = 'pending';
          state.loading = true;
          state.error = false;
        },
      )
      .addMatcher(
        promoterBaseApi.endpoints.promoterStatus.matchFulfilled,
        (state, action) => {
          state.status = 'fulfilled';
          state.loading = false;
          state.error = false;
          state.promoterStatus = action.payload.message?.data;
        },
      )
      .addMatcher(
        promoterBaseApi.endpoints.promoterStatus.matchRejected,
        state => {
          state.status = 'rejected';
          state.loading = false;
          state.error = true;
          state.promoterStatus = null;
        },
      );
  },
});

export const {} = promoterSlice.actions;
export default promoterSlice.reducer;
