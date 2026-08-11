import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private fb = inject(FormBuilder);
  private contactsService = inject(ContactsService);

  closed = output<void>();

  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required, this.nameValidator]],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]+$/)]],
  });

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

    // TODO: Provisorisch — sobald Person D's ContactsService mit Supabase
    // steht, diesen Block ersetzen durch:
    //   await this.contactsService.addContact({ name: name!, email: email!, phone: phone!, avatarColor: '' });
    // Methode wird dann async (siehe onSubmit-Signatur oben anpassen),
    // Aufruf mit await versehen, kein direktes Signal-Update mehr hier.
    this.contactsService.contacts.update((list) => [
      ...list,
      { id: crypto.randomUUID(), name: name!, email: email!, phone: phone!, avatarColor: '' },
    ]);

    this.isSubmitting = false;
    this.form.reset();
    this.closed.emit();
  }

  onCancel(): void {
    this.closed.emit();
  }
}
