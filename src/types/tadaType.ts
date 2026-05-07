
// ─── Response Types ────────────────────────────────────────────────────────

export interface TadaApiResponse<T = any> {
    message: {
        status: 'success' | 'error';
        message?: string;
        data?: T;
        error_code?: string;
    };
}

// Phase 1 – Employee Endpoints (Claim Submission Flow)

export interface ExpenseClaim {
    name: string;
    posting_date: string;
    approval_status: string;
    custom_travel_start_date: string;
    custom_travel_end_date: string;
    total_claimed_amount: number;
    total_sanctioned_amount: number;
    custom_travel_type: string;
    custom_city_class: string;
}

export interface ClaimDetailExpense {
    row_id: string;
    expense_type: string;
    amount: number;
    sanctioned_amount: number;
    date: string;
    description?: string;
    ta_mode?: string;
}

export interface ClaimDetail {
    claim_id: string;
    employee: string;
    employee_name: string;
    posting_date: string;
    approval_status: string;
    total_claimed_amount: number;
    total_sanctioned_amount: number;
    expenses: ClaimDetailExpense[];
    attachments: string[];
}

// Phase 3 – Dashboard

export interface TadaSummary {
    month: number;
    year: number;
    consumed: {
        DA: number;
        Lodging: number;
        TA: number;
        Telecom: number;
        Incidental: number;
    };
}

// Phase 2 – Manager Approval

export interface PendingApprovalClaim {
    name: string;
    employee: string;
    employee_name: string;
    posting_date: string;
    approval_status: string;
    total_claimed_amount: number;
    total_sanctioned_amount: number;
}

// ─── Request Payload Types ─────────────────────────────────────────────────

export interface CreateExpenseDraftPayload {
    pjp_store_id: string;
    from_city?: string;
    to_city?: string;
    is_self_arranged_stay?: number; // 1 or 0
}

export interface AddExpenseRowPayload {
    claim_id: string;
    expense_type: 'DA' | 'TA' | 'Lodging' | 'Telecom' | 'Incidental';
    amount: number;
    date: string;
    description?: string;
    // TA-specific
    ta_mode?: 'Rail' | 'Bus' | 'Auto' | 'Bike' | 'Cab' | 'Local';
    ta_rail_class?: 'Sleeper' | 'Non-AC Chair Car' | 'III-AC' | 'AC Chair Car';
    is_local?: number; // 1 = local, 0 = outstation
    // Telecom-specific
    telecom_bill_month?: string; // YYYY-MM-DD
    mobile_number?: string;
    filedata: string; // base64 e.g. data:image/jpeg;base64,...
    filename: string;
}

export interface UploadClaimAttachmentPayload {
    claim_id: string;
    row_id?: string;
    filedata: string; // base64 e.g. data:image/jpeg;base64,...
    filename: string;
}

export interface SubmitExpenseClaimPayload {
    claim_id: string;
}

export interface ApproveClaimPayload {
    claim_id: string;
}

// Phase 4 – Visibility Claims

export interface CreateVisibilityClaimPayload {
    store: string;
    pjp_store_id: string;
    date?: string;
    collection_amount?: number;
    payment_type?: 'Cash' | 'Bank' | 'Upi';
    price_difference_amount?: number;
    damage_claim?: number;
    image?: { mime: string; data: string };
    visibility_image?: string;
    do_submit?: boolean;
}

export interface SubmitVisibilityClaimPayload {
    claim_id: string;
}

export interface ApproveVisibilityClaimPayload {
    claim_id: string;
}
