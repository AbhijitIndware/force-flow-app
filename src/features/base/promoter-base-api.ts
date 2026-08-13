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
  // New types
  RPromoterHome,
  IValidateAttendanceResponse,
  IUploadAttendanceImage,
  RUploadAttendanceImage,
  RMonthlyRoster,
  RSalesOrderMasterData,
  RActivityCategories,
  IUploadStoreActivity,
  RUploadStoreActivity,
  IGetStoreActivitiesParams,
  RStoreActivities,
  ICreateProductFeedback,
  RCreateProductFeedback,
  RProductFeedbackList,
  RAssignedStores,
  RShiftAssignmentDetails,
  RItemsForPromoter,
  RItemStockInWarehouses,
  RProfileData,
  RSupervisorMyPromoters,
  RSupervisorPromoterDay,
  RSupervisorPromoterRoster,
  RAssignmentOptions,
  ICreateShiftAssignment,
  RCreateShiftAssignment,
  ICancelShiftAssignment,
  RCancelShiftAssignment,
  RSalesReport,
  RGetStoreStockStatus,
  ICreateStockBalance,
  RCreateStockBalance,
  RGetTargetAchievementSummary,
  IGetTargetAchievementSummaryParams,
  RRequestLateCheckin,
  IRequestLateCheckin,
} from '../../types/baseType';
import {createSlice} from '@reduxjs/toolkit';

