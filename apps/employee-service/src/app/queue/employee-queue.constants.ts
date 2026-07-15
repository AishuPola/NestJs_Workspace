// apps/employee-service/src/app/queue/employee-queue.constants.ts

export const EMPLOYEE_QUEUE = 'employee-queue';

export const EmpJobName = {
  ONBOARDING: 'employee-onboarding',
  DEPT_SYNC: 'employee-dept-sync',
} as const;

export interface OnboardingJobData {
  employeeId: number;
  email: string;
  firstName: string;
  deptId: number;
  traceId: string;
}

export interface DeptSyncJobData {
  employeeId: number;
  deptId: number;
  traceId: string;
}
