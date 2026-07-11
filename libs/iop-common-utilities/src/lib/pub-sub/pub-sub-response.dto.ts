// libs/iop-common-utilities/src/lib/pub-sub/pub-sub-response.dto.ts

// ─── What is this file? ─────────────────────────────────────────
// Typed shapes for every event your system can publish.
// Same principle as IopErrorDto from Week 4 — a contract.
// Both the publisher (API service) and the subscriber
// (notification-service) import these types so they always
// agree on what's inside an event payload.

export interface BaseEvent {
  // Every event carries a traceId so logs in both services
  // can be linked — same cross-service tracing from Week 4,
  // now carried inside the message body instead of an HTTP header
  traceId: string;
  timestamp: string;
}

export interface UserRegisteredEvent extends BaseEvent {
  type: 'user.registered';
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface UserLoggedInEvent extends BaseEvent {
  type: 'user.loggedin';
  userId: number;
  email: string;
}

// Union type — any valid event your system can publish
export type IopEvent = UserRegisteredEvent | UserLoggedInEvent;

// Event names as constants — same reason as ErrorCode from Week 4
// prevents typos at compile time
export const EventName = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.loggedin',
} as const;
