export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserSummary = Pick<User, 'id' | 'name'>;

export interface SendKudosRequest {
  fromUserId: string;
  toUserId: string;
  message: string;
}

export interface Kudos {
  id: string;
  from: UserSummary;
  to: UserSummary;
  message: string;
  sentAt: string;
}