// Base api calling ---
export const promoterBaseApi = createApi({
  reducerPath: 'promoterBaseApi',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['Promoter'],
  endpoints: builder => ({
    // ─── SCREEN 1: HOME ───────────────────────────────────────────────────────
    getPromoterHome: builder.query<RPromoterHome, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.home_api.get_promoter_home',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),

    // ─── SCREEN 2: ATTENDANCE ─────────────────────────────────────────────────
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
        url: `/method/salesforce_management.mobile_app_apis.attendence.get_attendence.get_attendance_records`,
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
    validateAttendance: builder.query<IValidateAttendanceResponse, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_validate_attendance',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    uploadAttendanceImage: builder.mutation<
      RUploadAttendanceImage,
      IUploadAttendanceImage
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.mark_attendance_mobile.mobile_upload_attendance_image',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    requestLateCheckin: builder.mutation<RRequestLateCheckin, IRequestLateCheckin>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.late_checkin_api.request_late_checkin_approval',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    markWeeklyOff: builder.mutation<any, {date: string}>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.attendence.weekly_off.mark_weekly_off',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),

    // ─── SCREEN 3: ROSTER ─────────────────────────────────────────────────────
    getMonthlyRoster: builder.query<
      RMonthlyRoster,
      {month?: number; year?: number}
    >({
      query: ({month, year}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.roster_api.get_monthly_roster',
        method: 'GET',
        params: {
          ...(month ? {month} : {}),
          ...(year ? {year} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),

    // ─── SCREEN 4: STOCK TAKE ─────────────────────────────────────────────────
    getStoreStockStatus: builder.query<RGetStoreStockStatus, {store: string}>({
      query: ({store}) => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.stock_api.get_store_stock_status',
        method: 'GET',
        params: {store},
      }),
      providesTags: ['Promoter'],
    }),
    createStockBalance: builder.mutation<RCreateStockBalance, ICreateStockBalance>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.stock_api.create_stock_balance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),

    // ─── SCREEN 5: REGISTER SALE ──────────────────────────────────────────────
    getDailySecondaryReport: builder.query<
      RSalesReport,
      {
        view_type?: string;
        from_date?: string;
        to_date?: string;
        include_details?: number;
      }
    >({
      query: ({view_type, from_date, to_date, include_details}) => ({
        url: '/method/salesforce_management.mobile_app_apis.report_apis.report_apis.get_daily_secondary_report',
        method: 'GET',
        params: {
          ...(view_type ? {view_type} : {}),
          ...(from_date ? {from_date} : {}),
          ...(to_date ? {to_date} : {}),
          ...(include_details ? {include_details} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),

    // ─── SCREEN 6: ORDER REQUISITION ──────────────────────────────────────────
    createSalesOrderWithStock: builder.mutation<any, any>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.create_sales_order_with_stock',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    getSalesOrdersList: builder.query<
      any,
      {
        page?: number;
        page_size?: number;
        status?: string;
        from_date?: string;
        to_date?: string;
        search?: string;
      }
    >({
      query: ({page, page_size, status, from_date, to_date, search}) => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.get_sales_orders_list',
        method: 'GET',
        params: {
          ...(page ? {page} : {}),
          ...(page_size ? {page_size} : {}),
          ...(status ? {status} : {}),
          ...(from_date ? {from_date} : {}),
          ...(to_date ? {to_date} : {}),
          ...(search ? {search} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    getSalesOrderDetails: builder.query<any, {order_id: string}>({
      query: ({order_id}) => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.get_sales_order_details',
        method: 'GET',
        params: {order_id},
      }),
      providesTags: ['Promoter'],
    }),
    getSalesOrderMasterData: builder.query<
      RSalesOrderMasterData,
      {stores?: string; items?: string; distributors?: string; terms?: string}
    >({
      query: ({stores, items, distributors, terms}) => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.get_sales_order_master_data',
        method: 'GET',
        params: {
          ...(stores ? {stores} : {}),
          ...(items ? {items} : {}),
          ...(distributors ? {distributors} : {}),
          ...(terms ? {terms} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    submitSalesOrder: builder.mutation<any, {order_id: string}>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.submit_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    cancelSalesOrder: builder.mutation<any, {order_id: string}>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.cancel_sales_order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    getDeliveryNotesList: builder.query<
      any,
      {page?: number; page_size?: number; status?: string}
    >({
      query: ({page, page_size, status}) => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.delivery_note_mobile_api.get_delivery_notes_list',
        method: 'GET',
        params: {
          ...(page ? {page} : {}),
          ...(page_size ? {page_size} : {}),
          ...(status ? {status} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    getOrdersCount: builder.query<
      any,
      {from_date?: string; to_date?: string}
    >({
      query: ({from_date, to_date}) => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.order_count.get_orders_count',
        method: 'GET',
        params: {
          ...(from_date ? {from_date} : {}),
          ...(to_date ? {to_date} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),

    // ─── SCREEN 7: TARGETS ────────────────────────────────────────────────────
    getTargetAchievementSummary: builder.query<
      RGetTargetAchievementSummary,
      {from_date?: string; to_date?: string}
    >({
      query: ({from_date, to_date}) => ({
        url: '/method/salesforce_management.api.asm_dashboard.get_target_achievement_summary',
        method: 'GET',
        params: {
          ...(from_date ? {from_date} : {}),
          ...(to_date ? {to_date} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    getEmployeeTargets: builder.query<any, {month?: number; year?: number}>({
      query: ({month, year}) => ({
        url: '/method/salesforce_management.api.asm_dashboard.get_employee_targets',
        method: 'GET',
        params: {
          ...(month ? {month} : {}),
          ...(year ? {year} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),

    // ─── SCREEN 8: STORE ACTIVITY PHOTOS ──────────────────────────────────────
    getActivityCategories: builder.query<RActivityCategories, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.activity_api.get_activity_categories',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    uploadStoreActivity: builder.mutation<
      RUploadStoreActivity,
      IUploadStoreActivity
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.activity_api.upload_store_activity',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    getStoreActivities: builder.query<
      RStoreActivities,
      IGetStoreActivitiesParams
    >({
      query: ({activity_type, store, from_date, to_date, page, page_size}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.activity_api.get_store_activities',
        method: 'GET',
        params: {
          ...(activity_type ? {activity_type} : {}),
          ...(store ? {store} : {}),
          ...(from_date ? {from_date} : {}),
          ...(to_date ? {to_date} : {}),
          ...(page ? {page} : {}),
          ...(page_size ? {page_size} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),

    // ─── SCREEN 9: PRODUCT FEEDBACK ───────────────────────────────────────────
    createProductFeedback: builder.mutation<
      RCreateProductFeedback,
      ICreateProductFeedback
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.feedback_api.create_product_feedback',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    getProductFeedbackList: builder.query<
      RProductFeedbackList,
      {type?: string; page?: number; page_size?: number}
    >({
      query: ({type, page, page_size}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.feedback_api.get_product_feedback_list',
        method: 'GET',
        params: {
          ...(type ? {type} : {}),
          ...(page ? {page} : {}),
          ...(page_size ? {page_size} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),

    // ─── MASTER DATA ──────────────────────────────────────────────────────────
    getEmployeeAssignedStores: builder.query<RAssignedStores, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.promoter_masters.get_employee_assigned_stores',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    getShiftAssignmentDetails: builder.query<RShiftAssignmentDetails, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.promoter_masters.get_shift_assignment_details',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    getItemsForPromoter: builder.query<
      RItemsForPromoter,
      {search?: string; page?: number; page_size?: number}
    >({
      query: ({search, page, page_size}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.promoter_masters.get_items_for_promoter',
        method: 'GET',
        params: {
          ...(search ? {search} : {}),
          ...(page ? {page} : {}),
          ...(page_size ? {page_size} : {}),
        },
      }),
      providesTags: ['Promoter'],
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
    getItemStockInWarehouses: builder.query<
      RItemStockInWarehouses,
      {item_code: string}
    >({
      query: ({item_code}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.promoter_masters.get_item_stock_in_warehouses',
        method: 'GET',
        params: {item_code},
      }),
      providesTags: ['Promoter'],
    }),
    getProfileData: builder.query<RProfileData, {emp_id: string}>({
      query: ({emp_id}) => ({
        url: '/method/salesforce_management.mobile_app_apis.authentications.profile.profile_data',
        method: 'GET',
        params: {emp_id},
      }),
      providesTags: ['Promoter'],
    }),

    // ─── INVOICES (kept for backwards compatibility) ──────────────────────────
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

    // ─── SUPERVISOR ───────────────────────────────────────────────────────────
    getMyPromoters: builder.query<RSupervisorMyPromoters, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.supervisor_api.get_my_promoters',
        method: 'GET',
      }),
      providesTags: ['Promoter'],
    }),
    getPromoterDay: builder.query<
      RSupervisorPromoterDay,
      {employee: string; date?: string}
    >({
      query: ({employee, date}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.supervisor_api.get_promoter_day',
        method: 'GET',
        params: {
          employee,
          ...(date ? {date} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    getPromoterRoster: builder.query<
      RSupervisorPromoterRoster,
      {employee: string; month?: number; year?: number}
    >({
      query: ({employee, month, year}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.supervisor_api.get_promoter_roster',
        method: 'GET',
        params: {
          employee,
          ...(month ? {month} : {}),
          ...(year ? {year} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    getAssignmentOptions: builder.query<
      RAssignmentOptions,
      {search?: string; page?: number; page_size?: number}
    >({
      query: ({search, page, page_size}) => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.supervisor_api.get_assignment_options',
        method: 'GET',
        params: {
          ...(search ? {search} : {}),
          ...(page ? {page} : {}),
          ...(page_size ? {page_size} : {}),
        },
      }),
      providesTags: ['Promoter'],
    }),
    createShiftAssignment: builder.mutation<
      RCreateShiftAssignment,
      ICreateShiftAssignment
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.supervisor_api.create_shift_assignment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
    cancelShiftAssignment: builder.mutation<
      RCancelShiftAssignment,
      ICancelShiftAssignment
    >({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.promoter_app.supervisor_api.cancel_shift_assignment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promoter'],
    }),
  }),
});

export const {
  // Screen 1 — Home
  useGetPromoterHomeQuery,
  useLazyGetPromoterHomeQuery,

  // Screen 2 — Attendance
  usePromoterStatusQuery,
  useLazyPromoterStatusQuery,
  useGetAvailableStoreQuery,
  useLazyGetAvailableStoreQuery,
  usePromoterCheckinMutation,
  usePromoterCheckOutMutation,
  useGetAttendanceHistoryQuery,
  useLazyGetAttendanceHistoryQuery,
  useGetMonthlySummaryQuery,
  useLazyGetMonthlySummaryQuery,
  useValidateAttendanceQuery,
  useLazyValidateAttendanceQuery,
  useUploadAttendanceImageMutation,
  useRequestLateCheckinMutation,
  useMarkWeeklyOffMutation,

  // Screen 3 — Roster
  useGetMonthlyRosterQuery,
  useLazyGetMonthlyRosterQuery,

  // Screen 4 — Stock Take
  useGetStoreStockStatusQuery,
  useLazyGetStoreStockStatusQuery,
  useCreateStockBalanceMutation,

  // Screen 5 — Register Sale
  useGetDailySecondaryReportQuery,
  useLazyGetDailySecondaryReportQuery,

  // Screen 6 — Order Requisition
  useCreateSalesOrderWithStockMutation,
  useGetSalesOrdersListQuery,
  useLazyGetSalesOrdersListQuery,
  useGetSalesOrderDetailsQuery,
  useLazyGetSalesOrderDetailsQuery,
  useGetSalesOrderMasterDataQuery,
  useLazyGetSalesOrderMasterDataQuery,
  useSubmitSalesOrderMutation,
  useCancelSalesOrderMutation,
  useGetDeliveryNotesListQuery,
  useLazyGetDeliveryNotesListQuery,
  useGetOrdersCountQuery,
  useLazyGetOrdersCountQuery,

  // Screen 7 — Targets
  useGetTargetAchievementSummaryQuery,
  useLazyGetTargetAchievementSummaryQuery,
  useGetEmployeeTargetsQuery,
  useLazyGetEmployeeTargetsQuery,

  // Screen 8 — Store Activity Photos
  useGetActivityCategoriesQuery,
  useLazyGetActivityCategoriesQuery,
  useUploadStoreActivityMutation,
  useGetStoreActivitiesQuery,
  useLazyGetStoreActivitiesQuery,

  // Screen 9 — Product Feedback
  useCreateProductFeedbackMutation,
  useGetProductFeedbackListQuery,
  useLazyGetProductFeedbackListQuery,

  // Master Data
  useGetEmployeeAssignedStoresQuery,
  useLazyGetEmployeeAssignedStoresQuery,
  useGetShiftAssignmentDetailsQuery,
  useLazyGetShiftAssignmentDetailsQuery,
  useGetItemsForPromoterQuery,
  useLazyGetItemsForPromoterQuery,
  useGetWarehousesWithStockQuery,
  useLazyGetWarehousesWithStockQuery,
  useGetItemStockInWarehousesQuery,
  useLazyGetItemStockInWarehousesQuery,
  useGetProfileDataQuery,
  useLazyGetProfileDataQuery,

  // Invoices (backwards compat)
  useGetSalesInvoicesListQuery,
  useLazyGetSalesInvoicesListQuery,
  useGetSalesInvoiceDetailsQuery,
  useLazyGetSalesInvoiceDetailsQuery,
  useCreateSalesInvoiceMutation,
  useSubmitSalesInvoiceMutation,

  // Supervisor
  useGetMyPromotersQuery,
  useLazyGetMyPromotersQuery,
  useGetPromoterDayQuery,
  useLazyGetPromoterDayQuery,
  useGetPromoterRosterQuery,
  useLazyGetPromoterRosterQuery,
  useGetAssignmentOptionsQuery,
  useLazyGetAssignmentOptionsQuery,
  useCreateShiftAssignmentMutation,
  useCancelShiftAssignmentMutation,
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
