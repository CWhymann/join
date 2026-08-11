import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../core/models/contact.model';
import { ContactsService } from '../../../core/services/contacts.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  private contactsService = inject(ContactsService);

  groups = this.contactsService.groups;
  addClicked = output<void>();
  contactSelected = output<Contact>();

  selectedId: string | null = null;

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  onSelect(contact: Contact): void {
    this.selectedId = contact.id;
    this.contactSelected.emit(contact);
  }
}
