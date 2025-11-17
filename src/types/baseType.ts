import {ApiResponse, PaginationInfo} from './Navigation';

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
    store_type: string;
    store_category: string;
    zone: string;
    state: string;
    map_location: string;
    start_time: string; // Format: "HH:mm:ss"
    end_time: string; // Format: "HH:mm:ss"
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
  };
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
export type IMarkActivity = {
  store: string;
  activity_type: {activity_type: string}[];
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
  };
  items: {
    item_code: string;
    item_name: string;
    description: string;
    qty: number;
    rate: number;
    amount: number;
    uom: string;
    warehouse: string;
    delivery_date: string; // ISO Date string
  }[];
  store_details: {
    warehouse_name: string;
    store: string;
    distributor: string;
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

// 🔹 Update type
export type IUpdateSalesOrder = Pick<
  IAddSalesOrder,
  'transaction_date' | 'delivery_date' | 'items'
> & {
  order_id: string;
  items: (Omit<IAddSalesOrder['items'][number], 'delivery_date'> & {
    delivery_date?: string; // make it optional
  })[];
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
  order_id: string;
  supplier: string;
  supplier_name: string;
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
export interface POOrderData {
  order_details: POOrderDetails;
  items: POOrderItem[];
  linked_sales_orders: {
    sales_order: string;
    customer_name: string;
    grand_total: number;
  }[]; // can replace `any` with correct type if structure is known
  totals: Totals;
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
  status: string;
  message: string;
  stores: {
    store: string;
    store_name: string;
    store_category: string;
  }[];
  pjp_daily_store_doc: string;
  pjp_date: string; // ISO date string "2025-08-29"
  pjp_emp: string;
};
export interface RPjpDailyById {
  message: PjpDailyStoreDetail;
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
}

export interface Store {
  store_id: string;
  store_name: string;
  store_category: string;
  city: string | null;
  state: string | null;
  warehouse: Warehouse[];
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

export type IAddPjpPayload = {
  data: {
    date: string;
    employee: string;
    stores: StoreEntry[];
  };
};

export type IUpdatePjpPayload = {
  data: {
    date: string;
    employee: string;
    stores: StoreEntry[];
    document_name: string;
  };
};

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
  status: 'completed';
  message: string; // e.g., "PJP copied successfully to employee EMP-00123."
  source_pjp: string; // e.g., "PJP-DS-2024-00001"
  new_pjp: string; // e.g., "PJP-DS-2024-00045"
  target_employee: string; // e.g., "EMP-00123"
  date: string; // e.g., "2024-11-13"
  stores_count: number; // e.g., 15
  success?: any[];
  errors?: any[];
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
