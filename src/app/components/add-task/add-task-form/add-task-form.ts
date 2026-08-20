import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Contact } from '../../../core/models/contact.model';
import { ContactsService } from '../../../core/services/contacts.service';
import { getInitials } from '../../../core/utils/avatar.utils';

const MAX_VISIBLE_AVATARS = 3;

@Component({
    selector: 'app-add-task-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './add-task-form.html',
    styleUrl: './add-task-form.scss',
})
export class AddTaskForm implements OnInit {
    private formBuilder = inject(FormBuilder);
    private contactsService = inject(ContactsService);

    protected readonly contacts = this.contactsService.contacts;
    protected readonly selectedContacts = signal<Contact[]>([]);
    protected readonly visibleContacts = computed(() => this.selectedContacts().slice(0, MAX_VISIBLE_AVATARS));
    protected readonly hiddenContactsCount = computed(() =>
        Math.max(0, this.selectedContacts().length - MAX_VISIBLE_AVATARS),
    );
    protected readonly getInitials = getInitials;
    protected isAssignedOpen = false;
    protected isCategoryOpen = false;
    protected readonly categories = ['Technical Task', 'User Story'];

    protected readonly form = this.formBuilder.group({
        title: [''],
        description: [''],
        dueDate: [''],
        priority: ['medium'],
        category: [''],
    });

    ngOnInit(): void {
        this.contactsService.loadContacts();
    }

    protected toggleAssigned(event: MouseEvent): void {
        event.stopPropagation();
        this.isCategoryOpen = false;
        this.isAssignedOpen = !this.isAssignedOpen;
    }

    protected toggleCategory(event: MouseEvent): void {
        event.stopPropagation();
        this.isAssignedOpen = false;
        this.isCategoryOpen = !this.isCategoryOpen;
    }

    protected selectCategory(category: string): void {
        this.form.patchValue({ category });
        this.isCategoryOpen = false;
    }

    protected toggleContact(contact: Contact): void {
        this.selectedContacts.update((selected) =>
            selected.includes(contact)
                ? selected.filter((item) => item !== contact)
                : [...selected, contact],
        );
    }

    protected isSelected(contact: Contact): boolean {
        return this.selectedContacts().includes(contact);
    }

    @HostListener('document:click')
    @HostListener('document:keydown.escape')
    protected closeDropdowns(): void {
        this.isAssignedOpen = false;
        this.isCategoryOpen = false;
    }

    protected selectPriority(priority: string): void {
        this.form.patchValue({ priority });
    }

    protected isPriority(priority: string): boolean {
        return this.form.value.priority === priority;
    }
}
