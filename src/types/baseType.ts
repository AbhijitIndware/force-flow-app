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

export type IAddPjpPayload = {
  data: {
    date: string;
    employee: string;
    stores: StoreEntry[];
  };
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
