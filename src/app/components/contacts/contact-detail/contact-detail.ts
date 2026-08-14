import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail {
  contact = input<Contact | null>(null);

  editClicked = output<Contact>();
  deleteClicked = output<Contact>();

  menuOpen = signal(false);

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  onEdit(contact: Contact): void {
    this.editClicked.emit(contact);
  }

  onDelete(contact: Contact): void {
    this.deleteClicked.emit(contact);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
