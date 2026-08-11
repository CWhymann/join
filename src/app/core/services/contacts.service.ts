import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Contact,
  ContactGroup,
  ContactInput,
  ContactUpdate,
  NewContact,
} from '../models/contact.model';
import { createAvatarColor } from '../utils/avatar.utils';
import { groupContactsByLetter, sortContactsByName } from '../utils/contact-list.utils';
import { SupabaseService } from './supabase.service';

const TABLE = 'contacts';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly contactsSignal = signal<Contact[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly contacts = computed(() => sortContactsByName(this.contactsSignal()));
  readonly groups = computed<ContactGroup[]>(() => groupContactsByLetter(this.contacts()));
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  async loadContacts(): Promise<void> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).select('*');
    if (error) {
      this.failRequest(error.message);
      return;
    }
    this.contactsSignal.set((data ?? []) as Contact[]);
    this.loadingSignal.set(false);
  }

  async addContact(input: ContactInput): Promise<Contact | null> {
    this.startRequest();
    const contact: NewContact = { ...input, color: input.color ?? this.nextAvatarColor() };
    const { data, error } = await this.supabase.from(TABLE).insert(contact).select().single();
    if (error) {
      this.failRequest(error.message);
      return null;
    }
    await this.loadContacts();
    return data as Contact;
  }

  async updateContact(id: string, changes: ContactUpdate): Promise<Contact | null> {
    this.startRequest();
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      this.failRequest(error.message);
      return null;
    }
    await this.loadContacts();
    return data as Contact;
  }

  async deleteContact(id: string): Promise<boolean> {
    this.startRequest();
    const { error } = await this.supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      this.failRequest(error.message);
      return false;
    }
    await this.loadContacts();
    return true;
  }

  findById(id: string): Contact | undefined {
    return this.contactsSignal().find((contact) => contact.id === id);
  }

  private nextAvatarColor(): string {
    return createAvatarColor(this.contactsSignal().map((contact) => contact.color));
  }

  private startRequest(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  private failRequest(message: string): void {
    this.errorSignal.set(message);
    this.loadingSignal.set(false);
  }
}
