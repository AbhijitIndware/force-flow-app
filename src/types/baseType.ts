import { ApiResponse, Filters, PaginationInfo } from './Navigation';

export interface IAddDistributorPayload {
  data: {
    distributor_name: string;
    distributor_sap_code: string;
    distributor_group: string;
    distributor_code: string;
    mobile: string;
    email: string;
    employee: string;
    zone: string;
    state: string;
    city: string;
    reports_to: string;
    designation: string;
  };
}

export interface IAddStorePayload {
  data: {
    store_name: string;
    store_owner_name: string;
    store_type: string;
    store_category: string;
    zone: string;
    state: string;
    map_location: string;
    // start_time: string; // Format: "HH:mm:ss"
    // end_time: string; // Format: "HH:mm:ss"
    pan_no: string;
    gst_no: string;
    city: string;
    pin_code: string;
    distributor: string;
    address: string;
    weekly_off: string;
    created_by_employee: string;
    created_by_employee_name: string;
    created_by_employee_designation: string;
    store_image: {
      mime: string;
      data: string;
    };
  };
}
export interface IUpdateStorePayload {
  data: {
    name: string;
    store_name: string;
    store_owner_name: string;
    store_type: string;
    store_category: string;
    zone: string;
    state: string;
    map_location: string;
    // start_time: string; // Format: "HH:mm:ss"
    // end_time: string; // Format: "HH:mm:ss"
    pan_no: string;
    gst_no: string;
    city: string;
    pin_code: string;
    distributor: string;
    address: string;
    weekly_off: string;
    created_by_employee: string;
    created_by_employee_name: string;
    created_by_employee_designation: string;
    store_image: {
      mime: string;
      data: string;
    };
  };
}
export interface ModifyStoreResponse {
  message: {
    status: string;
    message: string;
    store_name: string;
  };
}

export interface GetStoreResponse {
  message: {
    status: string;
    data: StoreDataById;
  };
}

export interface StoreDataById {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  status: string;

  store_name: string;
  store_owner_name: string;
  store_type: string;
  store_category: string;
  map_location: string;
  start_time: string;
  end_time: string;
  beat: string;
  custom_promoter: number;

  pan_no: string;
  gst_no: string;
  zone: string;
  state: string;
  city: string;
  pin_code: string;
  distributor: string;
  address: string;
  weekly_off: string;

  np_scheme_number: number;
  np_po_value_start: number;
  np_po_value_end: number;
  np_po_monthly_target: number;
  np_units_start: number;
  np_units_end: number;
  np_units_monthly_target: number;

  op_scheme_number: number;
  op_po_value_start: number;
  op_po_value_end: number;
  op_po_monthly_target: number;
  op_units_start: number;
  op_units_end: number;
  op_units_monthly_target: number;

  item_group: string;
  payout: number;

  created_by_employee: string;
  created_by_employee_name: string;
  created_by_employee_designation: string;

  reports_to_name: string;
  reports_to_designation: string;

  amended_from: string | null;
  coordinates: string | null;
  store_street_address: string | null;
  store_full_address: string | null;
  map: string | null;
  store_image?: string;

  doctype: string;
}

type StoreEntry = {
  store: string;
};

export type StoreStatus = {
  checked_in: boolean;
  activity_marked: boolean;
  checked_out: boolean;
};

export type StoreActions = {
  can_check_in: boolean;
  can_mark_activity: boolean;
  can_check_out: boolean;
};

export type StoreTimes = {
  check_in_time: string | null;
  check_out_time: string | null;
  image: string | null;
};

export type StoreTargets = {
  target_qty: number | null;
  achieved_qty: number | null;
};
export type StoreData = {
  name: string;
  store: string;
  status: StoreStatus;
  actions: StoreActions;
  times: StoreTimes;
  targets: StoreTargets;
  store_name: string;
  store_image: string;
};
export type RPjpInitialize = {
  message: {
    success: boolean;
    data: {
      employee: {
        employee_id: string; // Changed to string for general use
        employee_name: string;
        store: string;
        check_out_time: string | null; // Assuming it could be a string date/time or null
      };
      stores: StoreData[];
      store_category_validation: {
        valid: boolean; // Assuming true/false
        message: string;
      };
      date: string;
    };
  };
  _server_messages: string;
};

export type ILocationVerify = {
  store: string;
  current_location: string;
  validate_location: boolean;
};
export type RLocationVerify = {
  message: {
    success: boolean;
    data: {
      store: string;
      employee: string;
      status: {
        checked_in: boolean;
        activity_marked: boolean;
        checked_out: boolean;
      };
      actions: {
        can_check_in: boolean;
        can_mark_activity: boolean;
        can_check_out: boolean;
      };
      times: {
        check_in_time: string | null; // ISO time string
        check_out_time: string | null;
        image: string | null;
      };
      targets: {
        target_qty: number | null;
        achieved_qty: number | null;
      };
      location_validation: {
        valid: boolean;
        message: string;
      };
    };
  };
};

export type IAddCheckIn = {
  store: string;
  image: {
    mime: string;
    data: string;
  };
  current_location: string;
  bypass_store_category: string;
  store_image?: {
    mime: string;
    data: string;
  };
};
export type RAddCheckIn = {
  message: {
    status: string;
    data: {
      check_in_time: string;
      image_mime: string;
      image_url: string;
      store: string;
      targets: {
        achieved_qty: string;
        target_qty: string;
      };
      times: {
        check_in_time: string;
        check_out_time: string;
        image: string;
      };
      employee: string;
    };
  };
};
export type ICheckOut = {
  store: string;
  current_location: string;
  validate_geofence: boolean;
};
export type IMarkActivity = {
  store: string;
  activity_type: { activity_type: string }[];
};

export interface IAddDistributorResponse extends ApiResponse {
  message: {
    status: string;
    data: {
      distributor_name: string;
      distributor_sap_code: string;
      distributor_group: string;
      distributor_code: string;
      mobile: string;
      email: string;
      employee: string;
      zone: string;
      state: string;
      city: string;
      reports_to: string;
      designation: string;
    };
  };
}

//Sales Order
export interface SalesOrderType {
  order_id: string;
  customer: string;
  customer_name: string;
  transaction_date: string; // ISO string
  delivery_date: string; // ISO string or empty
  grand_total: number;
  status: string;
  workflow_state: string;
  store_warehouse: string;
  store_name: string;
  distributor: string;
  purchase_order: string | null;
  created_by: string;
  item_count: number;
  store_image?: string;
}
export type RSoList = {
  message: {
    success: boolean;
    data: {
      sales_orders: SalesOrderType[]; // empty array in sample, but define type
      pagination: PaginationInfo;
    };
  };
};
export type RSoDetailData = {
  order_details: {
    order_id: string;
    customer: string;
    customer_name: string;
    transaction_date: string; // ISO Date string
    delivery_date: string; // ISO Date string
    status: string;
    workflow_state: string;
    grand_total: number;
    total_qty: number;
    custom_warehouse: string;
    custom_supplier: string;
    custom_purchase_order: string | null;
    terms: string | null;
    created_by: string;
    creation: string; // timestamp
    modified: string; // timestamp
    docstatus: number;
    store_name: string;
  };
  items: {
    item_code: string;
    item_name: string;
    description: string;
    qty: number;
    rate: number;
    amount: number;
    physical_qty?: number;
    uom: string;
    warehouse: string;
    delivery_date: string; // ISO Date string
  }[];
  store_details: {
    warehouse_name: string;
    store: string;
    distributor: string;
    store_image?: string;
  };
  totals: {
    total: number;
    total_taxes_and_charges: number;
    grand_total: number;
    rounded_total: number;
  };
};
export type RSoDetails = {
  message: {
    success: boolean;
    data: RSoDetailData;
  };
};

export type IAddSalesOrder = {
  transaction_date: string; // ISO date string
  delivery_date: string; // ISO date string
  custom_warehouse: string;
  items: {
    item_code: string;
    qty: number;
    rate: number;
    delivery_date: string; // ISO date string
  }[];
  terms: string | null;
  submit_order: boolean;
};
export type RAddSalesOrder = {
  message: {
    success: boolean;
    message: string;
    data: {
      order_id?: string;
      original_order_id?: string;
      amended_order_id?: string;
      status: string;
      workflow_state: string;
      grand_total: number;
      total_qty: number;
      docstatus: number;
    };
  };
};

