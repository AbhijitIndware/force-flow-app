// Leave (leave_apis.leave_api): Casual / Privilege / Without Pay.
// Flow: reporting manager first (in the app), then HR (final approval, on
// the website only).

export const LEAVE_TYPES = [
  'Casual Leave',
  'Privilege Leave',
  'Leave Without Pay',
] as const;

/** Leave is only for these designations. */
export const LEAVE_DESIGNATIONS = [
  'RSM',
  'ASM',
  'ASE',
  'Area Sales Executive',
  'Sales Officer',
  'ISR',
];

export const canUseLeave = (designation?: string | null) =>
  !!designation && LEAVE_DESIGNATIONS.includes(designation);

/** Where a leave is in the approval chain. */
export type LeaveStage = 'With Manager' | 'With HR' | 'Done';

export interface LeaveBalance {
  leave_type: string;
  /** What is left today. */
  balance: number;
  /** Days in leave still waiting for approval. */
  pending: number;
  /** balance less pending: the main number to show. */
  available: number;
  /** This year's credit. */
  credited: number;
  /** Approved days this year. */
  taken: number;
}

export interface RGetLeaveBalances {
  message: {
    success?: boolean;
    message?: string;
    data?: {
      balances?: LeaveBalance[];
      leave_types?: string[];
    };
  };
}

export interface IApplyLeave {
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  is_half_day: 0 | 1;
  half_day_date?: string;
}

export interface RLeaveAction {
  message: {
    success: boolean;
    message: string;
    data?: any;
  };
}

export interface LeaveApplication {
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days?: number;
  half_day?: 0 | 1;
  half_day_date?: string | null;
  reason?: string;
  description?: string;
  /** Open / Approved / Rejected / Cancelled */
  status: string;
  stage?: LeaveStage;
  manager_remarks?: string | null;
  hr_remarks?: string | null;
  note?: string | null;
  posting_date?: string;
}

export interface RGetMyLeaves {
  message: {
    success?: boolean;
    message?: string;
    data?: LeaveApplication[] | { leaves?: LeaveApplication[] };
  };
}

export interface PendingLeaveApproval {
  name: string;
  employee?: string;
  employee_name: string;
  designation?: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  reason?: string;
  stage?: LeaveStage;
  note?: string | null;
  manager_remarks?: string | null;
}

export interface RGetPendingLeaveApprovals {
  message: {
    success?: boolean;
    message?: string;
    data?: PendingLeaveApproval[] | { leaves?: PendingLeaveApproval[] };
  };
}

/** Rows may come back as a bare list or wrapped as { leaves: [...] }. */
export function leaveRows<T>(data: T[] | { leaves?: T[] } | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.leaves ?? [];
}

/**
 * Leave the user can decide in the app: the manager step only, never their
 * own. HR gives the final approval on the website, so rows at the HR step
 * (sent to HR users by the same endpoint) are left out of the app.
 */
export function managerStepRows(
  data: PendingLeaveApproval[] | { leaves?: PendingLeaveApproval[] } | undefined,
  empId?: string | null,
): PendingLeaveApproval[] {
  return leaveRows(data).filter(
    r => r.stage !== 'With HR' && (!r.employee || r.employee !== empId),
  );
}
