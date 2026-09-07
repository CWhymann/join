import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';
import { Contact } from '../../../core/models/contact.model';
import { getInitials } from '../../../core/utils/avatar.utils';
import { EMAIL_PATTERN, fullNameValidator } from '../../../core/utils/validation.utils';

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
        name: ['', [Validators.required, Validators.maxLength(40), fullNameValidator]],
        email: ['', [Validators.required, Validators.maxLength(80), Validators.pattern(EMAIL_PATTERN)]],
        phone: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^\+?[0-9]+$/)]],
    });

    atLimit(field: 'name' | 'email' | 'phone'): boolean {
        return (this.form.value[field] ?? '').length >= this.maxLengths[field];
    }

    get isUnchanged(): boolean {
        const contact = this.editingContact();
        if (!contact) return false;
        const { name, email, phone } = this.form.value;
        return name === contact.name && email === contact.email && phone === contact.phone;
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

    async onSubmit(): Promise<void> {
        if (this.submissionBlocked()) return;

        this.isSubmitting = true;
        const contact = this.editingContact();
        const result = await this.saveContact(contact);
        this.isSubmitting = false;
        this.form.reset();
        this.saved.emit(result);
        this.closed.emit();
    }

    private submissionBlocked(): boolean {
        if (this.form.valid) return false;
        this.form.markAllAsTouched();
        return true;
    }

    private saveContact(contact: Contact | null): Promise<Contact | null> {
        const { name, email, phone } = this.form.value;
        const input = { name: name!, email: email!, phone: phone! };
        return contact
            ? this.contactsService.updateContact(contact.id, input)
            : this.contactsService.addContact(input);
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
            this.handleDeleteResult(success);
        } catch {
            this.deleteError.set('Something went wrong');
        }
    }

    private handleDeleteResult(success: boolean): void {
        if (!success) {
            this.deleteError.set(this.contactsService.error());
            return;
        }
        this.deleteConfirmOpen.set(false);
        this.deleteError.set(null);
        this.deleted.emit();
        this.closed.emit();
    }
}
