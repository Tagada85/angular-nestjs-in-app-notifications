import type { UserSummary } from '../users/user.js';

export interface Kudos {
  id: string;
  from: UserSummary;
  to: UserSummary;
  message: string;
  sentAt: string;
}
