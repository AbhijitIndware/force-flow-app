// ─── Response Types ────────────────────────────────────────────────────────

export interface TadaApiResponse<T = any> {
  message: {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    error_code?: string;
    success: boolean;
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
  workflow_state: string;
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

export interface ExpenseClaimResponse {
  message: {
    status: string;
    message: string;
    data: ExpenseClaimData;
  };
}

export interface ExpenseClaimData {
  claim_id: string;
  employee: string;
  employee_name: string;
  posting_date: string;
  workflow_state: string;
  approval_status: string;
  docstatus: number;
  pjp_store_id: string;
  travel_start_date: string;
  travel_end_date: string;
  from_city: string;
  to_city: string;
  distance_km: number;
  travel_type: string;
  city_class: string;
  is_self_arranged_stay: number;
  expense_approver: string | null;
  authorized_approver: string;
  authorized_approver_name: string | null;
  total_claimed_amount: number;
  total_sanctioned_amount: number;
  expenses: Expense[];
  attachments: string[];
}

export interface Expense {
  row_id: string;
  expense_type: string;
  amount: number;
  sanctioned_amount: number;
  date: string;
  description?: string;
  ta_mode?: string | null;
  is_local?: number | null;
  ta_km?: number | null;
  ta_rail_class?: string | null;
  telecom_bill_month?: string | null;
  mobile_number?: string | null;
  incidental_bill_month?: string | null;
  receipt_url?: string | null;
}

export interface Attachment {
  // Add fields when available
}

// ─── Phase 2 – Manager Approval ────────────────────────────────────────────

export interface PendingApprovalClaim {
  name: string;
  employee: string;
  employee_name: string;
  posting_date: string;
  workflow_state: string;
  approval_status: string;
  total_claimed_amount: number;
  total_sanctioned_amount: number;
}

export interface ApproverExpenseClaimResponse {
  message: {
    status: string;
    message: string;
    data: ApproverExpenseClaimsData;
  };
}

export interface ExpenseClaimsData {
  expense_claims: ExpenseClaim[];
  pagination: Pagination;
}

export interface ApproverExpenseClaimsData {
  expense_claims: ApproverExpenseClaim[];
  pagination: Pagination;
}

export interface ApproverExpenseClaim {
  name: string;
  employee: string;
  employee_name: string;
  posting_date: string;
  workflow_state: string;
  approval_status: string;
  custom_travel_start_date: string;
  custom_travel_end_date: string;
  total_claimed_amount: number;
  total_sanctioned_amount: number;
  custom_travel_type: string;
  custom_city_class: string;
  custom_is_self_arranged_stay: number;
  custom_manager_approval_promotional: number;
  custom_manager_approval_for_extra: number;
  custom_manager_approval_bike_over_100: number;
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
  status_summary: {
    Draft: { count: number; amount: number };
    'Pending Approval': { count: number; amount: number };
    Approved: { count: number; amount: number };
    Rejected: { count: number; amount: number };
  };
  recent_claims: Array<{
    claim_id: string;
    date: string;
    amount: number;
    workflow_state: string;
    approval_status: string;
  }>;
}

// ─── Phase 4 – Visibility Claims ──────────────────────────────────────────
export interface VisibilityClaimsResponse {
  message: {
    success: boolean;
    data: VisibilityClaimsData;
  };
}

export interface VisibilityClaimsData {
  visibility_claims: VisibilityClaim[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
}
export interface VisibilityClaim {
  claim_id: string;
  employee: string;
  employee_name: string;
  date: string;
  store: string;
  store_name: string;
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
  // is_self_arranged_stay?: 0 | 1;
}

export interface ImagePayload {
  mime: string; // e.g. "image/jpeg"
  data: string; // base64 encoded string (without data URI prefix)
}

export interface AddExpenseRowPayload {
  claim_id: string;
  expense_type:
  | 'Daily Allowance'
  | 'TA – Auto'
  | 'TA – Cab'
  | 'TA – Bus'
  | 'TA – Rail'
  | 'TA – Bike (Petrol)'
  | 'TA – Local Travel'
  | 'Lodging / Boarding / Hotel'
  | 'Food / Meals'
  | 'Mobile Bill'
  | 'Courier'
  | 'Xerox';
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  /** Receipt image/PDF. Attach as { mime, data } — stored as private file linked to the row */
  image?: ImagePayload;

  // Conditional parameters based on expense_type
  /** Required when expense_type is "TA – Rail" */
  ta_rail_class?: 'Sleeper' | 'Non-AC Chair Car' | 'III-AC' | 'AC Chair Car';
  /** Distance traveled in KM (optional if amount is entered manually) */
  ta_km?: number;
  /** 1 = local travel, 0 = outstation */
  is_local?: 0 | 1;

  // Mobile Bill specific
  /** Required when expense_type is "Mobile Bill". Format: YYYY-MM-DD */
  telecom_bill_month?: string;
  /** Required when expense_type is "Mobile Bill" */
  mobile_number?: string;

  // Incidental specific (Courier, Xerox)
  /** Required when expense_type is "Courier" or "Xerox". Format: YYYY-MM-DD */
  incidental_bill_month?: string;
  is_self_arranged_stay?: number
}

export interface DeleteExpenseRowPayload {
  claim_id: string;
  row_id: string;
}

export interface SubmitExpenseClaimPayload {
  claim_id: string;
}

export interface SubmitExpenseClaimResponse {
  claim_id: string;
  status: string;
  docstatus: number;
  workflow_state: string;
}

export interface ApproveClaimPayload {
  claim_id: string;
  bike_over_100: number,
  extra: number,
  promotional: number
}

export interface ApproveClaimResponse {
  claim_id: string;
  approval_status: string;
  docstatus: number;
  workflow_state: string;
}

export interface RejectClaimPayload {
  claim_id: string;
  /** Saved as a permanent comment for audit trail */
  reason?: string;
}

export interface RejectClaimResponse {
  claim_id: string;
  approval_status: string;
  workflow_state: string;
}

// Phase 4

export interface StandardQueryParams {
  month?: number;
  year?: number;
  page?: number;
  page_size?: number;
  status?: string;
}

export interface GetVisibilityClaimsParams extends StandardQueryParams {
  /** Pass "manager" to see the team's claims */
  view?: 'manager';
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
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
  image?: ImagePayload | null;
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
  date_to?: string; // YYYY-MM-DD
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
