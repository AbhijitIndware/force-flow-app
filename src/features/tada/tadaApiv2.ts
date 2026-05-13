import { createApi } from '@reduxjs/toolkit/query/react';
import { createSlice } from '@reduxjs/toolkit';
import {
  AddExpenseRowPayload,
  ApproveClaimPayload,
  ApproveClaimResponse,
  ApproveVisibilityClaimPayload,
  CancelVisibilityClaimPayload,
  CreateExpenseDraftPayload,
  CreateVisibilityClaimPayload,
  DeleteExpenseRowPayload,
  ExpenseClaim,
  ExpenseRow,
  ApproverInfo,
  GetApproverByEmployeeNoPayload,
  GetExpenseRowsByEmployeeParams,
  GetVisibilityClaimsParams,
  PendingApprovalClaim,
  RejectClaimPayload,
  RejectClaimResponse,
  RejectVisibilityClaimPayload,
  SubmitExpenseClaimPayload,
  SubmitExpenseClaimResponse,
  SubmitVisibilityClaimPayload,
  TadaApiResponse,
  TadaSummary,
  VisibilityClaim,
  ExpenseClaimResponse,
  VisibilityClaimsResponse,
  ApproverExpenseClaimResponse,
} from '../../types/tadaType';
import { baseQueryForTadaWithAuthGuard } from '../utility';

// ─── API Definition ────────────────────────────────────────────────────────

const EXPENSE_BASE =
  '/method/salesforce_management.mobile_app_apis.expense_apis.expense_api';
const VISIBILITY_BASE =
  '/method/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api';
const SOFTSENS_BASE = '/method/softsens.api';

