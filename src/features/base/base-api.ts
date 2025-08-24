import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {baseQueryWithAuthGuard} from '../utility';
import {apiBaseUrl} from '../apiBaseUrl';
import {
  IAddCheckIn,
  IAddDistributorPayload,
  IAddPjpPayload,
  IAddPurchaseOrder,
  IAddSalesOrder,
  IAddStorePayload,
  IAmendPO,
  IAmendSO,
  ICancelSO,
  ILocationVerify,
  IMarkActivity,
  IUpdateSalesOrder,
  IUpdateSOAction,
  RAddSalesOrder,
  RLocationVerify,
  RPjpInitialize,
  RPoDetails,
  RPoList,
  RSoDetails,
  RSoList,
} from '../../types/baseType';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PaginationInfo} from '../../types/Navigation';

// Base api calling ---
export const baseApi = createApi({
  reducerPath: 'baseApi',
  // baseQuery: baseQueryWithAuthGuard,
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: 'include',
  }),
  tagTypes: ['Customer', 'SO', 'PO'],
  endpoints: builder => ({
    addDistributor: builder.mutation<any, IAddDistributorPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.distributor.create_distributor',
        method: 'POST',
        body,
      }),
    }),
    addStore: builder.mutation<any, IAddStorePayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.create_store',
        method: 'POST',
        body,
      }),
    }),
    addDailyPjp: builder.mutation<any, IAddPjpPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.create_pjp_daily_stores',
        method: 'POST',
        body,
      }),
    }),

    //Daily PJP Activity Check-in ---
    pjpInitialize: builder.mutation<RPjpInitialize, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_initialize',
        method: 'POST',
      }),
    }),
    locationVerification: builder.mutation<RLocationVerify, ILocationVerify>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_store_selection',
        method: 'POST',
        body,
      }),
    }),
    addCheckIn: builder.mutation<any, IAddCheckIn>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_check_in',
        method: 'POST',
        body,
      }),
    }),
    markActivity: builder.mutation<any, IMarkActivity>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_mark_activity',
        method: 'POST',
        body,
      }),
    }),
    checkOut: builder.mutation<any, {store: string}>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_check_out',
        method: 'POST',
        body,
      }),
    }),

    //Sales Order
    getSalesOrderList: builder.query<
      RSoList,
      Pick<PaginationInfo, 'page' | 'page_size'>
    >({
      query: ({page, page_size}) => ({
        url: `/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.get_sales_orders_list?page=${page}&page_size=${page_size}`,
        method: 'GET',
      }),
      providesTags: ['SO'],
    }),
    getSalesOrderById: builder.query<RSoDetails, string>({
      query: id => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.get_sales_order_details',
        method: 'GET',
        params: {
          order_id: id,
        },
      }),
      providesTags: ['SO'],
    }),
    addSaleOrder: builder.mutation<RAddSalesOrder, IAddSalesOrder>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.create_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SO'],
    }),
    updateSaleOrder: builder.mutation<RAddSalesOrder, IUpdateSalesOrder>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.update_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SO'],
    }),
    submitSaleOrder: builder.mutation<RAddSalesOrder, IUpdateSOAction>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.submit_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SO'],
    }),
    cancelSaleOrder: builder.mutation<RAddSalesOrder, ICancelSO>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.cancel_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SO'],
    }),
    amendSaleOrder: builder.mutation<RAddSalesOrder, IAmendSO>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.amend_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SO'],
    }),

    //Purchase Order
    getPurchaseOrderList: builder.query<
      RPoList,
      Pick<PaginationInfo, 'page' | 'page_size'> & {status: string}
    >({
      query: ({page, page_size, status}) => ({
        url: `/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.get_purchase_orders_list`,
        method: 'GET',
        params: {
          page: page,
          limit: page_size,
          status: status,
        },
      }),
      providesTags: ['PO'],
    }),
    getPurchaseOrderById: builder.query<RPoDetails, string>({
      query: id => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.get_purchase_order_details',
        method: 'GET',
        params: {
          order_id: id,
        },
      }),
      providesTags: ['PO'],
    }),
    createPurchaseOrder: builder.mutation<RAddSalesOrder, IAddPurchaseOrder>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.create_purchase_order_from_sales_orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SO', 'PO'],
    }),
    submitPurchaseOrder: builder.mutation<RAddSalesOrder, IUpdateSOAction>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.submit_purchase_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PO'],
    }),
    cancelPurchaseOrder: builder.mutation<RAddSalesOrder, ICancelSO>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.cancel_purchase_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PO'],
    }),
    amendPurchaseOrder: builder.mutation<RAddSalesOrder, IAmendPO>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.amend_purchase_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PO'],
    }),
  }),
});
export const {
  useAddDistributorMutation,
  useAddStoreMutation,
  useAddDailyPjpMutation,
  //Daily PJP Activity Check-in ---
  usePjpInitializeMutation,
  useLocationVerificationMutation,
  useAddCheckInMutation,
  useMarkActivityMutation,
  useCheckOutMutation,
  //Sales Order
  useAddSaleOrderMutation,
  useAmendSaleOrderMutation,
  useCancelSaleOrderMutation,
  useGetSalesOrderListQuery,
  useGetSalesOrderByIdQuery,
  useSubmitSaleOrderMutation,
  useUpdateSaleOrderMutation,
  //Purchase Order
  useCreatePurchaseOrderMutation,
  useAmendPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useSubmitPurchaseOrderMutation,
  useGetPurchaseOrderByIdQuery,
  useGetPurchaseOrderListQuery,
} = baseApi;

interface PjpState {
  loading: boolean;
  error: boolean;
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  pjpInitializedData?: RPjpInitialize | null;
  locationVerifyData?: RLocationVerify | null;
  selectedStore?: string | null;
}

const initialState: PjpState = {
  loading: false,
  error: false,
  status: 'idle',
  pjpInitializedData: null,
  locationVerifyData: null,
  selectedStore: null,
};

export const pjpSlice = createSlice({
  name: 'pjp',
  initialState,
  reducers: {
    resetPjpState: () => initialState,
    setSelectedStore: (state, action: PayloadAction<string>) => {
      state.selectedStore = action.payload;
    },
    resetLocation: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addMatcher(baseApi.endpoints.pjpInitialize.matchPending, state => {
        state.status = 'pending';
        state.loading = true;
        state.error = false;
      })
      .addMatcher(
        baseApi.endpoints.pjpInitialize.matchFulfilled,
        (state, action) => {
          state.status = 'fulfilled';
          state.loading = false;
          state.error = false;
          state.pjpInitializedData = action.payload;
        },
      )
      .addMatcher(baseApi.endpoints.pjpInitialize.matchRejected, state => {
        state.status = 'rejected';
        state.loading = false;
        state.error = true;
        state.pjpInitializedData = null;
      })
      .addMatcher(
        baseApi.endpoints.locationVerification.matchPending,
        state => {
          state.status = 'pending';
          state.loading = true;
          state.error = false;
        },
      )
      .addMatcher(
        baseApi.endpoints.locationVerification.matchFulfilled,
        (state, action) => {
          state.status = 'fulfilled';
          state.loading = false;
          state.error = false;
          state.locationVerifyData = action.payload;
        },
      )
      .addMatcher(
        baseApi.endpoints.locationVerification.matchRejected,
        state => {
          state.status = 'rejected';
          state.loading = false;
          state.error = true;
          state.pjpInitializedData = null;
        },
      );
  },
});

export const {resetPjpState, setSelectedStore, resetLocation} =
  pjpSlice.actions;
export default pjpSlice.reducer;
