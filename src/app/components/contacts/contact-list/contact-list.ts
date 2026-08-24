import { Component, effect, ElementRef, inject, input, output, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../core/models/contact.model';
import { ContactsService } from '../../../core/services/contacts.service';
import { getInitials } from '../../../core/utils/avatar.utils';

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

  selectedId = input<number | null>(null);
  private items = viewChildren<ElementRef<HTMLElement>>('item');

  getInitials = getInitials;

  constructor() {
    effect(() => {
      const id = this.selectedId();
      const item = this.items().find((ref) => ref.nativeElement.dataset['id'] === String(id));
      item?.nativeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }
}
