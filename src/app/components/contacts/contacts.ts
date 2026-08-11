import { Component, inject, OnInit, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { ContactForm } from './contact-form/contact-form';
import { Contact } from '../../core/models/contact.model';
import { ContactsService } from '../../core/services/contacts.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactList, ContactDetail, ContactForm],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
  private contactsService = inject(ContactsService);

  selectedContact = signal<Contact | null>(null);
  showForm = signal(false);
  editingContact = signal<Contact | null>(null);

  ngOnInit(): void {
    this.contactsService.loadContacts();
  }

  onContactSelected(contact: Contact): void {
    this.selectedContact.set(contact);
  }

  openAddForm(): void {
    this.editingContact.set(null);
    this.showForm.set(true);
  }

  openEditForm(contact: Contact): void {
    this.editingContact.set(contact);
    this.showForm.set(true);
  }

  async onDeleteContact(contact: Contact): Promise<void> {
    const success = await this.contactsService.deleteContact(contact.id);
    if (success && this.selectedContact()?.id === contact.id) {
      this.selectedContact.set(null);
    }
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingContact.set(null);
  }
}
