import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../core/models/contact';
import { ContactsService } from '../../../core/services/contacts.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  private contactsService = inject(ContactsService);

  addClicked = output<void>();

  // TODO: Array + getColor()-Methode komplett entfernen, sobald avatarColor
  // aus Supabase geliefert wird (Person D). Dann in contact-list.html direkt
  // contact.avatarColor statt getColor(contact.name) verwenden.
  private avatarColors = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#FFBB2B',
    '#1FD7C1',
    '#462F8A',
    '#FF4646',
    '#00BEE8',
    '#FF5EB3',
    '#0038FF',
    '#C3FF2B',
  ];

  groupedContacts = computed(() => {
    const sorted = [...this.contactsService.contacts()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const groups = new Map<string, Contact[]>();

    for (const contact of sorted) {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter)!.push(contact);
    }

    return groups;
  });

  selectedId = computed(() => this.contactsService.selectedContact()?.id);

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  // TODO: Provisorische Avatar-Farblogik entfernen, sobald DK's
  // Supabase-Anbindung gemerged ist. Dann avatarColor direkt aus dem
  // Contact-Objekt verwenden statt getColor().
  getColor(name: string): string {
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return this.avatarColors[charSum % this.avatarColors.length];
  }

  onSelect(contact: Contact): void {
    this.contactsService.selectContact(contact);
  }
}
