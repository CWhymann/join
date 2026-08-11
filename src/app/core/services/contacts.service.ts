import { Injectable, signal } from '@angular/core';
import { Contact } from '../models/contact';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  contacts = signal<Contact[]>([
    { id: '1', name: 'Anton Mayer', email: 'anton@gmail.com', phone: '+49 111', avatarColor: '' },
    { id: '2', name: 'Anja Schulz', email: 'anja@gmail.com', phone: '+49 222', avatarColor: '' },
    { id: '3', name: 'Tatjana Wolf', email: 'wolf@gmail.com', phone: '+49 333', avatarColor: '' },
  ]);

  selectedContact = signal<Contact | null>(null);

  selectContact(contact: Contact): void {
    this.selectedContact.set(contact);
  }
}
