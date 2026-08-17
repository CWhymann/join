import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';
import { Contact } from '../../../core/models/contact.model';

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
    saved = output<boolean>();
    deleted = output<void>();

    isSubmitting = false;
    deleteConfirmOpen = signal(false);
    deleteError = signal<string | null>(null);

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

    get initials(): string {
        const contact = this.editingContact();
        if (!contact) return '';
        return contact.name
            .split(' ')
            .map((part) => part.charAt(0))
            .join('')
            .toUpperCase();
    }

    private nameValidator(control: any) {
        const value = (control.value || '').trim();
        if (!value) return null;
        const hasTwoParts = value.split(' ').filter((p: string) => p.length > 0).length >= 2;
        const hasNoNumbers = !/\d/.test(value);
        return hasTwoParts && hasNoNumbers ? null : { invalidName: true };
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const { name, email, phone } = this.form.value;
        const contact = this.editingContact();

        if (this.isEditMode && contact) {
            await this.contactsService.updateContact(contact.id, {
                name: name!,
                email: email!,
                phone: phone!,
            });
        } else {
            await this.contactsService.addContact({
                name: name!,
                email: email!,
                phone: phone!,
            });
        }

        this.isSubmitting = false;
        this.form.reset();
        this.saved.emit(this.isEditMode);
        this.closed.emit();
    }

    onCancel(): void {
        this.closed.emit();
    }

    onDeleteClick(): void {
        // öffnet die Ja/Nein-Bestätigung statt sofort zu löschen
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
                // Dialog bleibt offen, Fehlermeldung aus dem Service anzeigen
                this.deleteError.set(this.contactsService.error());
            }
        } catch {
            // z. B. bei fehlender Internetverbindung / ungefangener Exception im Service
            this.deleteError.set('Something went wrong');
        }
    }
}
