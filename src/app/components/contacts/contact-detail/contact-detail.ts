import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../core/models/contact.model';
import { getInitials } from '../../../core/utils/avatar.utils';

/** Detail view of one contact, with its edit and delete actions. */
@Component({
    selector: 'app-contact-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './contact-detail.html',
    styleUrl: './contact-detail.scss',
})
export class ContactDetail {
    contact = input<Contact | null>(null);
    locked = input(false);

    editClicked = output<Contact>();
    deleteClicked = output<Contact>();
    menuOpen = signal(false);
    deleteConfirmOpen = signal(false);

    getInitials = getInitials;

    /** Closes the menu and the delete confirmation whenever another contact is shown. */
    constructor() {
        effect(() => {
            this.contact();
            this.menuOpen.set(false);
            this.deleteConfirmOpen.set(false);
        });
    }

    /**
     * Requests the edit form; ignored while the contact is locked.
     * @param contact - Contact to edit.
     */
    onEdit(contact: Contact): void {
        if (this.locked()) return;
        this.editClicked.emit(contact);
    }

    /** Opens the delete confirmation; ignored while the contact is locked. */
    onDelete(): void {
        if (this.locked()) return;
        this.deleteConfirmOpen.set(true);
    }

    /**
     * Confirms the deletion and passes it on to the page.
     * @param contact - Contact to delete.
     */
    confirmDelete(contact: Contact): void {
        this.deleteConfirmOpen.set(false);
        this.deleteClicked.emit(contact);
    }

    /** Closes the delete confirmation. */
    cancelDelete(): void {
        this.deleteConfirmOpen.set(false);
    }

    /** Opens or closes the action menu shown on narrow screens. */
    toggleMenu(): void {
        this.menuOpen.update((v) => !v);
    }
}
