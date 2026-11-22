export interface User {
  id: string;
  name: string;
  email: string;
}

/** What a user may see of the other users: enough to pick a recipient, not their email. */
export type UserSummary = Pick<User, 'id' | 'name'>;

export function toSummary({ id, name }: User): UserSummary {
  return { id, name };
}
