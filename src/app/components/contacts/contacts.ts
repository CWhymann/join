import { Component, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { ContactForm } from './contact-form/contact-form';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactList, ContactDetail, ContactForm],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  showForm = signal(false);

  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }
}
