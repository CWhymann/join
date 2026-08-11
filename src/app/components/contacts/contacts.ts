import { Component } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactList, ContactDetail],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {}
