// ─── Response Types ────────────────────────────────────────────────────────

export interface TadaApiResponse<T = any> {
    message: {
        status: 'success' | 'error';
        message?: string;
        data?: T;
        error_code?: string;
    };
}

// ─── Common Error Codes ────────────────────────────────────────────────────

export type TadaErrorCode =
    | 'NO_EMPLOYEE'
    | 'UNAUTHORIZED'
    | 'VALIDATION_ERROR'
    | 'NOT_DRAFT'
    | 'NOT_SUBMITTED'
    | 'INVALID_STATUS'
    | 'NOT_FOUND'
    | 'SERVER_ERROR';

// ─── Phase 1 – Employee Endpoints (Claim Submission Flow) ──────────────────

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
    approval_status: string;
    expense_approver: string;           // Added per docs
    authorized_approver: string;        // Added per docs
    authorized_approver_name: string;   // Added per docs
    total_claimed_amount: number;
    total_sanctioned_amount: number;
    expenses: ClaimDetailExpense[];
    attachments: string[];
}

// ─── Phase 2 – Manager Approval ────────────────────────────────────────────

export interface PendingApprovalClaim {
    name: string;
    employee: string;
    employee_name: string;
    posting_date: string;
    approval_status: string;
    total_claimed_amount: number;
    total_sanctioned_amount: number;
}

// ─── Phase 3 – Dashboard ───────────────────────────────────────────────────

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

// ─── Phase 4 – Visibility Claims ──────────────────────────────────────────

export interface VisibilityClaim {
    claim_id: string;
    employee: string;
    date: string;
    store: string;
    collection_amount: number;
    payment_type: string;
    price_difference_amount: number;
    damage_claim: number;
    visibility_image: string;
    approval_status: string;
    expense_approver: string;
    authorized_approver: string;
    authorized_approver_name: string;
    docstatus: number;
    attachments: string[];
}

// ─── Phase 5 – Softsens Utility APIs ──────────────────────────────────────

export interface ApproverInfo {
    success: boolean;
    employee_number: string;
    employee_name: string;
    approver_employee_no: string;
    approver_name: string;
    /** Indicates whether approver came from 'expense_approver' or 'reports_to' field */
    approver_source: 'expense_approver' | 'reports_to';
}

export interface ExpenseRow {
    claim: string;
    date: string;
    expense_type: string;
    description: string;
    claimed: number;
    sanctioned: number;
}

// ─── Request Payload Types ─────────────────────────────────────────────────

// Phase 1

export interface CreateExpenseDraftPayload {
    pjp_store_id: string;
    from_city?: string;
    to_city?: string;
    /** 1 = self-arranged stay (lower payout caps), 0 = hotel */
    is_self_arranged_stay?: 0 | 1;
}

export interface ImagePayload {
    mime: string; // e.g. "image/jpeg"
    data: string; // base64 encoded string (without data URI prefix)
}

export interface AddExpenseRowPayload {
    claim_id: string;
    expense_type: 'DA' | 'TA' | 'Lodging' | 'Telecom' | 'Incidental';
    amount: number;
    date: string; // YYYY-MM-DD
    description?: string;
    /** Receipt image/PDF. Attach as { mime, data } — stored as private file linked to the row */
    image?: ImagePayload;

    // TA-specific
    /** Required when expense_type is "TA" */
    ta_mode?: 'Bus' | 'Train' | 'Auto' | 'Bike' | 'Flight';
    /** Required when ta_mode is "Train" */
    ta_rail_class?: 'AC 3 Tier' | 'Sleeper' | 'AC Chair Car' | 'Non-AC Chair Car';
    /** 1 = local travel, 0 = outstation */
    is_local?: 0 | 1;

    // Telecom-specific
    /** Required when expense_type is "Telecom". e.g. "April", "May" */
    telecom_bill_month?: string;
    /** Required when expense_type is "Telecom" */
    mobile_number?: string;
}

export interface DeleteExpenseRowPayload {
    claim_id: string;
    row_id: string;
}

export interface SubmitExpenseClaimPayload {
    claim_id: string;
}

// Phase 2

export interface ApproveClaimPayload {
    claim_id: string;
}

export interface RejectClaimPayload {
    claim_id: string;
    /** Saved as a permanent comment for audit trail */
    reason?: string;
}

// Phase 4

export interface GetVisibilityClaimsParams {
    /** Pass "manager" to see the team's claims */
    view?: 'manager';
    status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
    /** Manager view filter — defaults to "Submitted" */
    approval_status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
    page?: number;
    page_size?: number;
    from_date?: string; // YYYY-MM-DD
    to_date?: string;   // YYYY-MM-DD
    store?: string;
    search?: string;
}

export interface CreateVisibilityClaimPayload {
    store: string;
    pjp_store_id: string;
    date?: string; // YYYY-MM-DD, defaults to today
    collection_amount?: number;
    payment_type?: 'Cash' | 'Cheque' | 'Online';
    price_difference_amount?: number;
    damage_claim?: number;
    /** New image to upload */
    image?: ImagePayload;
    /** Existing file URL (fallback if no new image) */
    visibility_image?: string;
    /** true to immediately submit after creation */
    do_submit?: boolean;
}

export interface SubmitVisibilityClaimPayload {
    claim_id: string;
}

export interface ApproveVisibilityClaimPayload {
    claim_id: string;
}

export interface RejectVisibilityClaimPayload {
    claim_id: string;
    /** Saved as comment. Sets approval_status = "Rejected" */
    reason?: string;
}

export interface CancelVisibilityClaimPayload {
    claim_id: string;
    reason?: string;
}

// Phase 5

export interface GetApproverByEmployeeNoPayload {
    employee_number: string;
}

export interface GetExpenseRowsByEmployeeParams {
    employee: string;
    date_from?: string; // YYYY-MM-DD
    date_to?: string;   // YYYY-MM-DD
    limit?: number;
}

// ─── Legacy (kept for compatibility — prefer image?: ImagePayload in AddExpenseRowPayload) ──

/** @deprecated Use ImagePayload inside AddExpenseRowPayload.image instead */
export interface UploadClaimAttachmentPayload {
    claim_id: string;
    row_id?: string;
    filedata: string;
    filename: string;
}