export const tadaApiV2 = createApi({
  reducerPath: 'tadaApiV2',
  baseQuery: baseQueryForTadaWithAuthGuard,
  tagTypes: ['Expense', 'Approval', 'VisibilityClaim', 'Dashboard'],
  endpoints: builder => ({
    // ── Phase 1: Employee Endpoints (Claim Submission Flow) ────────────────

    // 1. Get My Expense Claims
    getMyExpenseClaims: builder.query<
      TadaApiResponse<ExpenseClaim[]>,
      { month?: number; year?: number; status?: string }
    >({
      query: ({ month, year, status } = {}) => ({
        url: `${EXPENSE_BASE}.get_my_expense_claims`,
        method: 'GET',
        params: {
          ...(month !== undefined && { month }),
          ...(year !== undefined && { year }),
          ...(status && { status }),
        },
      }),
      providesTags: ['Expense'],
    }),

    // 2. Create Expense Draft
    createExpenseDraft: builder.mutation<
      TadaApiResponse<{ claim_id: string }>,
      CreateExpenseDraftPayload
    >({
      query: body => ({
        url: `${EXPENSE_BASE}.create_expense_draft`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),

    // 3. Add Expense Row (with integrated receipt upload via image: { mime, data })
    addExpenseRow: builder.mutation<
      TadaApiResponse<{
        row_id: string;
        sanctioned_amount: number;
        file_url?: string;
      }>,
      AddExpenseRowPayload
    >({
      query: body => ({
        url: `${EXPENSE_BASE}.add_expense_row`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),

    // 4. Delete Expense Row (Draft claims only — returns NOT_DRAFT if already submitted)
    deleteExpenseRow: builder.mutation<
      TadaApiResponse<{ claim_id: string; rows_remaining: number }>,
      DeleteExpenseRowPayload
    >({
      query: body => ({
        url: `${EXPENSE_BASE}.delete_expense_row`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),

    // 5. Submit Expense Claim
    // IMPORTANT: On validation failure the API returns status: "error" with
    // error_code: "VALIDATION_ERROR". Always show response.message to the user as a popup.
    submitExpenseClaim: builder.mutation<
      TadaApiResponse<SubmitExpenseClaimResponse>,
      SubmitExpenseClaimPayload
    >({
      query: body => ({
        url: `${EXPENSE_BASE}.submit_expense_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense', 'Approval'],
    }),

    // ── Phase 2: Manager Approvals ─────────────────────────────────────────

    // 6. Get Pending Approvals
    getPendingApprovals: builder.query<
      TadaApiResponse<PendingApprovalClaim[]>,
      { month?: number; year?: number }
    >({
      query: ({ month, year } = {}) => ({
        url: `${EXPENSE_BASE}.get_pending_approvals`,
        method: 'GET',
        params: {
          ...(month !== undefined && { month }),
          ...(year !== undefined && { year }),
        },
      }),
      providesTags: ['Approval'],
    }),
    getApprovalList: builder.query<
      ApproverExpenseClaimResponse,
      { month?: number; year?: number, status: string }
    >({
      query: ({ month, year, status }) => ({
        url: `${EXPENSE_BASE}.get_claim_list`,
        method: 'GET',
        params: {
          ...(month !== undefined && { month }),
          ...(year !== undefined && { year }),
          ...(status !== undefined && { status }),
        },
      }),
      providesTags: ['Approval'],
    }),

    // 7. Get Claim Detail
    getClaimDetail: builder.query<ExpenseClaimResponse, { claim_id: string }>({
      query: ({ claim_id }) => ({
        url: `${EXPENSE_BASE}.get_claim_detail`,
        method: 'GET',
        params: { claim_id },
      }),
      providesTags: ['Approval', 'Expense'],
    }),

    // 8. Approve Claim
    // Backend validates that the caller is the employee's expense_approver or reports_to manager.
    approveClaim: builder.mutation<
      TadaApiResponse<ApproveClaimResponse>,
      ApproveClaimPayload
    >({
      query: body => ({
        url: `${EXPENSE_BASE}.approve_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Approval', 'Expense'],
    }),

    // 9. Reject Claim
    // Reason is saved as a permanent comment on the document for audit trail.
    rejectClaim: builder.mutation<
      TadaApiResponse<RejectClaimResponse>,
      RejectClaimPayload
    >({
      query: body => ({
        url: `${EXPENSE_BASE}.reject_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Approval', 'Expense'],
    }),

    // ── Phase 3: Dashboard ─────────────────────────────────────────────────

    // 10. Get My TADA Summary
    getMyTadaSummary: builder.query<
      TadaApiResponse<TadaSummary>,
      { month: number; year: number }
    >({
      query: ({ month, year }) => ({
        url: `${EXPENSE_BASE}.get_my_tada_summary`,
        method: 'GET',
        params: { month, year },
      }),
      providesTags: ['Dashboard'],
    }),

    // ── Phase 4: Visibility Claims (Store Level Claims) ────────────────────

    getMyVisibilityClaims: builder.query<
      VisibilityClaimsResponse,
      GetVisibilityClaimsParams | void
    >({
      query: params => ({
        url: `${VISIBILITY_BASE}.get_visibility_claims_list`,
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['VisibilityClaim'],
    }),

    // 12. Get Visibility Claim Details
    getVisibilityClaimDetails: builder.query<
      TadaApiResponse<VisibilityClaim>,
      { claim_id: string }
    >({
      query: ({ claim_id }) => ({
        url: `${VISIBILITY_BASE}.get_visibility_claim_details`,
        method: 'GET',
        params: { claim_id },
      }),
      providesTags: ['VisibilityClaim'],
    }),

    // 13. Create Visibility Claim
    createVisibilityClaim: builder.mutation<
      TadaApiResponse<{ claim_id: string }>,
      CreateVisibilityClaimPayload
    >({
      query: body => ({
        url: `${VISIBILITY_BASE}.create_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // 14. Submit Visibility Claim
    submitVisibilityClaim: builder.mutation<
      TadaApiResponse<void>,
      SubmitVisibilityClaimPayload
    >({
      query: body => ({
        url: `${VISIBILITY_BASE}.submit_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // 15. Approve Visibility Claim (Manager only)
    // Same expense_approver → reports_to security check as expense approve.
    approveVisibilityClaim: builder.mutation<
      TadaApiResponse<void>,
      ApproveVisibilityClaimPayload
    >({
      query: body => ({
        url: `${VISIBILITY_BASE}.approve_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // 16. Reject Visibility Claim (Manager only)
    // Reason saved as comment. Sets approval_status = "Rejected".
    rejectVisibilityClaim: builder.mutation<
      TadaApiResponse<void>,
      RejectVisibilityClaimPayload
    >({
      query: body => ({
        url: `${VISIBILITY_BASE}.reject_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // 17. Cancel Visibility Claim (owner only)
    cancelVisibilityClaim: builder.mutation<
      TadaApiResponse<void>,
      CancelVisibilityClaimPayload
    >({
      query: body => ({
        url: `${VISIBILITY_BASE}.cancel_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // ── Phase 5: Softsens Utility APIs ────────────────────────────────────

    // 18. Get Approver By Employee Number
    // approver_source tells whether approver came from expense_approver or reports_to.
    getApproverByEmployeeNo: builder.query<
      ApproverInfo,
      GetApproverByEmployeeNoPayload
    >({
      query: ({ employee_number }) => ({
        url: `${SOFTSENS_BASE}.get_approver_by_employee_no`,
        method: 'GET',
        params: { employee_number },
      }),
    }),

    // 19. Get Expense Rows By Employee
    // Access restricted to self, authorized manager, or System Manager.
    getExpenseRowsByEmployee: builder.query<
      { data: ExpenseRow[] },
      GetExpenseRowsByEmployeeParams
    >({
      query: ({ employee, date_from, date_to, limit }) => ({
        url: `${SOFTSENS_BASE}.get_expense_rows_by_employee`,
        method: 'GET',
        params: {
          employee,
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
          ...(limit !== undefined && { limit }),
        },
      }),
    }),
  }),
});

export const {
  // Phase 1 – Employee (Claim Submission Flow)
  useGetMyExpenseClaimsQuery,
  useCreateExpenseDraftMutation,
  useAddExpenseRowMutation,
  useDeleteExpenseRowMutation,
  useSubmitExpenseClaimMutation,

  // Phase 2 – Manager Approvals
  useGetPendingApprovalsQuery,
  useGetClaimDetailQuery,
  useApproveClaimMutation,
  useRejectClaimMutation,
  useGetApprovalListQuery,

  // Phase 3 – Dashboard
  useGetMyTadaSummaryQuery,

  // Phase 4 – Visibility Claims
  useGetMyVisibilityClaimsQuery,
  useGetVisibilityClaimDetailsQuery,
  useCreateVisibilityClaimMutation,
  useSubmitVisibilityClaimMutation,
  useApproveVisibilityClaimMutation,
  useRejectVisibilityClaimMutation,
  useCancelVisibilityClaimMutation,

  // Phase 5 – Softsens Utility APIs
  useGetApproverByEmployeeNoQuery,
  useGetExpenseRowsByEmployeeQuery,
} = tadaApiV2;

// ─── Slice ─────────────────────────────────────────────────────────────────

interface TadaState {
  loading: boolean;
  error: boolean;
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
}

const initialState: TadaState = {
  loading: false,
  error: false,
  status: 'idle',
};

export const tadaV2Slice = createSlice({
  name: 'tadaV2Slice',
  initialState,
  reducers: {},
  extraReducers: _builder => { },
});

export const { } = tadaV2Slice.actions;
export default tadaV2Slice.reducer;
