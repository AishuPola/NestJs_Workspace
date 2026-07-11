// apps/api/src/app/queue/notification-queue.constants.ts

// ─── Queue and job name constants ─────────────────────────────
// Defined once here — imported by module, processor, and anywhere
// that adds jobs to the queue. Same principle as TRACE_ID_HEADER
// and EXCHANGE_NAME — never use magic strings in two places.

export const NOTIFICATION_QUEUE = 'notification-queue';

export const JobName = {
  SEND_WELCOME: 'send-welcome-notification',
  SEND_LOGIN_ALERT: 'send-login-alert',
} as const;

export type JobNameType = (typeof JobName)[keyof typeof JobName];

// Job data shapes — typed so processor and producer agree
export interface WelcomeJobData {
  userId: number;
  email: string;
  username: string;
  traceId: string;
}

export interface LoginAlertJobData {
  userId: number;
  email: string;
  traceId: string;
}
