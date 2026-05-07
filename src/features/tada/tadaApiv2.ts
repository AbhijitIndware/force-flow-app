import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl } from '../apiBaseUrl';
import { createSlice } from '@reduxjs/toolkit';
import { AddExpenseRowPayload, ApproveClaimPayload, ApproveVisibilityClaimPayload, ClaimDetail, CreateExpenseDraftPayload, CreateVisibilityClaimPayload, ExpenseClaim, PendingApprovalClaim, SubmitExpenseClaimPayload, SubmitVisibilityClaimPayload, TadaApiResponse, TadaSummary, UploadClaimAttachmentPayload } from '../../types/tadaType';

const API_KEY = '92131bbf2e5bbe6';
const API_SECRET = 'fb1ce2ebc69ffb0';

const encodedAuth = btoa(`${API_KEY}:${API_SECRET}`);

// ─── API Definition ────────────────────────────────────────────────────────

const BASE_PATH = '/api/method';

export const tadaApiV2 = createApi({
  reducerPath: 'tadaApiV2',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: headers => {
      headers.set('Authorization', `Basic ${encodedAuth}`);
      return headers;
    },
  }),
  tagTypes: ['Expense', 'Approval', 'VisibilityClaim', 'Dashboard'],
  endpoints: builder => ({
    // ── Phase 1: Employee Endpoints (Claim Submission Flow) ────────────────

    // 1. Get My Expense Claims
    getMyExpenseClaims: builder.query<
      TadaApiResponse<ExpenseClaim[]>,
      { month?: number; year?: number; status?: string }
    >({
      query: ({ month, year, status } = {}) => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.get_my_expense_claims`,
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
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.create_expense_draft`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),

    // 3. Add Expense Row
    addExpenseRow: builder.mutation<
      TadaApiResponse<{ row_id: string; sanctioned_amount: number }>,
      AddExpenseRowPayload
    >({
      query: body => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.add_expense_row`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),

    // 4. Upload Claim Attachment
    // uploadClaimAttachment: builder.mutation<
    //   TadaApiResponse<{ file_url: string }>,
    //   UploadClaimAttachmentPayload
    // >({
    //   query: body => ({
    //     url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.upload_claim_attachment`,
    //     method: 'POST',
    //     body,
    //   }),
    //   invalidatesTags: ['Expense'],
    // }),

    // 5. Submit Expense Claim
    submitExpenseClaim: builder.mutation<
      TadaApiResponse<{ status: string }>,
      SubmitExpenseClaimPayload
    >({
      query: body => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.submit_expense_claim`,
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
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.get_pending_approvals`,
        method: 'GET',
        params: {
          ...(month !== undefined && { month }),
          ...(year !== undefined && { year }),
        },
      }),
      providesTags: ['Approval'],
    }),

    // 7. Get Claim Detail
    getClaimDetail: builder.query<
      TadaApiResponse<ClaimDetail>,
      { claim_id: string }
    >({
      query: ({ claim_id }) => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.get_claim_detail`,
        method: 'GET',
        params: { claim_id },
      }),
      providesTags: ['Approval', 'Expense'],
    }),

    // 8. Approve Claim
    approveClaim: builder.mutation<
      TadaApiResponse<void>,
      ApproveClaimPayload
    >({
      query: body => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.approve_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Approval', 'Expense'],
    }),

    // ── Phase 3: Dashboard ─────────────────────────────────────────────────

    // 9. Get My TADA Summary
    getMyTadaSummary: builder.query<
      TadaApiResponse<TadaSummary>,
      { month: number; year: number }
    >({
      query: ({ month, year }) => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.expense_apis.expense_api.get_my_tada_summary`,
        method: 'GET',
        params: { month, year },
      }),
      providesTags: ['Dashboard'],
    }),

    // ── Phase 4: Visibility Claims (Store Level Claims) ────────────────────

    // 10. Create Visibility Claim
    createVisibilityClaim: builder.mutation<
      TadaApiResponse<{ claim_id: string }>,
      CreateVisibilityClaimPayload
    >({
      query: body => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.create_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // 11. Submit Visibility Claim
    submitVisibilityClaim: builder.mutation<
      TadaApiResponse<void>,
      SubmitVisibilityClaimPayload
    >({
      query: body => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.submit_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),

    // 12. Approve Visibility Claim (Manager Only)
    approveVisibilityClaim: builder.mutation<
      TadaApiResponse<void>,
      ApproveVisibilityClaimPayload
    >({
      query: body => ({
        url: `${BASE_PATH}/salesforce_management.mobile_app_apis.visibility_claim.visibility_claim_api.approve_visibility_claim`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VisibilityClaim'],
    }),
  }),
});

export const {
  // Phase 1 – Employee (Claim Submission Flow)
  useGetMyExpenseClaimsQuery,
  useCreateExpenseDraftMutation,
  useAddExpenseRowMutation,
  // useUploadClaimAttachmentMutation,
  useSubmitExpenseClaimMutation,

  // Phase 2 – Manager Approvals
  useGetPendingApprovalsQuery,
  useGetClaimDetailQuery,
  useApproveClaimMutation,

  // Phase 3 – Dashboard
  useGetMyTadaSummaryQuery,

  // Phase 4 – Visibility Claims
  useCreateVisibilityClaimMutation,
  useSubmitVisibilityClaimMutation,
  useApproveVisibilityClaimMutation,
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