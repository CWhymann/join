import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../../core/models/contact.model';
import { getInitials } from '../../../core/utils/avatar.utils';

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
    deleteConfirmOpen = signal(false);

    getInitials = getInitials;

    onEdit(contact: Contact): void {
        this.editClicked.emit(contact);
    }

    onDelete(): void {
        this.deleteConfirmOpen.set(true);
    }

    confirmDelete(contact: Contact): void {
        this.deleteConfirmOpen.set(false);
        this.deleteClicked.emit(contact);
    }

    cancelDelete(): void {
        this.deleteConfirmOpen.set(false);
    }

    toggleMenu(): void {
        this.menuOpen.update((v) => !v);
    }
}