export type IAddSalesOrderV2 = {
  customer?: string;
  transaction_date?: string; // ISO date string — defaults to today
  delivery_date?: string; // ISO date string — defaults to today + 7 days
  custom_warehouse: string; // store's warehouse ID — REQUIRED
  terms?: string | null; // terms and conditions name
  submit_order?: boolean; // defaults to false (keep as Draft)
  items: {
    item_code: string;
    qty: string | number; // order quantity
    rate: number;
    physical_qty?: string | number; // required for items with stock history
    // unless already counted today (Rule 3)
    delivery_date?: string; // per-item override
  }[];
};
export type RAddSalesOrderV2 = {
  message: {
    success: boolean;
    message: string;
    // ── Success payload ───────────────────────────────────────────────
    data?: {
      order_id: string;
      status: string;
      workflow_state: string;
      grand_total: number;
      total_qty: number;
      docstatus: number;
      stock_update: {
        item_code: string;
        physical_qty: number | null;
        // "recorded"         → count saved successfully today
        // "already_recorded" → count already existed for today, skipped
        status: 'recorded' | 'already_recorded';
      }[];
    };
    // ── Rule 1 violation payload ──────────────────────────────────────
    blocked_items?: string[];
  };
};

// 🔹 Update type
type OrderItem = {
  item_code: string;
  qty: number | string;
  physical_qty?: number | string;
  delivery_date?: string; // order quantity
  rate: number;
};
export type IUpdateSalesOrder = {
  order_id: string;
  custom_warehouse: string;
  submit_order?: any;
  delivery_date?: string; // ISO date
  terms?: any;
  items: OrderItem[];
};

export type IUpdateSOAction = {
  order_id: string;
  action: 'Approve' | 'Reject' | 'Cancel' | string; // extendable for other actions
};

export type ICancelSO = Pick<IUpdateSOAction, 'action' | 'order_id'> & {
  reason: string;
};

export type IAmendSO = {
  order_id: string;
  amendments: {
    delivery_date?: string; // ISO date string (optional, since not always amended)
    items?: {
      item_code: string;
      qty: number;
      rate: number;
      delivery_date?: string; // ISO date string (optional for amendment)
    }[];
  };
};

//Purchase Order
export type IAddPurchaseOrder = {
  sales_orders: string[];
  schedule_date: string;
  submit_order: boolean;
};
export type IAmendPO = {
  order_id: string;
  amendments: {
    schedule_date?: string; // ISO date string (optional, since not always amended)
    supplier: string;
    items?: {
      item_code: string;
      qty: number;
      rate: number;
      sales_order?: string; // ISO date string (optional for amendment)
    }[];
  };
};
export interface PurchaseOrder {
  order_id: string;
  supplier: string;
  supplier_name: string;
  distributor: string;
  distributor_name: string;
  transaction_date: string; // ISO date string
  schedule_date: string; // ISO date string
  grand_total: number;
  status: string;
  per_received: number;
  per_billed: number;
  item_count: number;
  linked_sales_orders: string[];
  linked_so_count: number;
}

export interface PurchaseOrderResponseData {
  purchase_orders: PurchaseOrder[];
  total_count: number;
  has_more: boolean;
}
export type RPoList = {
  message: {
    success: boolean;
    data: PurchaseOrderResponseData;
  };
};

export interface POOrderDetails {
  created_by: string;
  order_id: string;
  supplier: string;
  supplier_name: string;
  distributor: string;
  distributor_name: string;
  transaction_date: string; // ISO date string
  schedule_date: string; // ISO date string
  status: string;
  grand_total: number;
  total_qty: number;
  per_received: number;
  per_billed: number;
  terms: string | null;
  creation: string; // datetime string
  modified: string; // datetime string
  docstatus: number;
  workflow_state: string;
}
export interface POOrderItem {
  item_code: string;
  item_name: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  uom: string;
  warehouse: string;

  schedule_date: string; // ISO date string
  sales_order: string | null;
  received_qty: number;
  billed_amt: number;
}

export interface Totals {
  total: number;
  total_taxes_and_charges: number;
  grand_total: number;
  rounded_total: number;
}

type LinkedDDN = {
  name: string;
  invoice_no: string;
  date: string; // or Date if you parse it
  remarks: string;
  workflow_state: string;
  del_qty: number;
  ord_qty: number;
  grand_total: number;
  creation: string; // or Date
  created_by: string;
};
export interface POOrderData {
  order_details: POOrderDetails;
  items: POOrderItem[];
  linked_sales_orders: {
    sales_order: string;
    customer_name: string;
    grand_total: number;
  }[]; // can replace `any` with correct type if structure is known
  totals: Totals;

  linked_ddns: LinkedDDN[];
}

export type RPoDetails = {
  message: {
    success: boolean;
    data: POOrderData;
  };
};

export interface RPOSOCount {
  message: {
    success: boolean;
    data: {
      overall: {
        total_orders: number;
        total_sales_orders: number;
        total_purchase_orders: number;
        total_draft: number;
        total_submitted: number;
        total_cancelled: number;
      };
      sales_orders: {
        total: number;
        draft: number;
        submitted: number;
        cancelled: number;
        status_wise: Record<string, number>; // e.g., "Draft": 2, "Cancelled": 1
      };
      purchase_orders: {
        total: number;
        draft: number;
        submitted: number;
        cancelled: number;
        status_wise: Record<string, number>; // e.g., "Draft": 7
      };
      delivery_notes: {
        total: number;
        draft: number;
        submitted: number;
        cancelled: number;
        status_wise: {
          Draft: number;
          Submitted: number;
          Cancelled: number;
        };
      };
      filters_applied: {
        from_date: string | null;
        to_date: string | null;
        date_filtered: boolean;
      };
      timestamp: string; // ISO datetime string
    };
  };
}

//PJP
export interface RPjpDailyStores {
  message: {
    status: string; // e.g. "success"
    data: {
      pjp_daily_stores: PjpDailyStore[];
      pagination: PaginationInfo;
    };
  };
}
export type PjpDailyStoreDetail = {
  creation: string;
  // stores: {
  //   store: string;
  //   store_name: string;
  //   store_category: string;
  // }[];
  stores: Store[];
  pjp_daily_store_doc: string;
  pjp_date: string; // ISO date string "2025-08-29"
  pjp_emp: string;

  start_location: string;
  end_location: string;
  running_status: 'None' | 'Running' | 'Completed' | null;
};
export interface RPjpDailyById {
  message: {
    status: string;
    data: PjpDailyStore;
  };
}

export interface PjpDailyStore {
  pjp_daily_store_id: string;
  date: string; // ISO date string "2025-08-29"
  employee: string;
  employee_name: string;
  creation: string; // timestamp
  modified: string; // timestamp
  stores: Store[];
  total_stores: number;
  start_location: string;
  end_location: string;
  running_status: 'None' | 'Running' | 'Completed' | null;
  planned_activities?: PlannedActivity[];
  is_overnight_outstation_journey?: number;
}

export interface Store {
  store_id: string;
  store_name: string;
  store_category: string;
  city: string | null;
  state: string | null;
  outstanding_amount: number;
  warehouse: Warehouse[];
  store_image?: string;
}

export interface Warehouse {
  warehouse_id: string;
  warehouse_name: string;
  distributor_id: string;
  distributor_name: string;
  is_group: number; // looks like 0/1 instead of boolean
  parent_warehouse: string;
  company: string;
}

export type PlannedActivity = {
  activity_type: string;
  activity_location: string;
};

export type IAddPjpPayload = {
  data: {
    date: string;
    employee: string;
    stores: StoreEntry[];
    planned_activities?: PlannedActivity[];
  };
};

export type IUpdatePjpPayload = {
  data: {
    date: string;
    employee: string;
    stores: StoreEntry[];
    document_name: string;
    planned_activities?: PlannedActivity[];
  };
};

export type IUpdatePjpRoutePayload = {
  data: {
    document_name: string;
    action_type: string;
    start_location?: string;
    end_location?: string;
  };
};
export type RUpdatePjpRoute = {
  message: {
    status: string;
    message: string;
    document_name: string;
    updated_fields: string[];
  };
};

export interface RPjpCreateResponse {
  message: {
    status: string;
    message: string;
    document_name: string;
  };
}

export interface RPjpUpdateResponse {
  message: {
    status: string;
    message: string;
    document_name: string;
    updated_fields: string[];
  };
}

export interface RPjpDailyStoresForEdit {
  message: {
    status: string;
    data: {
      document_name: string;
      date: string;
      employee: string;
      total_stores: number;
      total_activities: number;
      stores: {
        store: string;
        store_name: string;
        store_owner_name: string | null;
        store_category: string;
        city: string;
        state: string;
        pin_code: string;
        created_by_employee: string;
        created_by_employee_name: string;
        warehouse_id: string;
      }[];
      planned_activities: {
        activity_type: string;
        activity_location: string;
      }[];
      creation: string;
      modified: string;
      modified_by: string;
    };
  };
}

