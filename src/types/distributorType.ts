
export interface Pagination {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_more: boolean;
}
// ---------- Types ----------

export interface DistributorInfo {
    name: string;
    distributor_name: string;
    distributor_group: string;
    distributor_code: string;
    mobile: string;
    email: string;
    zone: string;
    state: string;
    city: string;
    reports_to: string;
    designation: string;
}

export interface RLoginResponse {
    success: boolean;
    user: Record<string, any>;
    employee: Record<string, any>;
    distributor: DistributorInfo;
}

export interface ILoginRequest {
    usr: string;
    pwd: string;
}

// Dashboard Counts
export interface DashboardStatsData {
    overall: OverallStats;
    sales_orders: OrderStats;
    purchase_orders: OrderStats;
    delivery_notes: OrderStats;
    filters_applied: FiltersApplied;
    timestamp: string; // datetime string
}

export interface OverallStats {
    total_orders: number;
    total_sales_orders: number;
    total_purchase_orders: number;
    total_delivery_notes: number;
    total_draft: number;
    total_submitted: number;
    total_cancelled: number;
}

export interface OrderStats {
    total: number;
    draft: number;
    submitted: number;
    cancelled: number;
    status_wise: Record<string, number>; // dynamic keys like "Pending"
}

export interface FiltersApplied {
    from_date: string; // ISO date
    to_date: string;   // ISO date
    date_filtered: boolean;
}

export interface RDashboardCounts {
    message: {
        success: boolean;
        data: DashboardStatsData;
    };
}

// Purchase Orders
export interface PurchaseOrder {
    order_id: string;
    supplier: string;
    supplier_name: string;
    distributor: string;
    distributor_name: string;
    transaction_date: string; // ISO date string
    schedule_date: string;    // ISO date string
    grand_total: number;
    status: string;
    per_received: number;
    per_billed: number;
    item_count: number;
    linked_sales_orders: string[];
    linked_so_count: number;
    docstatus: number;
    workflow_state: string
}


export interface RPurchaseOrderList {
    message: {
        success: boolean;
        data: {
            purchase_orders: PurchaseOrder[];
            pagination: Pagination;
            total_count: number;
            has_more: boolean;
        };
    }
}

// Delivery Notes
export interface DeliveryNoteItem {
    delivery_note_id: string;
    distributor: string;
    distributor_name: string;
    posting_date: string; // ISO date string
    grand_total: number;
    ordered_qty: number;
    delivered_qty: number;
    status: string;
    workflow_state: string;
    store_warehouse: string;
    store_name: string;
    invoice_no: string;
    purchase_order: string;
    item_count: number;
    docstatus: number;
}

export interface RDeliveryNoteList {
    message: {
        success: boolean;
        data: {
            delivery_notes: DeliveryNoteItem[];
            pagination: Pagination;
        };
    }
}

// Approve & Create DDN
export interface DeliveredItem {
    item_code: string;
    del_qty: number;
}

export interface IApproveAndCreateDDNRequest {
    purchase_order_id: string;
    invoice_no: string;
    delivered_items?: DeliveredItem[];
}

export interface RApproveAndCreateDDN {
    message: {
        success: boolean;
        message: string;
        delivery_note: string;
    }
}

export interface RPendingCounts {
    success: boolean;
    data: {
        pending_sales_orders: number;
        pending_purchase_orders: number;
        pending_delivery_notes: number;
        total_pending: number;
    };
}
