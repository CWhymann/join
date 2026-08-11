export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  color: string;
  created_at: string;
}

export type NewContact = Omit<Contact, 'id' | 'created_at'>;
export type ContactUpdate = Partial<NewContact>;
export type ContactInput = Omit<NewContact, 'color'> & { color?: string };
export interface ContactGroup {
  letter: string;
  contacts: Contact[];
}