export interface RUpdateProdCount {
  message: {
    status: string;
    message: string;
    document_name: string;
    updated_fields: string[];
  };
}

export interface RProdCount {
  message: {
    status: string;
    message: string;
    date: string; // ISO date string: "2025-08-25"
    pjp_status: string;
    stores: Store[];
    pjp_daily_store_doc: string;
    counts: Counts;
  };
}
export interface Counts {
  total_stores: number;
  status_counts: {
    Pending: number;
    Visited: number;
    Missed: number;
  };
  checkin_counts: number;
  checkout_counts: number;
  activity_marked_counts: number;
  completed_stores: number;
  pending_stores: number;
  missed_stores: number;
}

export interface LastPjpStore {
  doctype: string;
  store: string;
  store_name: string;
  store_owner_name: string | null;
  store_category: string;
  city: string;
  state: string;
  pin_code: string;
  created_by_employee: string;
  created_by_employee_name: string;
  warehouse_id: string;
  is_unplanned: number;
  store_image?: string;
}

export interface RLastPjpStores {
  message: {
    status: string;
    message: string;
    data: LastPjpStore[];
    last_pjp_name: string;
  };
}

//Partner
export interface Store {
  id: string;
  name: string;
  store_type: string;
  address: string | null;
  map_location: {
    lat: number | null;
    lng: number | null;
  } | null;
  creation: string; // ISO datetime string
  modified: string; // ISO datetime string
  modified_by: string;
  owner: string;
  docstatus: number;
  idx: number;
  status: string;
  start_time: string; // "HH:mm:ss" format
  end_time: string; // "HH:mm:ss" format
  pan_no: string;
  gst_no: string;
  zone: string;
  pin_code: string;
  distributor: string;
  weekly_off: string;
  np_scheme_number: number;
  np_po_value_start: number;
  np_po_value_end: number;
  np_po_monthly_target: number;
  np_units_start: number;
  np_units_end: number;
  np_units_monthly_target: number;
  op_scheme_number: number;
  op_po_value_start: number;
  op_po_value_end: number;
  op_po_monthly_target: number;
  op_units_start: number;
  op_units_end: number;
  op_units_monthly_target: number;
  item_group: string | null;
  payout: number;
  created_by_employee: string;
  created_by_employee_name: string;
  created_by_employee_designation: string;
  reports_to_name: string;
  reports_to_designation: string;
  amended_from: string | null;
  _user_tags: any;
  _comments: any;
  _assign: any;
  _liked_by: any;
  beat: string;
  custom_promoter: number;
  coordinates: any;
  store_street_address: string | null;
  store_full_address: string | null;
  map: any;
  store_image?: string;
}

export interface RStoreList {
  message: {
    success: boolean;
    data: {
      stores: Store[];
      pagination: {
        total_count: number;
        page: number;
        page_size: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    };

    pagination: PaginationInfo;
    filters: Filters;
    search: string | null;
  };
}

export interface Distributor {
  name: string;
  creation: string; // e.g. "2025-07-11 17:28:41.465522"
  modified: string;
  modified_by: string;
  owner: string;
  docstatus: number;
  idx: number;
  distributor_name: string;
  distributor_sap_code: string;
  distributor_group: string;
  distributor_code: string;
  mobile: string;
  email: string;
  employee: string;
  zone: string;
  state: string;
  city: string;
  reports_to: string | null;
  designation: string;
  _user_tags: string | null;
  _comments: string | null;
  _assign: string | null;
  _liked_by: string | null;
}

export interface Pagination {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DistributorData {
  distributors: Distributor[];
  pagination: Pagination;
}

export interface RDistributorList {
  message: {
    success: boolean;
    data: DistributorData;
  };
}

export interface LocationResponse {
  message: {
    success: boolean;
    lat: number;
    lng: number;
    address: string;
    city: null | string;
    cities: string[];
    message: string;

    zone: string;
    state: string;
    county: string;

    raw: {
      place_id: number;
      licence: string;
      osm_type: string;
      osm_id: number;
      lat: string;
      lon: string;
      class: string;
      type: string;
      place_rank: number;
      importance: number;
      addresstype: string;
      name: string;
      display_name: string;
      address: {
        amenity: string;
        road: string;
        suburb: string;
        city: string;
        state_district: string;
        state: string;
        'ISO3166-2-lvl4': string;
        postcode: string;
        country: string;
        country_code: string;
      };
      boundingbox: [string, string, string, string];
    };
  };
}

export interface ReportResponse {
  message: ReportMessage;
}

export interface ReportMessage {
  result: (ReportResult | (string | number | null)[])[];
  columns: ReportColumn[];
  message: string | null;
  chart: ReportChart;
  report_summary: any; // can be refined if you know structure
  skip_total_row: number;
  status: string | null;
  execution_time: number;
  add_total_row: boolean;
}

export interface ReportResult {
  item_code: string;
  item_name: string;
  item_group: string;
  description: string;
  quantity: number;
  uom: string;
  rate: number;
  amount: number;
  sales_order: string;
  transaction_date: string;
  customer: string;
  customer_name: string;
  customer_group: string;
  territory: string;
  project: string | null;
  delivered_quantity: number;
  billed_amount: number;
  company: string;
  currency: string;
  store_name: string;
}

export interface ReportColumn {
  label: string;
  fieldtype: string;
  fieldname: string;
  options?: string;
  width?: number;
  hidden?: number;
}

export interface ReportChart {
  data: ChartData;
  type: string;
  fieldtype: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  name: string;
  values: number[];
}

export interface AttendanceResponse {
  message: {
    success: boolean;
    employee: string;
    pagination: {
      page: number;
      page_size: number;
      total_records: number;
      total_pages: number;
    };
    records: AttendanceRecord[];
    summary: {
      Absent: number;
      Present: number;
    };
  };
}
export interface IGetAttendanceParams {
  employee: string;
  from_date: string;
  to_date?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface IAttendanceSummaryResponse {
  message: {
    success: boolean;
    employee: string;
    total_working_hours_decimal: number;
    total_working_hours_formatted: string;
    status_counts: IStatusCounts;
    total_records: number;
    data: IAttendanceRecord[];
  };
}

export interface IStatusCounts {
  Present: number;
  Absent: number;
  'Half Day': number;
  'Weekly Off': number;
}

export interface IAttendanceRecord {
  date: string;
  status: string;
  working_hours_decimal: number;
  working_hours_formatted: string;
  first_check_in: string;
  last_check_out: string;
}

export interface AttendanceRecord {
  name: string;
  employee_name: string;
  attendance_date: string; // can convert to Date if needed
  status: 'Present' | 'Absent' | string; // or tighten further
  in_time: string | null;
  out_time: string | null;
  working_hours: number;
}

export interface RAssignEmployee {
  message: {
    status: string; // e.g., "success" or "error"
    message: string;
    current_employee: string; // e.g., "EMP-001"
    current_reports_to: string; // e.g., "EMP-MGR-001"
    employees: Employee[];
    total_count: number;
  };
}

export interface Employee {
  employee_id: string; // "EMP-002"
  employee_name: string; // "John Doe"
  designation: string; // "Sales Officer"
  reports_to: string; // "EMP-001"
  department: string; // "Sales"
  relationship: string; // "Subordinate" | "Peer" | etc.
  employee_number: string; // "121212"
}

export interface ICopyPjpRequest {
  data: {
    source_pjp?: string; // Optional: PJP document name (e.g., "PJP-DS-2024-00001")
    target_employee: string[]; // Required: Employee ID (e.g., "EMP-00123")
    date?: string; // Optional: e.g., "2024-11-13"
  };
}

export interface RCopyPjpSuccess {
  message: {
    status: 'completed';
    message: string; // e.g., "PJP copied successfully to employee EMP-00123."
    source_pjp: string; // e.g., "PJP-DS-2024-00001"
    new_pjp: string; // e.g., "PJP-DS-2024-00045"
    target_employee: string; // e.g., "EMP-00123"
    date: string; // e.g., "2024-11-13"
    stores_count: number; // e.g., 15
    success?: any[];
    errors?: any[];
  };
}

//Sales

export interface RSalesReport {
  message: {
    status: string;
    message: string;
    view_type: string;
    current_employee: string;
    date_range: {
      from: string;
      to: string;
    };
    summary: {
      total_orders: number;
      total_qty: number;
      total_value: number;
      employee_count: number;
    };
    ftd_summary: {
      label: string;
      total_orders: number;
      total_qty: number;
      total_value: number;
    };
    mtd_summary: {
      label: string;
      date_range: {
        from: string;
        to: string;
      };
      total_orders: number;
      total_qty: number;
      total_value: number;
    };
    data: EmployeeData[];
  };
}

export interface EmployeeData {
  employee_id: string;
  employee_name: string;
  employee_number: string;
  designation: string;
  department: string | null;
  relationship: string;
  total_orders: number;
  total_qty: number;
  total_value: number;
}

//Expense
export type RExpenseClaimType = {
  data: { name: string }[];
};

export type ClaimData = {
  claim: string;
  claimed: number;
  date: string;
  expense_type: string;
  sanctioned: number;
};
export type RExpenseClaimByEmp = {
  message: { data: ClaimData[] };
};

export interface IExpenseItem {
  expense_type: string;
  expense_date: string; // ISO date string
  amount: number;
  custom_claim_description: string;
}

export interface ExpenseClaimPayload {
  employee: string;
  // company: string;
  posting_date: string;
  custom_travel_start_date: string;
  custom_travel_end_date: string;

