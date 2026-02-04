import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {baseQueryWithAuthGuard} from '../utility';
import {apiBaseUrl} from '../apiBaseUrl';
import {
  AttendanceResponse,
  ICopyPjpRequest,
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
  IUpdatePjpPayload,
  IUpdateSalesOrder,
  IUpdateSOAction,
  RAddSalesOrder,
  RAssignEmployee,
  RCopyPjpSuccess,
  RDistributorList,
  ReportResponse,
  RLocationVerify,
  RPjpDailyById,
  RPjpDailyStores,
  RPjpInitialize,
  RPoDetails,
  RPoList,
  RPOSOCount,
  RProdCount,
  RSoDetails,
  RSoList,
  RStoreList,
  RSalesReport,
  IUpdatePjpRoutePayload,
  RUpdatePjpRoute,
  IVisivilityClaim,
  RVisibilityClaimsList,
  ICity,
  LocationPayload,
} from '../../types/baseType';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PaginationInfo} from '../../types/Navigation';

// Base api calling ---
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuthGuard,
  // baseQuery: fetchBaseQuery({
  //   baseUrl: apiBaseUrl,
  //   credentials: 'include',
  // }),
  tagTypes: ['Distributor', 'SO', 'PO', 'PJP', 'Store', 'VC'],
  endpoints: builder => ({
    //Daily PJP Activity Check-in ---
    pjpInitialize: builder.mutation<RPjpInitialize, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_initialize',
        method: 'POST',
      }),
      invalidatesTags: ['PJP'],
    }),
    locationVerification: builder.mutation<RLocationVerify, ILocationVerify>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_store_selection',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
    addCheckIn: builder.mutation<any, IAddCheckIn>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_check_in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
    markActivity: builder.mutation<any, IMarkActivity>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_mark_activity',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
    checkOut: builder.mutation<any, {store: string}>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_check_out',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
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

    //Counts
    getSalesPurchaseCount: builder.query<RPOSOCount, void>({
      query: () => ({
        url: `/method/salesforce_management.mobile_app_apis.order_apis.order_count.get_orders_count`,
        method: 'GET',
      }),
      providesTags: ['PO', 'SO'],
    }),
    getProdCount: builder.query<RProdCount, {date: string}>({
      query: ({date}) => ({
        url: `/method/salesforce_management.mobile_app_apis.pjp_apis.productive_call.get_prod_counts`,
        method: 'GET',
        params: {
          date: date,
        },
      }),
      providesTags: ['PJP', 'Store'],
    }),

    //PJP
    getDailyPjpList: builder.query<
      RPjpDailyStores,
      Pick<PaginationInfo, 'page' | 'page_size'> & {
        status: string;
        date?: string;
      }
    >({
      query: ({page, page_size, status, date}) => ({
        url: `/method/salesforce_management.mobile_app_apis.pjp_apis.get_pjp_store.get_pjp_daily_stores_list`,
        method: 'GET',
        params: {
          page: page,
          limit: page_size,
          // status: status,
          date: date,
        },
      }),
      providesTags: ['PJP'],
    }),
    getDailyPjpById: builder.query<RPjpDailyById, string>({
      query: id => ({
        url: `/method/salesforce_management.mobile_app_apis.pjp_apis.get_pjp_store.get_pjp_store_by_id`,
        method: 'GET',
        params: {
          pjp_doc_name: id,
        },
      }),
      providesTags: ['PJP'],
    }),
    addDailyPjp: builder.mutation<any, IAddPjpPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.create_pjp_daily_stores',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
    updateDailyPjp: builder.mutation<any, IUpdatePjpPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.modify_pjp_daily_stores',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
    updatePjpRoute: builder.mutation<RUpdatePjpRoute, IUpdatePjpRoutePayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.modify_location_pjp_daily_stores',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),

    //Partner
    addDistributor: builder.mutation<any, IAddDistributorPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.distributor.create_distributor',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Distributor'],
    }),
    addStore: builder.mutation<any, IAddStorePayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.create_store',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Store'],
    }),
    getStoreList: builder.query<
      RStoreList,
      {
        page_size?: string;
        page?: string;
        search?: string;
        include_subordinates: string;
        include_direct_subordinates: string;
      }
    >({
      query: ({
        page_size,
        page,
        search,
        include_direct_subordinates,
        include_subordinates,
      }) => ({
        url: `/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_store_by_owner`,
        method: 'GET',
        params: {
          page: page,
          page_size: page_size,
          search,
          include_direct_subordinates,
          include_subordinates,
        },
      }),
      providesTags: ['Store'],
    }),
    getDistributorList: builder.query<
      RDistributorList,
      {page: number; page_size: number; status: string}
    >({
      query: ({page, page_size, status}) => ({
        url: `/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_distributor_by_owner`,
        method: 'GET',
        params: {
          page: page,
          page_size: page_size,
          // status: status,
        },
      }),
      providesTags: ['Distributor'],
    }),

    //GET REPORT
    getReport: builder.query<
      ReportResponse,
      {
        report_name: string;
        filters?: string;
        ignore_prepared_report?: string;
        are_default_filters?: string;
        zone_wise?: any;
        own_stores?: any;
      }
    >({
      query: ({
        report_name,
        filters,
        ignore_prepared_report,
        are_default_filters,
        zone_wise,
        own_stores,
      }) => ({
        url: `/method/frappe.desk.query_report.run`,
        method: 'GET',
        params: {
          report_name: report_name,
          filters: filters,
          ignore_prepared_report: ignore_prepared_report,
          are_default_filters: are_default_filters,
          zone_wise: zone_wise,
          own_stores: own_stores,
        },
      }),
    }),

    //GET ATTENDANCE REPORT
    getAttendance: builder.query<
      AttendanceResponse,
      Pick<PaginationInfo, 'page' | 'page_size'>
    >({
      query: ({page_size, page}) => ({
        url: `/method/salesforce_management.mobile_app_apis.attendence.get_attendence.get_attendance_records`,
        method: 'GET',
        params: {
          page: page,
          page_size: page_size,
        },
      }),
    }),

    //Copy Pjp
    copyPjpToOtherEmp: builder.mutation<RCopyPjpSuccess, ICopyPjpRequest>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.copy_pjp_to_employee',
        method: 'POST',
        body,
      }),
    }),
    getEmployeesToAssign: builder.query<RAssignEmployee, void>({
      query: () => ({
        url: `/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.get_eligible_employees_for_pjp_copy`,
        method: 'GET',
        // params: {
        //   page: page,
        //   page_size: page_size,
        //   search,
        // },
      }),
    }),

    //Sales
    getSalesRepots: builder.query<RSalesReport, {view_type: string}>({
      query: ({view_type}) => ({
        url: `/method/salesforce_management.mobile_app_apis.report_apis.report_apis.get_daily_secondary_report`,
        method: 'GET',
        params: {
          view_type: view_type,
        },
      }),
    }),

    //Visibility Claim
    getVisibiltyClaimList: builder.query<RVisibilityClaimsList, void>({
      query: () => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.get_visibility_claims_list`,
        method: 'GET',
      }),
      providesTags: ['VC'],
    }),
    getVisibilityClaimDetail: builder.query<any, {claim_id: string}>({
      query: ({claim_id}) => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.get_visibility_claim_details`,
        method: 'GET',
        params: {claim_id},
      }),
      providesTags: ['VC'],
    }),
    createVisibilityClaim: builder.mutation<any, IVisivilityClaim>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.create_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VC'],
    }),
    submitVisibilityClaim: builder.mutation<any, {claim_id: string}>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.submit_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VC'],
    }),
    cancelVisibilityClaim: builder.mutation<any, {claim_id: string}>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.cancel_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VC'],
    }),

    //City
    createNewCity: builder.mutation<any, ICity>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.city.create_city',
        method: 'POST',
        body,
      }),
    }),

    //Location
    getLocationTracker: builder.query<
      {
        message: {
          enabled: boolean;
        };
      },
      void
    >({
      query: () => ({
        url: `/method/salesforce_management.mobile_app_apis.location.location.is_location_sharing_enabled`,
        method: 'GET',
      }),
      providesTags: ['PJP'],
    }),
    startPjp: builder.mutation<any, LocationPayload>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.location.location.start_sharing`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
    endPjp: builder.mutation<any, LocationPayload>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.location.location.stop_sharing`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PJP'],
    }),
  }),
});
export const {
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
  useGetSalesPurchaseCountQuery,
  //PJP
  useGetDailyPjpListQuery,
  useLazyGetDailyPjpListQuery,
  useGetDailyPjpByIdQuery,
  useUpdateDailyPjpMutation,
  useAddDailyPjpMutation,
  useGetProdCountQuery,
  useUpdatePjpRouteMutation,

  //Partner
  useGetStoreListQuery,
  useGetDistributorListQuery,
  useAddDistributorMutation,
  useAddStoreMutation,
  //Report
  useGetReportQuery,
  //Attendance
  useGetAttendanceQuery,
  //Copy PJP
  useCopyPjpToOtherEmpMutation,
  useGetEmployeesToAssignQuery,

  //Sales
  useGetSalesRepotsQuery,

  //Visibility Claim
  useGetVisibiltyClaimListQuery,
  useGetVisibilityClaimDetailQuery,
  useCreateVisibilityClaimMutation,
  useSubmitVisibilityClaimMutation,
  useCancelVisibilityClaimMutation,

  //City
  useCreateNewCityMutation,

  //Location
  useGetLocationTrackerQuery,
  useStartPjpMutation,
  useEndPjpMutation,
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
