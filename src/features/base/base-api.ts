import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthGuard } from '../utility';
import { apiBaseUrl } from '../apiBaseUrl';
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
  RLocationTracker,
  ICheckOut,
  IUpdateStorePayload,
  ModifyStoreResponse,
  GetStoreResponse,
  AsmDashboardParams,
  AsmDashboardResponse,
  AsmAttendanceResponse,
  RGetEmployeeTargets,
  ISetEmployeeTargets,
  RSetEmployeeTargets,
  IDdnStatsParams,
  RGetDdnStats,
  RGetSoStats,
  ISoStatsParams,
  IGetEmployeeTargetsParams,
  RDistributorDeliveryNoteList,
  DeliveryNoteResponse,
  RLastPjpStores,
  RGetStockItems,
  RCreateStockBalance,
  ICreateStockBalance,
  RGetStoreStockStatus,
  RGetActivityLocations,
  RCreateActivityLocation,
  ICreateActivityLocation,
  RActivityCheckIn,
  IActivityCheckIn,
  RActivityCheckOut,
  IActivityCheckOut,
  RGetActivityCheckInStatus,
} from '../../types/baseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationInfo } from '../../types/Navigation';

// Base api calling ---
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuthGuard,
  // baseQuery: fetchBaseQuery({
  //   baseUrl: apiBaseUrl,
  //   credentials: 'include',
  // }),
  tagTypes: ['Distributor', 'SO', 'PO', 'PJP', 'Store', 'VC', 'Stock', 'Activity'],
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
    checkOut: builder.mutation<any, ICheckOut>({
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
      query: ({ page, page_size }) => ({
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
      Pick<PaginationInfo, 'page' | 'page_size'> & { status: string }
    >({
      query: ({ page, page_size, status }) => ({
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
    getProdCount: builder.query<RProdCount, { date: string }>({
      query: ({ date }) => ({
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
      query: ({ page, page_size, status, date }) => ({
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
    getLastPjpStores: builder.query<RLastPjpStores, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.get_last_pjp_stores',
        method: 'GET',
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
    checkStoreName: builder.query<
      { message: { exists: boolean; message?: string } },
      string
    >({
      query: store_name => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.check_store_name',
        method: 'GET',
        params: { store_name },
      }),
    }),
    addStore: builder.mutation<any, IAddStorePayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.create_store',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Store'],
    }),
    updateStore: builder.mutation<ModifyStoreResponse, IUpdateStorePayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.modify_store',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Store'],
    }),
    getStoreById: builder.query<GetStoreResponse, string>({
      query: id => ({
        url: `/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_store_details`,
        method: 'GET',
        params: {
          store_id: id,
        },
      }),
      providesTags: ['Store'],
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
      { page: number; page_size: number; status: string }
    >({
      query: ({ page, page_size, status }) => ({
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

    // ─── NEW: GET ASM DASHBOARD ───────────────────────────────────────────────
    // getAsmDashboard: builder.query<AsmDashboardResponse, AsmDashboardParams>({
    //   query: ({date, employee}: AsmDashboardParams) => ({
    //     url: `/method/salesforce_management.api.asm_dashboard.get_asm_dashboard`,
    //     method: 'GET',
    //     params: {
    //       date,
    //       employee,
    //     },
    //   }),
    //   // providesTags: ['Sales'],
    // }),

    //GET ATTENDANCE REPORT
    getAttendance: builder.query<
      AttendanceResponse,
      Pick<PaginationInfo, 'page' | 'page_size'>
    >({
      query: ({ page_size, page }) => ({
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
    getSalesRepots: builder.query<RSalesReport, { view_type: string }>({
      query: ({ view_type }) => ({
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
    getVisibilityClaimDetail: builder.query<any, { claim_id: string }>({
      query: ({ claim_id }) => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.get_visibility_claim_details`,
        method: 'GET',
        params: { claim_id },
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
    submitVisibilityClaim: builder.mutation<any, { claim_id: string }>({
      query: body => ({
        url: `/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.submit_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VC'],
    }),
    cancelVisibilityClaim: builder.mutation<any, { claim_id: string }>({
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
    getLocationTracker: builder.query<RLocationTracker, void>({
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

    // ─── ASM DASHBOARD APIs ───────────────────────────────────────────────────

    // Legacy combined dashboard endpoint
    getAsmDashboard: builder.query<
      AsmDashboardResponse,
      AsmDashboardParams & {
        store_type?: string;
        zone?: string;
        view_type?: string;
      }
    >({
      query: ({
        date,
        employee,
        store_type,
        zone,
        view_type,
        from_date,
        to_date,
      }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.get_asm_dashboard`,
        method: 'GET',
        params: {
          ...(date ? { date } : {}),
          employee,
          ...(from_date ? { from_date } : {}),
          ...(to_date ? { to_date } : {}),
          ...(store_type ? { store_type } : {}),
          ...(zone ? { zone } : {}),
          ...(view_type ? { view_type } : {}),
        },
      }),
    }),

    // API 1 — Get Zones & Store Types (filter dropdowns)
    getAsmZones: builder.query<
      {
        message: {
          success: boolean;
          zones: string[];
          store_types: { name: string; store_type: string }[];
        };
      },
      { employee: string }
    >({
      query: ({ employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_zones`,
        method: 'GET',
        params: { employee },
      }),
    }),

    // API 2 — ASM Overview Card
    getAsmOverview: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          role_code: string;
          data: {
            employee_id: string;
            employee_name: string;
            designation: string;
            attendance_status: string;
            check_in_time: string | null;
            check_out_time: string | null;
            team_size: number;
            so_count: number;
            isr_count: number;
            outlets_planned: number;
            outlets_visited: number;
            outlets_completed: number;
            outlets_pending: number;
            completion_rate: number;
            orders_today: number;
            order_value: number;
            orders_delivered: number;
            orders_pending: number;
            delivery_rate: number;
            store_created: number;
            store_created_success: number;
          };
        };
      },
      { date: string; employee: string; zone?: string; store_type?: string }
    >({
      query: ({ date, employee, zone, store_type }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_asm_overview`,
        method: 'GET',
        params: { date, employee, zone, store_type },
      }),
    }),

    // API 3 — Key Metrics Cards
    getAsmKeyMetrics: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          data: {
            team_size: number;
            team_present: number;
            team_absent: number;
            attendance_rate: number;
            outlets_planned: number;
            outlets_visited: number;
            outlets_pending: number;
            visit_rate: number;
            orders_today: number;
            order_value: number;
            orders_delivered: number;
            delivery_rate: number;
            store_created: number;
            store_created_success: number;
          };
        };
      },
      { date: string; employee: string }
    >({
      query: ({ date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_key_metrics`,
        method: 'GET',
        params: { date, employee },
      }),
    }),

    // API 4 — Store Created Card
    getAsmStoreCreated: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          data: { created: number; successful: number };
        };
      },
      { date: string; employee: string }
    >({
      query: ({ date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_store_created`,
        method: 'GET',
        params: { date, employee },
      }),
    }),

    // API 5 — Store Planning Section
    getAsmStorePlanning: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          data: {
            planned: number;
            visited: number;
            completed: number;
            pending: number;
            completion_rate: number;
          };
        };
      },
      { date: string; employee: string }
    >({
      query: ({ date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_store_planning`,
        method: 'GET',
        params: { date, employee },
      }),
    }),

    // API 6 — Business Generated Section
    getAsmBusinessGenerated: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          data: {
            total_orders: number;
            draft_orders: number;
            order_value: number;
            orders_delivered: number;
            orders_pending: number;
            delivery_rate: number;
            avg_order_value: number;
          };
        };
      },
      { date: string; employee: string }
    >({
      query: ({ date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_business_generated`,
        method: 'GET',
        params: { date, employee },
      }),
    }),

    // API 7 — Today's Orders List
    getAsmOrderStatus: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          data: {
            order_id: string;
            time: string;
            salesperson: string;
            store: string;
            order_value: number;
            items: number;
            status: string;
            workflow_state: string;
            docstatus: number;
            payment: string;
            delivery_status: string;
            delivery_display_status: string;
          }[];
        };
      },
      {
        employee: string;
        date?: string;
        from_date?: string;
        to_date?: string;
      }
    >({
      query: ({ date, employee, from_date, to_date }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_order_status`,
        method: 'GET',
        params: {
          employee,
          ...(from_date && to_date && from_date !== to_date
            ? { from_date, to_date }
            : { date: date ?? from_date }),
        },
      }),
    }),

    // API 8 — Team Performance List
    getAsmTeamPerformance: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          data: {
            employee_id: string;
            employee_name: string;
            initials: string;
            role: string;
            designation: string;
            reports_to?: string;
            attendance_status: string;
            check_in_time: string | null;
            check_out_time?: string | null;
            outlets_planned: number;
            outlets_visited: number;
            outlets_completed?: number;
            outlets_pending: number;
            completion_rate: number;
            orders: number;
            order_value: number;
            orders_delivered?: number;
            orders_pending?: number;
            store_created?: number;
            store_created_success?: number;
            avg_order_size?: number;
            conversion_rate?: number;
          }[];
        };
      },
      { date: string; employee: string }
    >({
      query: ({ date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_team_performance`,
        method: 'GET',
        params: { date, employee },
      }),
    }),

    // API 9 — Attendance Tab
    getAsmAttendanceTab: builder.query<
      {
        message: AsmAttendanceResponse
      },
      {
        employee: string;
        month?: number;
        year?: number;
        from_date?: string;
        to_date?: string;
        from_month?: number;
        to_month?: number;
        date?: string;
      }
    >({
      query: (params) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_attendance_tab`,
        method: 'GET',
        params,
      }),
    }),

    // API 10 — Daily PJP Tab
    getAsmDailyPjpTab: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          summary: {
            total_planned: number;
            total_visited: number;
            total_completed: number;
            total_pending: number;
            completion_rate: number;
          };
          records: {
            employee_id: string;
            employee_name: string;
            initials: string;
            designation: string;
            role: string;
            attendance_status: string;
            planned: number;
            visited: number;
            completed: number;
            pending: number;
            completion_rate: number;
            store_visits: {
              store_id: string;
              store_name: string;
              store_type: string;
              check_in_time: string | null;
              check_out_time: string | null;
              spent_time: string | null;
              visit_status: string;
            }[];
          }[];
        };
      },
      { date: string; employee: string }
    >({
      query: ({ date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_daily_pjp_tab`,
        method: 'GET',
        params: { date, employee },
      }),
    }),

    // API 11 — PJP Target vs Achievement (Monthly)
    getAsmPjpTargetVsAchievement: builder.query<
      {
        message: {
          success: boolean;
          period: { month: number; year: number; from: string; to: string };
          summary: {
            total_planned: number;
            total_visited: number;
            achievement_rate: number;
          };
          records: {
            employee_id: string;
            employee_name: string;
            designation: string;
            role: string;
            total_planned: number;
            total_visited: number;
            total_completed: number;
            achievement_rate: number;
          }[];
        };
      },
      {
        employee: string;
        month?: number;
        year?: number;
        from_date?: string;
        to_date?: string;
        from_month?: number;
        to_month?: number;
      }
    >({
      query: (params) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_pjp_target_vs_achievement`,
        method: 'GET',
        params,
      }),
    }),

    // API 12 — Target vs Achievement — PO vs SO (Monthly)
    getAsmTargetVsAchievement: builder.query<
      {
        message: {
          success: boolean;
          period: { month: number; year: number; from: string; to: string };
          summary: {
            total_target: number;
            total_so: number;
            achievement_pct: number;
          };
          records: {
            employee_id: string;
            employee_name: string;
            designation: string;
            role: string;
            target_amount: number;
            achieved_from_primary: number;
            so_total: number;
            achievement_pct: number;
          }[];
        };
      },
      {
        employee: string;
        month?: number;
        year?: number;
        from_date?: string;
        to_date?: string;
        from_month?: number;
        to_month?: number;
      }
    >({
      query: (params) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_target_vs_achievement`,
        method: 'GET',
        params,
      }),
    }),

    // API 13 — Order Detail Page
    getAsmOrderDetail: builder.query<
      {
        message: {
          success: boolean;
          order: {
            order_id: string;
            date: string;
            customer: string;
            store: string;
            salesperson: string;
            status: string;
            workflow_state: string;
            docstatus: number;
            delivery_status: string;
            delivery_display_status: string;
            billing_status: string;
            grand_total: number;
            total_qty: number;
            delivery_date: string;
            po_no: string;
            remarks: string;
            distributor_name: string
          };
          items: {
            item_code: string;
            item_name: string;
            qty: number;
            uom: string;
            rate: number;
            amount: number;
            delivered_qty: number;
            description: string;
          }[];
        };
      },
      { order_id: string }
    >({
      query: ({ order_id }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_order_detail?order_id=${order_id}`,
        method: 'GET',
      }),
    }),

    // API 14 — Team Detail Page
    getAsmTeamDetail: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          employee: {
            employee_id: string;
            employee_name: string;
            designation: string;
            attendance_status: string;
            check_in_time: string | null;
            check_out_time: string | null;
          };
          summary: { total_store: number; visited: number; pending: number };
          orders_summary: {
            orders: number;
            draft: number;
            order_value: number;
            total_items: number;
            delivered: number;
            pending: number;
          };
          store_list: {
            store_id: string;
            store_name: string;
            store_type: string;
            zone: string;
            city: string;
            status: string;
            check_in_time: string | null;
            check_out_time: string | null;
            spent_time: string | null;
            pjp_store_time: string | null;
          }[];
        };
      },
      { employee: string; date: string }
    >({
      query: ({ employee, date }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_team_detail`,
        method: 'GET',
        params: { employee, date },
      }),
    }),

    // API 15 — Store Detail Page
    getAsmStoreDetail: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          store: {
            store_id: string;
            store_name: string;
            store_type: string;
            zone: string;
            city: string;
            address: string;
            gst_no: string;
            pan_no: string;
            status: string;
          };
          visit_info: {
            employee: string;
            employee_name: string;
            check_in_time: string | null;
            check_out_time: string | null;
            spent_time: string | null;
            location: string;
          }[];
          orders: {
            order_id: string;
            time: string;
            grand_total: number;
            total_qty: number;
            item_count: number;
            status: string;
            workflow_state: string;
            docstatus: number;
            delivery_display_status: string;
          }[];
        };
      },
      { store_id: string; date: string; employee?: string }
    >({
      query: ({ store_id, date, employee }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_store_detail`,
        method: 'GET',
        params: { store_id, date, employee },
      }),
    }),

    // API 16 — Detail By User Page
    getAsmUserDetail: builder.query<
      {
        message: {
          success: boolean;
          date: string;
          employee: {
            employee_id: string;
            employee_name: string;
            designation: string;
            attendance_status: string;
            check_in_time: string | null;
            check_out_time: string | null;
          };
          pjp_summary: {
            planned: number;
            visited: number;
            completed: number;
            pending: number;
          };
          orders_summary: {
            orders: number;
            draft: number;
            order_value: number;
            total_items: number;
            delivered: number;
            pending: number;
          };
          stores_created: { created: number; successful: number };
          orders: {
            order_id: string;
            time: string;
            store: string;
            grand_total: number;
            total_qty: number;
            status: string;
            delivery_display_status: string;
            docstatus: number;
          }[];
          visits: {
            store_id: string;
            store_name: string;
            store_type: string;
            zone: string;
            check_in_time: string | null;
            check_out_time: string | null;
            spent_time: string | null;
          }[];
        };
      },
      { employee: string; date: string }
    >({
      query: ({ employee, date }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.api_get_user_detail`,
        method: 'GET',
        params: { employee, date },
      }),
    }),

    getStoresByLocation: builder.query<

      {
        message: {
          status: string;
          radius_meters: number;
          total: number;
          stores: {
            name: string;           // store ID e.g. "22000-9410"
            store_name: string;
            store_type: string;
            store_category: string;
            zone: string;
            state: string;
            city: string;
            pin_code: string;
            address: string;
            distributor: string;
            beat: string;
            status: string;
            pan_no: string | null;
            gst_no: string;
            store_street_address: string | null;
            start_time: string;
            end_time: string;
            weekly_off: string;
            latitude: number;
            longitude: number;
            distance_meters: number;
          }[];
        };
      },
      { latitude: number; longitude: number; radius?: number }
    >({
      query: ({ latitude, longitude, radius = 500 }) => ({
        url: `/method/salesforce_management.mobile_app_apis.dms_apis.store.get_nearby_stores`,
        method: 'GET',
        params: { latitude, longitude, radius },
      }),
    }),
    //TARGET VS achievement
    getEmployeeTargets: builder.query<RGetEmployeeTargets, IGetEmployeeTargetsParams>({
      query: ({ month, year }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.get_employee_targets`,
        method: 'POST',
        body: { month, year },
      }),
    }),

    // API 2 — Save / update targets for a specific month/year (upsert)
    setEmployeeTargets: builder.mutation<RSetEmployeeTargets, ISetEmployeeTargets>({
      query: body => ({
        url: `/method/salesforce_management.api.asm_dashboard.set_employee_targets`,
        method: 'POST',
        body,
      }),
    }),

    // API 3 — Fetch SO stats for a date range
    // Use data.message.value for total SO achievement (₹)
    getSoStats: builder.query<RGetSoStats, ISoStatsParams>({
      query: ({ from_date, to_date }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.get_so_stats`,
        method: 'POST',
        body: { from_date, to_date },
      }),
      providesTags: ['SO'],
    }),

    // API 4 — Fetch DDN stats for a date range
    // Use data.message.value for total DDN achievement (₹)
    // fill_rate = (del_qty / ord_qty) × 100
    getDdnStats: builder.query<RGetDdnStats, IDdnStatsParams>({
      query: ({ from_date, to_date, zone, store }) => ({
        url: `/method/salesforce_management.api.asm_dashboard.get_ddn_stats`,
        method: 'POST',
        body: {
          from_date,
          to_date,
          ...(zone ? { zone } : {}),
          ...(store ? { store } : {}),
        },
      }),
    }),

    //Distributor Delivery Note
    getDeliveryNotesList: builder.query<
      RDistributorDeliveryNoteList,
      {
        page: number;
        page_size: number;
        status?: string;
        from_date?: string;
        to_date?: string;
        search?: string;
      }
    >({
      query: ({ page, page_size, status, from_date, to_date, search }) => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.delivery_note_mobile_api.get_delivery_notes_list',
        method: 'GET',
        params: {
          page,
          page_size,
          ...(status ? { status } : {}),
          ...(from_date ? { from_date } : {}),
          ...(to_date ? { to_date } : {}),
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['SO'],
    }),
    getDeliveryNoteById: builder.query<DeliveryNoteResponse, string>({
      query: id => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.delivery_note_mobile_api.get_delivery_note_details',
        method: 'GET',
        params: {
          delivery_note_id: id,
        },
      }),
      providesTags: ['SO'],
    }),
    // ─── STOCK MANAGEMENT APIs ────────────────────────────────────────────────

    // Stock A — Get Items with Current Stock
    // Call this first to show the item list before employee enters physical count.
    getStockItems: builder.query<RGetStockItems, { store: string }>({
      query: ({ store }) => ({
        url: '/method/salesforce_management.salesforce_management.doctype.update_daily_stock.update_daily_stock.get_items',
        method: 'GET',
        params: { store },
      }),
      providesTags: ['Stock'],
    }),

    // Stock B — Submit Physical Stock Count
    // ⚠ items must be sent as a JSON string (use JSON.stringify on the items array before passing).
    // On success returns { message: true }.
    // If an item was already submitted today, returns a warning but remaining items still process.
    createStockBalance: builder.mutation<RCreateStockBalance, ICreateStockBalance>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.stock_api.create_stock_balance',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Stock'],
    }),

    // Stock C — Get Stock Dashboard
    // Only items with activity or stock are returned (zero-zero items filtered out).
    // Mobile flow: getStockItems → employee counts → createStockBalance → getStoreStockStatus
    getStoreStockStatus: builder.query<RGetStoreStockStatus, { store: string }>({
      query: ({ store }) => {
        return {
          url: `/method/salesforce_management.mobile_app_apis.pjp_apis.stock_api.get_store_stock_status`,
          method: 'GET',
          params: { store },
        };
      },
      providesTags: ['Stock'],
    }),

    // ─── NON-PJP ACTIVITY ATTENDANCE APIs ────────────────────────────────────

    // Activity A — Get Activity Locations
    // Fetches all permanently saved Office/Event locations for the mobile dropdown.
    getActivityLocations: builder.query<RGetActivityLocations, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.activity_attendance_api.get_activity_locations',
        method: 'GET',
      }),
      providesTags: ['Activity'],
    }),

    // Activity B — Create Activity Location
    // Creates a new permanent location in the master database.
    createActivityLocation: builder.mutation<RCreateActivityLocation, ICreateActivityLocation>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.activity_attendance_api.create_activity_location',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Activity'],
    }),

    // Activity C — Check-In (Activity)
    // Validates geofence, uploads selfie, logs check-in, creates "Present" Attendance in HRMS.
    // Auto-checkout at 11:50 PM if employee forgets to check out.
    activityCheckIn: builder.mutation<RActivityCheckIn, IActivityCheckIn>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.activity_attendance_api.mobile_activity_checkin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Activity'],
    }),

    // Activity D — Check-Out (Activity)
    activityCheckOut: builder.mutation<RActivityCheckOut, IActivityCheckOut>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.activity_attendance_api.mobile_activity_checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Activity'],
    }),
    // Activity E — Get Activity Check-In Status
    // Returns current check-in state for the employee (checked in or not).
    getActivityCheckInStatus: builder.query<RGetActivityCheckInStatus, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.activity_attendance_api.get_activity_checkin_status',
        method: 'GET',
      }),
      providesTags: ['Activity'],
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
  useGetLastPjpStoresQuery,
  useUpdateDailyPjpMutation,
  useAddDailyPjpMutation,
  useGetProdCountQuery,
  useUpdatePjpRouteMutation,
  useLazyGetLastPjpStoresQuery,

  //Partner
  useGetStoreListQuery,
  useGetDistributorListQuery,
  useAddDistributorMutation,
  useAddStoreMutation,
  useUpdateStoreMutation,
  useGetStoreByIdQuery,
  useCheckStoreNameQuery,
  //Report
  useGetReportQuery,
  //ASM Dashboard
  useGetAsmDashboardQuery,
  useGetAsmZonesQuery,
  useGetAsmOverviewQuery,
  useGetAsmKeyMetricsQuery,
  useGetAsmStoreCreatedQuery,
  useGetAsmStorePlanningQuery,
  useGetAsmBusinessGeneratedQuery,
  useGetAsmOrderStatusQuery,
  useGetAsmTeamPerformanceQuery,
  useGetAsmAttendanceTabQuery,
  useGetAsmDailyPjpTabQuery,
  useGetAsmPjpTargetVsAchievementQuery,
  useGetAsmTargetVsAchievementQuery,
  useGetAsmOrderDetailQuery,
  useGetAsmTeamDetailQuery,
  useGetAsmStoreDetailQuery,
  useGetAsmUserDetailQuery,
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
  useGetStoresByLocationQuery,

  // TARGETVSACHIEVMENT
  useGetEmployeeTargetsQuery,
  useSetEmployeeTargetsMutation,
  useGetSoStatsQuery,
  useGetDdnStatsQuery,

  //Distributor Delivery Note
  useGetDeliveryNotesListQuery,
  useGetDeliveryNoteByIdQuery,

  // Stock Management
  useGetStockItemsQuery,
  useCreateStockBalanceMutation,
  useGetStoreStockStatusQuery,
  // Activity Attendance
  useGetActivityLocationsQuery,
  useCreateActivityLocationMutation,
  useActivityCheckInMutation,
  useActivityCheckOutMutation,
  useGetActivityCheckInStatusQuery,

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

export const { resetPjpState, setSelectedStore, resetLocation } =
  pjpSlice.actions;
export default pjpSlice.reducer;
