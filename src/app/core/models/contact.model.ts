/** A contact row as stored in Supabase. */
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

/** Fields needed to create a contact; id, timestamp and flags are set by the database. */
export type NewContact = Omit<Contact, 'id' | 'created_at' | 'is_protected' | 'user_id'> & {
  user_id?: string;
};
/** Subset of contact fields to overwrite on update. */
export type ContactUpdate = Partial<NewContact>;
/** Contact values from the form; the avatar color is filled in when missing. */
export type ContactInput = Omit<NewContact, 'color'> & { color?: string };
/** Contacts sharing the same initial letter in the contact list. */
export interface ContactGroup {
  letter: string;
  contacts: Contact[];
}
