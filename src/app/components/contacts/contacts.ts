import { Component, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { ContactForm } from './contact-form/contact-form';
import { Contact } from '../../core/models/contact';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactList, ContactDetail, ContactForm],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  showForm = signal(false);
  editingContact = signal<Contact | null>(null);

  openAddForm(): void {
    this.editingContact.set(null);
    this.showForm.set(true);
  }

  openEditForm(contact: Contact): void {
    this.editingContact.set(contact);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingContact.set(null);
  }
}
