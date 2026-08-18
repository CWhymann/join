import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';
import { Contact } from '../../../core/models/contact.model';
import { getInitials } from '../../../core/utils/avatar.utils';

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
    saved = output<Contact | null>();
    deleted = output<void>();

    isSubmitting = false;
    deleteConfirmOpen = signal(false);
    deleteError = signal<string | null>(null);

    readonly maxLengths = { name: 40, email: 80, phone: 20 };

    form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(40), this.nameValidator]],
        email: [
            '',
            [
                Validators.required,
                Validators.maxLength(80),
                Validators.pattern(/^[\w+-]+(\.[\w+-]+)*@[\w-]+(\.[\w-]+)*\.[a-z]{2,}$/i),
            ],
        ],
        phone: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^\+?[0-9]+$/)]],
    });

    atLimit(field: 'name' | 'email' | 'phone'): boolean {
        return (this.form.value[field] ?? '').length >= this.maxLengths[field];
    }

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

    get initials(): string {
        return getInitials(this.editingContact()?.name ?? '');
    }

    private nameValidator(control: any) {
        const value = (control.value || '').trim();
        if (!value) return null;
        const hasValidChars = /^\p{L}+([ '-]\p{L}+)*$/u.test(value);
        const hasTwoParts = value.split(' ').length >= 2;
        return hasValidChars && hasTwoParts ? null : { invalidName: true };
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const { name, email, phone } = this.form.value;
        const contact = this.editingContact();
        const input = { name: name!, email: email!, phone: phone! };

        const result = contact
            ? await this.contactsService.updateContact(contact.id, input)
            : await this.contactsService.addContact(input);

        this.isSubmitting = false;
        this.form.reset();
        this.saved.emit(result);
        this.closed.emit();
    }

    onCancel(): void {
        this.closed.emit();
    }

    onDeleteClick(): void {
        this.deleteError.set(null);
        this.deleteConfirmOpen.set(true);
    }

    cancelDelete(): void {
        this.deleteConfirmOpen.set(false);
        this.deleteError.set(null);
    }

    async confirmDelete(): Promise<void> {
        const contact = this.editingContact();
        if (!contact) return;

        try {
            const success = await this.contactsService.deleteContact(contact.id);

            if (success) {
                this.deleteConfirmOpen.set(false);
                this.deleteError.set(null);
                this.deleted.emit();
                this.closed.emit();
            } else {
                
                this.deleteError.set(this.contactsService.error());
            }
        } catch {
            
            this.deleteError.set('Something went wrong');
        }
    }
}
