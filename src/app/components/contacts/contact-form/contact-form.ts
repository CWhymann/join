import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';
import { Contact } from '../../../core/models/contact';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm implements OnInit {
  private fb = inject(FormBuilder);
  private contactsService = inject(ContactsService);

  editingContact = input<Contact | null>(null);
  closed = output<void>();

  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required, this.nameValidator]],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]+$/)]],
  });

  get isEditMode(): boolean {
    return this.editingContact() !== null;
  }

  ngOnInit(): void {
    const contact = this.editingContact();
    if (contact) {
      this.form.patchValue({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      });
    }
  }

  private nameValidator(control: any) {
    const value = (control.value || '').trim();
    if (!value) return null;
    const hasTwoParts = value.split(' ').filter((p: string) => p.length > 0).length >= 2;
    const hasNoNumbers = !/\d/.test(value);
    return hasTwoParts && hasNoNumbers ? null : { invalidName: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { name, email, phone } = this.form.value;
    const contact = this.editingContact();

    if (this.isEditMode && contact) {
      // TODO: Provisorisch — sobald Person D's ContactsService mit Supabase
      // steht, ersetzen durch:
      //   await this.contactsService.updateContact(contact.id, { name: name!, email: email!, phone: phone! });
      this.contactsService.contacts.update((list) =>
        list.map((c) =>
          c.id === contact.id ? { ...c, name: name!, email: email!, phone: phone! } : c,
        ),
      );
    } else {
      // TODO: Provisorisch — sobald Person D's ContactsService mit Supabase
      // steht, diesen Block ersetzen durch:
      //   await this.contactsService.addContact({ name: name!, email: email!, phone: phone!, avatarColor: '' });
      // Methode wird dann async (siehe onSubmit-Signatur oben anpassen),
      // Aufruf mit await versehen, kein direktes Signal-Update mehr hier.
      this.contactsService.contacts.update((list) => [
        ...list,
        { id: crypto.randomUUID(), name: name!, email: email!, phone: phone!, avatarColor: '' },
      ]);
    }

    this.isSubmitting = false;
    this.form.reset();
    this.closed.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }
}
