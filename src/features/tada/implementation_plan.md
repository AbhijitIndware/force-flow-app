# Update TADA UI Components with Pagination and Filters

The goal is to update the 4 TADA list components to use the new standard query parameters and handle the updated paginated response structure.

## Proposed Changes

### [ExpenseComponent](file:///home/abhijit-singha/Documents/Indware/softsens/force-flow-app/src/components/SO/Expense/expense-component.tsx)
- Add `page` and `page_size` to `useGetMyExpenseClaimsQuery`.
- Update data extraction to `data?.message?.data?.expense_claims`.
- Implement basic pagination support (Load More).

### [VisibilityComponent](file:///home/abhijit-singha/Documents/Indware/softsens/force-flow-app/src/components/SO/Visibility/visibility-component.tsx)
- Add `month`, `year`, `page`, `page_size` to `useGetMyVisibilityClaimsQuery`.
- Update data extraction to `data?.message?.data?.visibility_claims`.
- Implement pagination support.

### [ExpenseApprovalListComponent](file:///home/abhijit-singha/Documents/Indware/softsens/force-flow-app/src/components/SO/Expense/expense-approval-list-component.tsx)
- Add `page`, `page_size` to `useGetApprovalListQuery`.
- Update data extraction to `data?.message?.data?.expense_claims`.

### [VisibilityApprovalListComponent](file:///home/abhijit-singha/Documents/Indware/softsens/force-flow-app/src/components/SO/Visibility/visibility-approval-list-component.tsx)
- Change hook to `useGetApproverVisibilityClaimsQuery`.
- Add `month`, `year`, `page`, `page_size` to the query.
- Update data extraction to `data?.message?.data?.visibility_claims`.

## Verification Plan

### Manual Verification
- Check each list to ensure data is correctly displayed.
- Verify that month/year filters work and trigger API calls with new params.
- Test "Load More" functionality if implemented.
