import { Component, ElementRef, inject, OnInit, signal, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { ContactForm } from './contact-form/contact-form';
import { Contact } from '../../core/models/contact.model';
import { ContactsService } from '../../core/services/contacts.service';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [ContactList, ContactDetail, ContactForm],
    templateUrl: './contacts.html',
    styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
    @ViewChild(ContactDetail, { read: ElementRef }) private contactDetail?: ElementRef<HTMLElement>;

    private contactsService = inject(ContactsService);
    private renderer = inject(Renderer2);
    private document = inject(DOCUMENT);

    selectedContact = signal<Contact | null>(null);
    contactSelectionVersion = signal(0);
    showForm = signal(false);
    editingContact = signal<Contact | null>(null);
    showToast = signal(false);
    toastMessage = signal('');

    ngOnInit(): void {
        this.contactsService.loadContacts();
    }

    onContactSelected(contact: Contact): void {
        this.selectedContact.set(contact);
        this.contactSelectionVersion.update((version) => version + 1);
        if (this.contactSelectionVersion() > 1) this.restartDetailAnimation();
        this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    private restartDetailAnimation(): void {
        this.document.defaultView?.requestAnimationFrame(() => {
            const detail = this.contactDetail?.nativeElement.querySelector<HTMLElement>('.contact-detail');
            if (!detail) return;
            detail.getAnimations().forEach((animation) => animation.cancel());
            detail.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], {
                duration: 300,
                easing: 'cubic-bezier(0, 0, 0.58, 1)',
            });
        });
    }

    onBackToList(): void {
        this.selectedContact.set(null);
        this.contactSelectionVersion.set(0);
    }

    openAddForm(): void {
        this.editingContact.set(null);
        this.showForm.set(true);
        this.renderer.addClass(this.document.body, 'modal-open');
    }

    openEditForm(contact: Contact): void {
        this.editingContact.set(contact);
        this.showForm.set(true);
        this.renderer.addClass(this.document.body, 'modal-open');
    }

    async onDeleteContact(contact: Contact): Promise<void> {
        const success = await this.contactsService.deleteContact(contact.id);
        if (!success) {
            this.showToastMessage('Something went wrong');
            return;
        }
        if (this.selectedContact()?.id === contact.id) {
            this.selectedContact.set(null);
        }
        this.showToastMessage('Contact deleted');
    }

    onFormDeleted(): void {
        this.selectedContact.set(null);
        this.showToastMessage('Contact deleted');
    }

    private showToastMessage(message: string): void {
        this.toastMessage.set(message);
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 2500);
    }

    closeForm(): void {
        this.showForm.set(false);
        this.editingContact.set(null);
        this.renderer.removeClass(this.document.body, 'modal-open');
    }

    onFormSaved(contact: Contact | null): void {
        this.showForm.set(false);
        this.editingContact.set(null);
        this.renderer.removeClass(this.document.body, 'modal-open');
        if (contact) this.selectedContact.set(contact);
        this.showToastMessage(contact ? 'Contact saved' : 'Something went wrong');
    }
}
