export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
}

/** What the billing team needs to pick a client: no email. */
export type ClientSummary = Pick<Client, 'id' | 'name' | 'company'>;

export function toSummary({ id, name, company }: Client): ClientSummary {
  return { id, name, company };
}