  expenses: IExpenseItem[];
}

export interface FrappeFileUploadPayload {
  doctype: string;
  file_name: string;
  is_private: number;
  attached_to_doctype: string;
  attached_to_name: string;
  content: string; // Base64 string
}

export interface RExpenseClaimDetail {
  data: ExpenseClaim;
}
export interface ExpenseClaim {
  name: string;
  doctype: 'Expense Claim';
  docstatus: number;
  approval_status: string;
  status: string;

  employee: string;
  employee_name: string;

  posting_date: string;

  company: string;
  cost_center: string;

  custom_travel_start_date: string;
  custom_travel_end_date: string;
  custom_from_city: string;
  custom_to_city: string;
  custom_city_class: string;
  custom_travel_type: string;

  custom_days: number;
  custom_distance_km: number;

  custom_manager_approval_bike_over_100: number;
  custom_manager_approval_for_extra: number;
  custom_manager_approval_promotional: number;

  advances: any[]; // no sample inside → keep as any[]
  taxes: any[];

  total_claimed_amount: number;
  total_sanctioned_amount: number;
  total_amount_reimbursed: number;
  total_taxes_and_charges: number;
  total_advance_amount: number;
  grand_total: number;

  expenses: ExpenseItem[];

  creation: string;
  modified: string;
  owner: string;
  modified_by: string;

  naming_series: string;
  is_paid: number;
  idx: number;
}

export interface ExpenseItem {
  name: string;
  doctype: 'Expense Claim Detail';
  parent: string;
  parenttype: string;
  parentfield: string;

  idx: number;
  docstatus: number;

  expense_type: string;
  expense_date: string;

  description?: string;
  custom_claim_description: string;

  amount: number;
  sanctioned_amount: number;

  default_account?: string;

  // Telecom-related fields
  custom_telecom_handset_cost: number;
  custom_telecom_isd_amount: number;
  custom_telecom_late_fee: number;
  custom_telecom_other_disallowed: number;

  // Travel fields
  custom_is_local: number;
  custom_is_promotional?: number;
  custom_ta_km: number;
  custom_ta_mode: string;

