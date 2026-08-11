import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../../core/services/contacts.service';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail {
  private contactsService = inject(ContactsService);

  contact = this.contactsService.selectedContact;

  // TODO: Array + getColor()-Methode komplett entfernen, sobald avatarColor
  // aus Supabase geliefert wird (Person D). Dann in contact-detail.html direkt
  // c.avatarColor statt getColor(c.name) verwenden.
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  // TODO: Provisorische Avatar-Farblogik entfernen, sobald Person D's
  // Supabase-Anbindung gemerged ist. Dann avatarColor direkt aus dem
  // Contact-Objekt verwenden statt getColor().
  getColor(name: string): string {
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return this.avatarColors[charSum % this.avatarColors.length];
  }
}
