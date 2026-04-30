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
export interface PurchaseCounts {
    total: number;
    draft: number;
    submitted: number;
    status_wise: Record<string, number>;
}

export interface DnCounts {
    total: number;
    draft: number;
    submitted: number;
    status_wise: Record<string, number>;
}

export interface RDashboardCounts {
    message: {
        sales_counts: Record<string, any>;
        purchase_counts: PurchaseCounts;
        dn_counts: DnCounts;
    };
}

// Purchase Orders
export interface PurchaseOrderItem {
    order_id: string;
    distributor_name: string;
    transaction_date: string;
    grand_total: number;
    status: string;
}

export interface RPurchaseOrderList {
    status: string;
    data: PurchaseOrderItem[];
    pagination: Record<string, any>;
}

// Delivery Notes
export interface DeliveryNoteItem {
    name: string;
    purchase_order: string;
    invoice_no: string;
    date: string;
    workflow_state: string;
}

export interface RDeliveryNoteList {
    status: string;
    data: DeliveryNoteItem[];
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
    success: boolean;
    message: string;
    delivery_note: string;
}