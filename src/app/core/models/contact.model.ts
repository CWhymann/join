export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  color: string;
  created_at: string;
  is_protected: boolean;
  user_id: string | null;
}

export type NewContact = Omit<Contact, 'id' | 'created_at' | 'is_protected' | 'user_id'> & {
  user_id?: string;
};
export type ContactUpdate = Partial<NewContact>;
export type ContactInput = Omit<NewContact, 'color'> & { color?: string };
export interface ContactGroup {
  letter: string;
  contacts: Contact[];
}