  creation: string;
  modified: string;
  modified_by: string;
  owner: string;
}

export interface ExpenseClaimAttachment {
  name: string;
  file_name: string;
  file_url: string;
  is_private: 0 | 1; // ERPNext uses 0/1 instead of boolean
  creation: string; // ISO datetime string
  attached_to_name: string;
}

export type RAttachmentByClaim = {
  data: ExpenseClaimAttachment[];
};

//Promoter
export type PromoterAttendanceData = {
  checked_in: boolean;
  checked_out: boolean;
  actions: {
    can_check_in: boolean;
    can_check_out: boolean;
  };
  shift_info: {
    store: string[];
    start_time: string; // or Date if backend returns actual date format
    end_time: string; // same as above
  } | null; // if shift info may not exist
  has_bypass_role: boolean;

  assigned_store: any;
  attendance_date: string;
  checkin_records: { check_in: null; check_out: null };
  employee: string;
  employee_name: string;
  message: string;
};

export interface RPromoterAttendance {
  message: {
    success: boolean;
    data: AttendanceData;
  };
}

export interface ICheckInRequest {
  store: string;
  image: {
    mime: string; // e.g. "image/png"
    data: string; // base64 encoded string
  };
  latitude: number | null;
  longitude: number | null;
  current_location: string;
  address: string;
}
/* ---------- Root Response ---------- */

export interface RCheckIn {
  message: CheckInMessage;
  _server_messages?: string; // stringified JSON array (Frappe)
}

/* ---------- Message ---------- */

export interface CheckInMessage {
  success: boolean;
  message: string;
  data: CheckInData;
}

/* ---------- Data ---------- */

export interface CheckInData {
  log_id: string;
  attendance_id: string;
  checkin_id: string | null;
  employee: string;
  employee_name: string;
  store: string;
  checkin_time: string; // ISO datetime string
  attendance_date: string; // YYYY-MM-DD
  entry_type: 'Late' | 'On Time' | string;
  image_url: string;
  has_bypass_role: boolean;
}

export interface ICheckOutRequest {
  image: {
    mime: string; // e.g. "image/png"
    data: string; // base64 encoded string
  };
  latitude: number | null;
  longitude: number | null;
  current_location: string;
  address: string;
}
export type RCheckOut = {
  message: CheckoutMessage;
  _server_messages?: string; // JSON string array from Frappe
};

/* ---------- Message ---------- */

export interface CheckoutMessage {
  success: boolean;
  message: string;
  data: CheckoutData;
}

/* ---------- Data ---------- */

export interface CheckoutData {
  log_id: string;
  attendance_id: string;
  checkout_id: string | null;
  working_hours: string | null;
  checkout_image_url: string;
}

export interface AvailableStore {
  store_id: string;
  store_name: string;
  city: string;
  state: string;
  map_location: string; // "lat,long" as string
  is_primary: boolean;
  store_image: string;
}

export interface ShiftAssignment {
  name: string;
  shift_type: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  is_floater: number; // 1 or 0
}

export interface AttendanceShiftData {
  employee: string;
  employee_name: string;
  has_bypass_role: boolean;
  shift_assignment: ShiftAssignment | null;
  primary_store: string;
  available_stores: AvailableStore[];
}

export interface RAttendanceShift {
  message: {
    success: boolean;
    data: AttendanceShiftData;
  };
}

export interface AttendanceData {
  checked_in: boolean;
  checked_out: boolean;
  actions: AttendanceActions;
  checkout_time: string;
  checkin_time: string;
  attendance_date: string;
  employee: string;
  employee_name: string;
  has_bypass_role: boolean;
  shift_info: ShiftInfo;
  assigned_store: string;
  available_stores: StoreInfo[];
  checkin_records: CheckinRecords;
  message: string;
}

export interface AttendanceActions {
  can_check_in: boolean;
  can_check_out: boolean;
}

export interface ShiftInfo {
  store: string;
  store_name: string;
  start_time: string | null;
  end_time: string | null;
  is_floater: number;
  store_image: string;
}

export interface StoreInfo {
  store_id: string;
  store_name: string;
  city: string;
  state: string;
  map_location: string;
  is_primary: boolean;
  store_image: string;
}

export interface CheckinRecords {
  check_in: string | null;
  check_out: string | null;
}

export interface CreateSalesInvoiceItem {
  item_code: string;
  qty: number;
  rate: number;
  warehouse: string;
}

export interface ISalesInvoiceParams {
  // customer: string;
  // warehouse: string;
  items: CreateSalesInvoiceItem[];
}

// types/warehouse.ts

export interface WarehouseStock {
  warehouse_id: string;
  store_id: string;
  store_name: string;
  actual_qty: number;
}

export interface RGetWarehousesWithStock {
  message: {
    success: boolean;
    data: {
      employee: string;
      item_code: string;
      warehouses: WarehouseStock[];
    };
  };
}

export interface SalesInvoice {
  invoice_id: string;
  currency: string;
  docstatus: number;
  posting_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  grand_total: number;
  outstanding_amount: number;
  item_count: number;
  is_paid: boolean;
  is_return: number;
  status: string;
}

export interface SalesInvoiceListData {
  pagination: Pagination;
  sales_invoices: SalesInvoice[];
}
export interface SalesInvoiceListMessage {
  success: boolean;
  data: SalesInvoiceListData;
}
export interface RSalesInvoiceList {
  message: SalesInvoiceListMessage;
}

//Invoice Detail
export interface InvoiceDetails {
  company: string;
  invoice_id: string;
  currency: string;
  docstatus: number;
  status: string;
  posting_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  selling_price_list: string;
  is_return: number;
  owner: string;
  creation: string; // timestamp
  modified: string; // timestamp
}

// Invoice item
export interface InvoiceItem {
  item_code: string;
  item_name: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  discount_percentage: number;
  discount_amount: number;
  uom: string;
  warehouse: string;
}

// Totals
export interface InvoiceTotals {
  total_qty: number;
  total: number;
  net_total: number;
  grand_total: number;
  rounded_total: number;
  outstanding_amount: number;
  paid_amount: number;
  total_taxes_and_charges: number;
}
export interface InvoiceData {
  invoice_details: InvoiceDetails;
  items: InvoiceItem[];
  payments: any[]; // 🔹 can be replaced with a proper type if structure is known
  taxes: any[]; // 🔹 same here
  totals: InvoiceTotals;
}
export interface GetInvoiceDetailsResponse {
  message: {
    success: boolean;

    data: InvoiceData;
  };
}

export interface RApproverNamw {
  message: {
    success: boolean;
    employee_number: string;
    employee_name: string;
    approver_employee_no: string;
    approver_name: string;
  };
}

// Attendance History
export interface RAttendanceHistory {
  message: AttendanceHistoryData;
}

/* ---------- Data ---------- */
export interface PromoterAttendanceRecord {
  attendance_date: string; // YYYY-MM-DD
  employee_name: string;
  in_time: string; // YYYY-MM-DD HH:mm:ss.SSSSSS
  out_time: string; // YYYY-MM-DD HH:mm:ss.SSSSSS
  name: string; // Attendance ID
  status: string;
  working_hours: number; // hours (can be 0)
}

export interface AttendanceHistoryData {
  success: boolean;
  employee: string;
  employee_name: string;
  pagination: AttendancePagination;
  records: PromoterAttendanceRecord[];
  summary: {
    Absent: Number;
    Present: Number;
  };
}

/* ---------- Pagination ---------- */

export interface AttendancePagination {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
}

/* ---------- Record ---------- */

// export interface AttendanceRecord {
//   name: string; // log_id
//   attendance_date: string; // YYYY-MM-DD
//   status: 'Checked In' | 'Checked Out' | string;
//   store: string;
//   store_name: string;
//   checkin_time: string; // time string
//   checkout_time: string | null; // nullable for active sessions
//   working_hours: number | null; // hours in decimal
// }

//Visibility claim
export type IVisivilityClaim = {
  store: string;
  collection_amount: number;
  payment_type: 'Cash' | 'Upi' | 'Bank';
  price_difference_amount: number;
  damage_claim: number;
  do_submit: boolean;
  image: {
    mime: string;
    data: string;
  };
};
export interface RVisibilityClaimsList {
  message: {
    success: boolean;
    data: {
      visibility_claims: VisibilityClaim[];
      pagination: Pagination;
    };
  };
}
export interface VisibilityClaim {
  claim_id: string;
  employee: string;
  employee_name: string;
  date: string; // YYYY-MM-DD
  store: string;
  collection_amount: number;
  payment_type: 'Cash' | 'Upi' | 'Bank';
  price_difference_amount: number;
  damage_claim: number;
  visibility_image: string; // file path
  store_image: string;
  docstatus: 0 | 1 | 2; // Draft | Submitted | Cancelled
}

//City
export type ICity = {
  data: {
    city_name: string;
    state: string;
    // is_metro_or_hills: number;
  };
};

//Location
export interface PjpRecord {
  name: string;
}
export interface PjpData {
  enabled: boolean;
  has_pjp_today: boolean;
  pjp_count: number;
  pjp_records: PjpRecord[];
}
export type RLocationTracker = {
  message: {
    success: boolean;
    data: PjpData;
  };
};

export type LocationPayload = {
  latitude: number;
  longitude: number;
  data: {
    document_name: string;
    is_overnight_outstation_journey?: number;
  };
};

// ─── ASM Dashboard Types ─────────────────────────────────────────────────────

export interface AsmOverview {
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
}

export interface AsmKeyMetrics {
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
  store_created_success: number;
  store_created: number;
}

export interface AsmStorePlanning {
  planned: number;
  visited: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

export interface AsmBusinessGenerated {
  total_orders: number;
  draft_orders: number;
  order_value: number;
  orders_delivered: number;
  orders_pending: number;
  delivery_rate: number;
  avg_order_value: number;
}

export interface AsmOrderStatus {
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
}

export interface AsmTeamMember {
  employee_id: string;
  employee_name: string;
  initials: string;
  role: 'SO' | 'ISR';
  designation: string;
  reports_to: string;
  attendance_status: 'Present' | 'Absent';
  check_in_time: string | null;
  check_out_time: string | null;
  outlets_planned: number;
  outlets_visited: number;
  outlets_completed: number;
  outlets_pending: number;
  completion_rate: number;
  orders: number;
  order_value: number;
  orders_delivered: number;
  orders_pending: number;
  avg_order_size?: number;
  conversion_rate?: number;
}

export interface AsmDashboardMessage {
  success: boolean;
  date: string;
  to_date?: string;
  is_range?: boolean;
  formatted_date: string;
  current_time: string;
  role_code: string;
  asm_overview: AsmOverview;
  key_metrics: AsmKeyMetrics;
  store_planning: AsmStorePlanning;
  business_generated: AsmBusinessGenerated;
  order_status: AsmOrderStatus[];
  team_performance: AsmTeamMember[];
}

export interface AsmDashboardResponse {
  message: AsmDashboardMessage;
}

export interface AsmDashboardParams {
  date?: string; // format: 'YYYY-MM-DD'
  from_date?: string; // format: 'YYYY-MM-DD'
  to_date?: string; // format: 'YYYY-MM-DD'
  employee: string; // format: 'HR-EMP-XXXXX'
}

type AsmAttendanceRecord = {
  employee_id: string;
  employee_name: string;
  initials: string;
  designation: string;
  role: string;
  total_working_days: number;
  days_present: number;
  days_absent: number;
  attendance_rate: number;
};

type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  attendance_rate: number;
};

type AttendancePeriod = {
  filter_type: 'month' | 'month_range' | 'date_range';
  month?: number;
  year?: number;
  from: string;
  to: string;
};

export type AsmAttendanceResponse = {
  success: boolean;
  period: AttendancePeriod;
  summary: AttendanceSummary;
  records: AsmAttendanceRecord[];
};

// ─── Target vs Achievement — Types ───────────────────────────────────────────

export type TargetSource = 'personal' | 'global';

// ── API 1: GET — Fetch Employee Targets ─────────────────────────────────────

export interface IGetEmployeeTargetsParams {
  month: number; // 1–12
  year: number; // e.g. 2026
}

export interface RGetEmployeeTargets {
  message: {
    sales_target: number;
    ddn_target: number;
    source: TargetSource;
    record: string | null;
    period: string; // "YYYY-MM"
  };
}

// ── API 2: POST — Save / Update Targets ─────────────────────────────────────

export interface ISetEmployeeTargets {
  sales_target: number;
  ddn_target: number;
  month: number; // 1–12
  year: number; // e.g. 2026
}

export interface RSetEmployeeTargets {
  message: {
    status: 'ok';
    year: number;
    month: number;
  };
}

// ── API 3: POST — SO Stats ───────────────────────────────────────────────────

export interface ISoStatsParams {
  from_date: string; // "YYYY-MM-DD"
  to_date: string; // "YYYY-MM-DD"
}

export interface SoByStatus {
  state: string; // e.g. "Approved"
  count: number;
  value: number;
}

export interface RGetSoStats {
  message: {
    count: number;
    value: number; // total SO value (₹)
    unique_stores: number;
    by_status: SoByStatus[];
  };
}

// ── API 4: POST — DDN Stats ──────────────────────────────────────────────────

export interface IDdnStatsParams {
  from_date: string;
  to_date: string;
  zone?: string;
  store?: string;
}

export interface DdnByStatus {
  state: string; // e.g. "Delivered", "Approved"
  count: number;
  value: number;
}

export interface RGetDdnStats {
  message: {
    count: number;
    value: number; // total DDN value (₹)
    unique_stores: number;
    unique_distributors: number;
    fill_rate: number; // (del_qty / ord_qty) × 100
    by_status: DdnByStatus[];
  };
}

// ── Computed summary (use in components) ────────────────────────────────────

export interface TargetAchievementSummary {
  sales_target: number;
  ddn_target: number;
  so_achievement: number;
  ddn_achievement: number;
  so_pct: number; // (so_achievement / sales_target) × 100
  ddn_pct: number; // (ddn_achievement / ddn_target) × 100
  so_variance: number; // +ve = on track, -ve = lagging
  ddn_variance: number;
}

// ── Distributor Delivery Note (DDN) Types ──────────────────────────────────────

export interface IDistributorDeliveryNote {
  delivery_note_id: string;
  distributor: string;
  distributor_name: string;
  posting_date: string;
  grand_total: number;
  ordered_qty: number;
  delivered_qty: number;
  status: string;
  workflow_state: string;
  store_warehouse: string;
  store_name: string;
  invoice_no: string | null;
  purchase_order: string | null;
  item_count: number;
  docstatus: number;
  store_image?: string;
}

export interface RDistributorDeliveryNoteList {
  message: {
    success: boolean;
    data: {
      delivery_notes: IDistributorDeliveryNote[];
      pagination: PaginationInfo;
    };
  };
}

export type DeliveryNoteResponse = {
  message: {
    success: boolean;
    data: {
      order_details: OrderDetails;
      items: Item[];
      totals: DDNTotals;
    };
  };
};

export type OrderDetails = {
  delivery_note_id: string;
  distributor: string;
  distributor_name: string;
  posting_date: string;
  grand_total: number;
  ordered_qty: number;
  delivered_qty: number;
  status: string;
  workflow_state: string;
  store_warehouse: string;
  store_name: string;
  invoice_no: string;
  purchase_order: string;
  docstatus: number;
  item_count: number;
  store_image?: string;
};

export type Item = {
  item_code: string;
  item_name: string;
  description: string;
  ordered_qty: number;
  delivered_qty: number;
  rate: number;
  amount: number;
  uom: string;
  stock_uom: string;
  received_qty: number;
  returned_qty: number;
  billed_amt: number;
  warehouse?: string;
};

export type DDNTotals = {
  total: number;
  grand_total: number;
};

// ─── STOCK MANAGEMENT TYPES ──────────────────────────────────────────────────

export interface StockItem {
  name: string;
  item_name: string;
  available_qty: number;
}

export interface RGetStockItems {
  message: StockItem[];
}

export interface ICreateStockBalance {
  store: string;
  /** Must be JSON.stringify'd array of { item_code, quantity, batch } */
  items: string;
}

export interface RCreateStockBalance {
  message: boolean;
}

export interface StockDashboardItem {
  item_code: string;
  item_name: string;
  item_rate: number;
  /** ERP warehouse stock at start of month (from first DWSB entry) */
  opening_stock: number;
  /** Live ERP stock from Bin right now */
  current_stock: number;
  /** Units consumed from ERP this month (opening - current) */
  mtd_territory: number;
  /** What employee physically counted today. null = not yet counted */
  physical_count: number | null;
  /** Gap between shelf and ERP (physical - current). null = not yet counted */
  stock_difference: number | null;
  new_orders: number | null;
  /** true when opening>0 OR current>0 OR item appears in any previous SO */
  has_history: boolean;
}

export interface RGetStoreStockStatus {
  message: {
    status: string;
    /** Present only when no warehouse is configured for the store */
    warning?: string;
    /**
     * Items with stock history for this store.
     * USE THIS to auto-populate rows in the SO items table when store is selected.
     */
    previous_items: StockDashboardItem[];
    /**
     * All items available for this store (includes previous_items + new items).
     * USE THIS as the item picker / dropdown when SO adds a new item.
     */
    all_items: StockDashboardItem[];
  };
}

// ─── NON-PJP ACTIVITY ATTENDANCE TYPES ───────────────────────────────────────

export interface ActivityLocation {
  location_name: string;
  latitude: number;
  longitude: number;
  address: string;
  activity_type: string;
  remarks: string;
  location_image?: string;
  needs_location_image?: boolean;
  employee: string;
  employee_name: string;
}

export interface RGetActivityLocations {
  message: {
    success: boolean;
    data: ActivityLocation[];
  };
}

export interface ICreateActivityLocation {
  location_name: string;
  latitude: number;
  longitude: number;
  address?: string;
  activity_type?: string;
  remarks?: string;
  location_image?: {
    mime: string;
    data: string;
  };
}

export interface RCreateActivityLocation {
  message: {
    success: boolean;
    message: string;
    data: {
      name: string;
      owner: string;
      creation: string;
      modified: string;
      modified_by: string;
      docstatus: number;
      idx: number;
      location_name: string;
      latitude: number;
      longitude: number;
      address: string;
      activity_type?: string;
      location_image?: string;
      doctype: string;
    };
  };
}

export interface IActivityCheckIn {
  activity_location: string;
  /** Comma-separated "lat,lng" string e.g. "28.7041,77.1025" */
  current_location: string;
  image: {
    mime: string;
    /** Base64-encoded image data */
    data: string;
  };
  activity_type?: string;
  remarks?: string;
  location_image?: {
    mime: string;
    data: string;
  };
}

export interface RActivityCheckIn {
  message: {
    success: boolean;
    message: string;
    data?: {
      log_id: string;
      activity_location: string;
      activity_type: string;
      employee: string;
      image_url: string;
      location_image?: string;
      needs_location_image?: boolean;
      check_in_time: string;
      remarks: string;
    };
  }
}

export interface IActivityCheckOut {
  /** log_id returned from activityCheckIn */
  log_id: string;
  /** Comma-separated "lat,lng" string */
  current_location: string;
}

export interface RActivityCheckOut {
  message: {
    success: boolean;
    message: string;
  };
}
export interface RGetActivityCheckInStatus {
  message: {
    success: boolean;
    is_checked_in: boolean;
    log_id: string | null;
    activity_location: string | null;
    check_in_time: string | null;
    image_url: string | null;
    location_image?: string | null;
    needs_location_image?: boolean;
    activity_type: string | null;
    remarks: string | null;
  };
}

// Weekly Off
export interface IMarkDayOff {
  date: string; // YYYY-MM-DD
}
export interface RMarkDayOff {
  message: { success: boolean; message: string; document_name?: string };
}
export interface ICancelDayOff {
  date: string;
}
export interface RCancelDayOff {
  message: { success: boolean; message: string };
}
export interface RGetDayOffs {
  message: {
    success: boolean;
    data: { name: string; attendance_date: string; status: string }[];
  };
}

// ─── PJP WORKFLOW TYPES ───────────────────────────────────────────────────────

export type PjpWorkflowState =
  | 'WEEKLY_OFF'
  | 'NO_PJP'
  | 'NO_STORES'
  | 'READY_TO_START'
  | 'PJP_RUNNING_IDLE'
  | 'STORE_CHECKED_IN'
  | 'ACTIVITY_CHECKED_IN'
  | 'COMPLETED'
  | 'REQUEST_LATE_CHECKIN';

export type PjpAllowedAction =
  | 'CREATE_PJP'
  | 'START_ACTIVITY_CHECKIN'
  | 'MARK_WEEKLY_OFF'
  | 'ADD_STORES'
  | 'MODIFY_PJP'
  | 'CANCEL_PJP'
  | 'START_PJP'
  | 'EDIT_STORES'
  | 'DELETE_STORE'
  | 'START_STORE_CHECKIN'
  | 'END_PJP'
  | 'END_STORE_CHECKOUT'
  | 'CREATE_ORDER'
  | 'MODIFY_ORDER'
  | 'MARK_ACTIVITY'
  | 'END_ACTIVITY_CHECKOUT'
  | 'VIEW_REPORTS'
  | 'REQUEST_LATE_CHECKIN';

export interface RGetPjpNextAction {
  message: {
    status: string;
    data: pjpWorkflowDataType;
  };
}
export interface LateCheckInInfo {
  allowed: boolean;
  message: string;
}
export interface pjpWorkflowDataType {
  date: string;
  current_state: PjpWorkflowState;
  allowed_actions: PjpAllowedAction[];
  message: string;
  pjp_document_name: string | null;
  active_store_id: string | null;
  active_activity_id: string | null;
  pjp_data: PjpDataResponse;
  late_checkin_info: LateCheckInInfo;
  live_working_hours?: LiveWorkingHours;
}
export type PjpDataResponse = {
  pjp_details: {
    name: string;
    running_status: string;
    start_location: string | null;
    end_location: string | null;
    travel_distance: number;
    is_overnight_outstation_journey?: number;
  };
  stores: {
    store: string;
    store_name: string;
    status: string;
    store_image?: string;
  }[];
  store_times: {
    store: string;
    check_in_time: string;
    check_out_time: string | null;
    activity_marked: number;
  }[];
  activities: any[];
  planned_activities: {
    activity_type: string;
    activity_location: string;
    location_image?: string;
    needs_location_image?: boolean;
  }[];
  non_store_activities: {
    name: string;
    activity_location: string;
    activity_type: string;
    check_in_time: string;
    check_out_time: string | null;
    image: string;
    location_image?: string;
    needs_location_image?: boolean;
  }[];
};

// ─── TARGET MANAGEMENT TYPES (NEW APIs) ──────────────────────────────────────

// API: get_team_employees
export interface TeamEmployee {
  name: string; // Employee ID e.g. "HR-EMP-00021"
  employee_name: string;
  user_id: string; // e.g. "uttam.dubey@example.com"
}

export interface RGetTeamEmployees {
  message: TeamEmployee[];
}

// API: get_employee_targets (with employee param)
export interface IGetEmployeeTargetsWithEmpParams {
  month?: number; // 1–12, defaults to current month
  year?: number; // e.g. 2026, defaults to current year
  employee: string; // e.g. "HR-EMP-00021" or "ALL"
}

export interface RGetEmployeeTargetsWithEmp {
  message: {
    sales_target: number;
    ddn_target: number;
    source: 'personal' | 'global';
    record: string | null; // null when no personal target exists
    period: string; // "YYYY-MM"
  };
}

// API: set_employee_targets (with employee param — manager setting for subordinate)
export interface ISetEmployeeTargetsWithEmp {
  sales_target: number;
  ddn_target: number;
  month?: number; // 1–12, defaults to current month
  year?: number; // e.g. 2026, defaults to current year
  employee: string; // specific employee ID or "ALL"
}

export interface RSetEmployeeTargetsWithEmp {
  message:
  | { status: 'ok'; year: number; month: number } // single employee
  | { status: 'ok'; updated: number; year: number; month: number }; // "ALL"
}

// API: get_target_achievement_summary
export interface IGetTargetAchievementSummaryParams {
  from_date?: string; // "YYYY-MM-DD", defaults to 1st of current month
  to_date?: string; // "YYYY-MM-DD", defaults to end of current month
  employee?: string; // specific ID, "ALL", or omit for team aggregate
}

export interface RGetTargetAchievementSummary {
  message: {
    sales_target: number;
    ddn_target: number;
    so_value: number;
    so_count: number;
    ddn_value: number;
    ddn_count: number;
    is_admin: boolean;
    scope: 'global' | 'team';
    from_date: string;
    to_date: string;
    target_month: number;
    target_year: number;
    months_counted: number;
  };
}



// ─── LATE CHECK-IN APPROVAL TYPES ────────────────────────────────────────────
// Add these interfaces to your existing baseType.ts

// API 1 — Request Late Check-In Permission (Employee Action)
// Employee calls this when blocked from checking in after 10:30 AM.
export interface IRequestLateCheckin {
  reason?: string; // Optional: brief reason for being late (e.g., "Heavy traffic")
}

export interface RRequestLateCheckin {
  message: {
    success: boolean;
    message: string;
    // success → "Late check-in approval request sent to your manager successfully."
    // error  → "You have reached the maximum allowed late check-ins (3) for this month."
    // error  → "You already have a Pending request for today."
  };
}

// API 2 — Get Pending Approvals (Manager Action)
// Single record returned in the data array.
export interface LateCheckinApprovalRecord {
  name: string;          // Request ID, e.g. "LCA-2026-06-0001"
  employee: string;      // Employee ID, e.g. "EMP-0012"
  employee_name: string; // e.g. "John Doe"
  date: string;          // YYYY-MM-DD
  reason: string;
  creation: string;      // ISO datetime string, e.g. "2026-06-15 10:45:12.123456"
}

export interface RGetPendingLateApprovals {
  message: {
    success: boolean;
    data: LateCheckinApprovalRecord[];
  };
}

// API 3 — Approve or Reject Request (Manager Action)
export interface IApproveRejectLateCheckin {
  request_id: string;       // The `name` field from GET response, e.g. "LCA-2026-06-0001"
  status: 'Approved' | 'Rejected';
  manager_remarks?: string; // Optional feedback from manager
}

export interface RApproveRejectLateCheckin {
  message: {
    success: boolean;
    message: string;
    // success → "Request successfully approved."
    // error  → "Status must be Approved or Rejected"
  };
}
export interface LiveWorkingHours {
  date: string;
  working_hours_decimal: number;
  working_hours_formatted: string;
  first_check_in: string | null;
  last_check_out: string | null;
  is_active: boolean;
  current_store_elapsed_minutes: number;
  stores_visited: number;
  activities_done: number;
  pjp_status: string;
}

export interface IAddActivityLocationImage {
  activity_location: string;
  location_image: {
    mime: string;
    data: string;
  };
}

export interface RAddActivityLocationImage {
  success: boolean;
  message: string;
  data: {
    activity_location: string;
    location_image: string;
  };
}
export interface RGetLiveWorkingHours { success: boolean; data: LiveWorkingHours; }

// ─── PROMOTER NEW API TYPES ─────────────────────────────────────────────────

// Screen 1 — Home
export interface IPromoterHomeData {
  employee: {
    name: string;
    employee_name: string;
    initials: string;
    image: string | null;
    designation: string;
  };
  attendance: {
    available: boolean;
    checked_in: boolean;
    checked_out: boolean;
    checkin_time: string | null;
    checkout_time: string | null;
    store: string;
    store_name: string;
    shift_start: string;
    shift_end: string;
    can_check_in: boolean;
    can_check_out: boolean;
  };
  target: {
    available: boolean;
    sales_target: number;
    achieved_value: number;
    percentage: number;
    ddn_target: number;
    ddn_value: number;
    order_count: number;
  };
  alerts: {
    below_norm_sku_count: number;
  };
  unread_notifications: number;
  date: string;
}

export interface RPromoterHome {
  message: {
    success: boolean;
    data: IPromoterHomeData;
  };
}

// Screen 2 — Attendance Status (split day additions)
export interface StoreTodayEntry {
  store: string;
  store_name: string;
  start_time: string;
  end_time: string;
  is_secondary: boolean;
  is_floater: boolean;
  log_id: string | null;
  checked_in: boolean;
  checked_out: boolean;
  checkin_time: string | null;
  checkout_time: string | null;
  working_hours: number;
  can_check_in: boolean;
  can_check_out: boolean;
}

export interface AttendanceNextStore {
  store: string;
  store_name: string;
  start_time: string;
  end_time: string;
}

export interface IAttendanceStatusData {
  checked_in: boolean;
  checked_out: boolean;
  actions: {
    can_check_in: boolean;
    can_check_out: boolean;
    next_store: AttendanceNextStore | null;
    open_store: AttendanceNextStore | null;
  };
  blocked_reason: string | null;
  attendance_record: {
    name: string;
    status: string;
    docstatus: number;
  } | null;
  attendance_date: string;
  employee: string;
  employee_name: string;
  shift_info: {
    store: string;
    store_name: string;
    start_time: string;
    end_time: string;
    is_floater: number;
  };
  available_stores: {
    store_id: string;
    store_name: string;
    map_location: string;
    is_primary: boolean;
  }[];
  log_id: string | null;
  status: string;
  checkin_time: string | null;
  checkout_time: string | null;
  working_hours: number;
  checkin_location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  checkin_selfie: string | null;
  checkin_records: {
    check_in: { name: string; time: string } | null;
    check_out: { name: string; time: string } | null;
  };
  is_split_today: boolean;
  total_working_hours: number;
  stores_today: StoreTodayEntry[];
}

// Screen 2 — Validate Attendance
export interface IValidateAttendanceResponse {
  message: {
    success: boolean;
    data: {
      can_check_in: boolean;
      blocked_reason: string | null;
    };
  };
}

// Screen 2 — Upload Attendance Image
export interface IUploadAttendanceImage {
  image: {
    mime: string;
    data: string;
  };
}

export interface RUploadAttendanceImage {
  message: {
    success: boolean;
    data: {
      image_url: string;
    };
  };
}

// Screen 3 — Monthly Roster
export interface RosterSlot {
  store: string;
  store_name: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  is_secondary: boolean;
  is_floater: boolean;
}

export interface RosterDay {
  date: string;
  shift_label: string;
  is_split: boolean;
  slots: RosterSlot[];
}

export interface RMonthlyRoster {
  message: {
    success: boolean;
    data: {
      employee: string;
      employee_name: string;
      aon_days: number;
      month: number;
      year: number;
      period_start: string;
      period_end: string;
      total_days_assigned: number;
      days: RosterDay[];
    };
  };
}

// Screen 6 — Sales Order Master Data
export interface ISalesOrderMasterData {
  stores: {
    store_id: string;
    store_name: string;
    warehouse: string;
  }[];
  items: {
    item_code: string;
    item_name: string;
    rate: number;
  }[];
  distributors: {
    distributor_id: string;
    distributor_name: string;
  }[];
  terms: {
    name: string;
  }[];
}

export interface RSalesOrderMasterData {
  message: {
    success: boolean;
    data: ISalesOrderMasterData;
  };
}

// Screen 8 — Activity Categories
export interface IActivityCategories {
  activity_types: string[];
  categories: {
    name: string;
    category_name: string;
  }[];
}

export interface RActivityCategories {
  message: {
    success: boolean;
    data: IActivityCategories;
  };
}

// Screen 8 — Upload Store Activity
export interface IUploadStoreActivity {
  activity_type: string; // "Own" | "Competitors"
  activities_category: string;
  remark?: string;
  store?: string;
  images: {
    mime: string;
    data: string;
  }[];
}

export interface RUploadStoreActivity {
  message: {
    success: boolean;
    data: {
      activity_id: string;
      store: string;
      store_name: string;
      activity_type: string;
      date_and_time: string;
      image_count: number;
    };
  };
}

// Screen 8 — Get Store Activities
export interface StoreActivity {
  name: string;
  activity_type: string;
  store: string;
  store_name: string;
  activities_category: string;
  date_and_time: string;
  remark: string;
  images: string[];
}

export interface IGetStoreActivitiesParams {
  activity_type?: string;
  store?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

export interface RStoreActivities {
  message: {
    success: boolean;
    data: {
      activities: StoreActivity[];
      pagination: {
        page: number;
        page_size: number;
        total_records: number;
        total_pages: number;
      };
    };
  };
}

// Screen 9 — Product Feedback
export interface ICreateProductFeedback {
  type: string; // "Own" | "Competitor"
  remarks?: string;
  image?: {
    mime: string;
    data: string;
  };
}

export interface RCreateProductFeedback {
  message: {
    success: boolean;
    data: {
      feedback_id: string;
      type: string;
      remarks: string;
      image: string | null;
      time: string;
    };
  };
}

export interface ProductFeedbackItem {
  name: string;
  type: string;
  remarks: string;
  image: string | null;
  time: string;
}

export interface RProductFeedbackList {
  message: {
    success: boolean;
    data: {
      feedbacks: ProductFeedbackItem[];
      pagination: {
        page: number;
        page_size: number;
        total_records: number;
        total_pages: number;
      };
    };
  };
}

// Master Data — Assigned Stores
export interface AssignedStore {
  store_id: string;
  store_name: string;
  city: string | null;
  state: string | null;
  store_category?: string;
  store_type?: string;
}

export interface RAssignedStores {
  message: {
    success: boolean;
    data: {
      employee: string;
      total_stores: number;
      stores: AssignedStore[];
    };
  };
}

// Master Data — Shift Assignment Details
export interface IShiftAssignmentDetails {
  employee: string;
  employee_name: string;
  today: {
    store: string;
    store_name: string;
    start_time: string;
    end_time: string;
    shift_type: string;
    is_floater: number;
  } | null;
  floater_stores: {
    store_id: string;
    store_name: string;
  }[];
}

export interface RShiftAssignmentDetails {
  message: {
    success: boolean;
    data: IShiftAssignmentDetails;
  };
}

// Master Data — Items for Promoter
export interface PromoterItem {
  item_code: string;
  item_name: string;
  rate: number;
  item_group: string;
}

export interface RItemsForPromoter {
  message: {
    success: boolean;
    data: {
      items: PromoterItem[];
      pagination: {
        page: number;
        page_size: number;
        total_records: number;
        total_pages: number;
      };
    };
  };
}

// Master Data — Item Stock in Warehouses
export interface ItemWarehouseStock {
  warehouse_id: string;
  warehouse_name: string;
  actual_qty: number;
  store_id: string;
  store_name: string;
}

export interface RItemStockInWarehouses {
  message: {
    success: boolean;
    data: {
      item_code: string;
      warehouses: ItemWarehouseStock[];
    };
  };
}

// Profile
export interface IProfileData {
  employee_id: string;
  employee_name: string;
  designation: string;
  department: string;
  mobile: string;
  email: string;
  image: string | null;
  reports_to: string;
  reports_to_name: string;
}

export interface RProfileData {
  message: {
    success: boolean;
    data: IProfileData;
  };
}

// ─── SUPERVISOR API TYPES ───────────────────────────────────────────────────

export interface SupervisorPromoterShift {
  shift_assignment: string;
  store: string;
  store_name: string;
  shift_type: string;
  start_time: string;
  end_time: string;
}

export interface SupervisorPromoterAttendance {
  checked_in: boolean;
  checked_out: boolean;
  store: string;
  checkin_time: string | null;
  checkout_time: string | null;
  stores_done: number;
  stores_assigned: number;
}

export interface SupervisorAttendanceByStore {
  log_id: string;
  store_name: string;
  status: string;
  checkin_time: string | null;
  checkout_time: string | null;
}

export interface SupervisorPromoter {
  employee: string;
  employee_name: string;
  user_id: string;
  mobile: string;
  is_posted_today: boolean;
  is_split_today: boolean;
  today_shifts: SupervisorPromoterShift[];
  attendance: SupervisorPromoterAttendance;
  attendance_by_store: SupervisorAttendanceByStore[];
}

export interface RSupervisorMyPromoters {
  message: {
    success: boolean;
    data: {
      date: string;
      total: number;
      posted_today: number;
      checked_in: number;
      not_checked_in: number;
      promoters: SupervisorPromoter[];
    };
  };
}

// Supervisor — Promoter Day Detail
export interface SupervisorStockTakeRow {
  item: string;
  warehouse_balance: string;
  manual_balance_entry: string;
  mismatched_qty: number;
}

export interface SupervisorOrderRow {
  name: string;
  total_qty: number;
  grand_total: number;
  workflow_state: string;
}

export interface SupervisorActivityRow {
  activity_type: string;
  activities_category: string;
  store_name: string;
  images: string[];
}

export interface IPromoterDayData {
  employee_name: string;
  date: string;
  attendance_by_store: SupervisorAttendanceByStore[];
  total_working_hours: number;
  attendance: {
    name: string;
    status: string;
    store_name: string;
    checkin_time: string;
    checkout_time: string;
    working_hours: number;
    checkin_selfie: string;
  };
  stock_take: {
    items_counted: number;
    rows: SupervisorStockTakeRow[];
  };
  orders: {
    count: number;
    total_value: number;
    rows: SupervisorOrderRow[];
  };
  activities: {
    count: number;
    rows: SupervisorActivityRow[];
  };
}

export interface RSupervisorPromoterDay {
  message: {
    success: boolean;
    data: IPromoterDayData;
  };
}

// Supervisor — Promoter Roster
export interface SupervisorRosterAssignment {
  name: string;
  store: string;
  store_name: string;
  shift_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  docstatus: number;
  floater: number;
  custom_secondary_shift: number;
  floater_stores: {
    store: string;
    store_name: string;
  }[];
}

export interface RSupervisorPromoterRoster {
  message: {
    success: boolean;
    data: {
      employee_name: string;
      aon_days: number;
      month: number;
      year: number;
      assignments: SupervisorRosterAssignment[];
    };
  };
}

// Supervisor — Assignment Options
export interface AssignmentStoreOption {
  store_id: string;
  store_name: string;
  city: string | null;
  state: string | null;
  start_time: string;
  end_time: string;
}

export interface RAssignmentOptions {
  message: {
    success: boolean;
    data: {
      stores: AssignmentStoreOption[];
      shift_types: {
        name: string;
      }[];
      pagination: {
        page: number;
        page_size: number;
        total_records: number;
        total_pages: number;
      };
    };
  };
}

// Supervisor — Create Shift Assignment
export interface ICreateShiftAssignment {
  employee: string;
  store: string;
  shift_type?: string;
  start_date: string;
  end_date: string;
  is_secondary?: number;
  floater?: number;
  floater_stores?: string[];
}

export interface RCreateShiftAssignment {
  message: {
    success: boolean;
    data: {
      shift_assignment: string;
      store_name: string;
      start_time: string;
      end_time: string;
    };
  };
}

// Supervisor — Cancel Shift Assignment
export interface ICancelShiftAssignment {
  shift_assignment: string;
}

export interface RCancelShiftAssignment {
  message: {
    success: boolean;
    message: string;
  };
}
