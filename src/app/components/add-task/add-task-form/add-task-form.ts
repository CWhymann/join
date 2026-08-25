import {
    Component,
    computed,
    HostListener,
    inject,
    input,
    OnInit,
    output,
    signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardTask, NewTask, TaskCategory, TaskPriority } from '../../board/board-task.model';
import { Contact } from '../../../core/models/contact.model';
import { ContactsService } from '../../../core/services/contacts.service';
import { TasksService } from '../../../core/services/tasks.service';
import { getInitials } from '../../../core/utils/avatar.utils';
import { dueDateValidator, formatDateInput, YEAR_RANGE } from '../../../core/utils/date.utils';
import { TaskToastService } from '../../../core/services/task-toast.service';
import { DatePicker } from './date-picker/date-picker';

const MAX_VISIBLE_AVATARS = 3;

@Component({
    selector: 'app-add-task-form',
    standalone: true,
    imports: [DatePicker, ReactiveFormsModule],
    templateUrl: './add-task-form.html',
    styleUrl: './add-task-form.scss',
})
export class AddTaskForm implements OnInit {
    private formBuilder = inject(FormBuilder);
    private contactsService = inject(ContactsService);
    private tasksService = inject(TasksService);
    private taskToastService = inject(TaskToastService);
    readonly taskCreated = output<void>();
    readonly task = input<BoardTask | null>(null);

    protected readonly contacts = this.contactsService.contacts;
    protected readonly selectedContacts = signal<Contact[]>([]);
    protected readonly visibleContacts = computed(() =>
        this.selectedContacts().slice(0, MAX_VISIBLE_AVATARS),
    );
    protected readonly hiddenContactsCount = computed(() =>
        Math.max(0, this.selectedContacts().length - MAX_VISIBLE_AVATARS),
    );
    protected readonly getInitials = getInitials;
    protected isAssignedOpen = false;
    protected isCategoryOpen = false;
    protected isDatePickerOpen = false;
    protected readonly categories = ['Technical Task', 'User Story'];
    protected readonly subtasks = signal<string[]>([]);
    protected readonly subtaskDraft = signal('');
    protected readonly editingDraft = signal('');
    protected editingIndex = -1;
    protected readonly minYear = new Date().getFullYear();
    protected readonly maxYear = this.minYear + YEAR_RANGE;
    protected readonly isSubmitting = signal(false);

    protected readonly form = this.formBuilder.group({
        title: ['', Validators.required],
        description: [''],
        dueDate: ['', [Validators.required, dueDateValidator]],
        priority: ['medium'],
        category: ['', Validators.required],
    });

    async ngOnInit(): Promise<void> {
        await Promise.all([this.contactsService.loadContacts(), this.tasksService.loadTasks()]);
        this.setTaskValues();
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

        if (!this.isCategoryOpen) {
            this.form.get('category')?.markAsTouched();
        }
    }

    protected toggleDatePicker(event: MouseEvent): void {
        event.stopPropagation();
        this.isAssignedOpen = false;
        this.isCategoryOpen = false;
        this.isDatePickerOpen = !this.isDatePickerOpen;
    }

    protected applyDate(value: string): void {
        this.form.patchValue({ dueDate: value });
        this.form.get('dueDate')?.markAsTouched();
        this.isDatePickerOpen = false;
    }

    protected selectCategory(category: string): void {
        this.form.patchValue({ category });
        this.form.get('category')?.markAsTouched();
        this.isCategoryOpen = false;
    }

    protected clearForm(): void {
        this.isAssignedOpen = false;
        this.isCategoryOpen = false;
        this.form.reset({
            title: '',
            description: '',
            dueDate: '',
            priority: 'medium',
            category: '',
        });
        this.selectedContacts.set([]);
        this.subtasks.set([]);
        this.subtaskDraft.set('');
        this.editingIndex = -1;
    }

    protected onDueDateInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const isDeleting = (event as InputEvent).inputType?.startsWith('delete') ?? false;
        let value = input.value;

        if (isDeleting && formatDateInput(value).length > value.length) {
            value = value.slice(0, -1);
        }

        input.value = formatDateInput(value);
        this.form.patchValue({ dueDate: input.value });
    }

    protected dueDateError(): string {
        const control = this.form.get('dueDate');

        if (!control || !control.touched || control.valid) {
            return '';
        }

        if (control.hasError('invalidDate')) {
            return 'Please enter a valid date';
        }

        if (control.hasError('yearRange')) {
            return `Please choose a year between ${this.minYear} and ${this.maxYear}`;
        }

        return control.hasError('pastDate')
            ? 'The date must not be in the past'
            : 'This field is required';
    }

    protected isInvalid(name: string): boolean {
        const control = this.form.get(name);

        return !!control && control.invalid && control.touched;
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
        if (this.isCategoryOpen) {
            this.form.get('category')?.markAsTouched();
        }

        this.isAssignedOpen = false;
        this.isCategoryOpen = false;
        this.isDatePickerOpen = false;
    }

    protected onSubtaskInput(event: Event): void {
        this.subtaskDraft.set((event.target as HTMLInputElement).value);
    }

    protected addSubtask(event?: Event): void {
        event?.preventDefault();
        const value = this.subtaskDraft().trim();

        if (!value) {
            return;
        }

        this.subtasks.update((items) => [...items, value]);
        this.subtaskDraft.set('');
    }

    protected clearSubtask(): void {
        this.subtaskDraft.set('');
    }

    protected removeSubtask(index: number): void {
        this.subtasks.update((items) => items.filter((_, position) => position !== index));
        this.editingIndex = -1;
    }

    protected startEditing(index: number): void {
        if (this.editingIndex === index) {
            return;
        }

        this.editingIndex = index;
        this.editingDraft.set(this.subtasks()[index]);
    }

    protected onEditingInput(event: Event): void {
        this.editingDraft.set((event.target as HTMLInputElement).value);
    }

    protected saveSubtask(event?: Event): void {
        event?.preventDefault();
        const value = this.editingDraft().trim();

        if (!value) {
            return;
        }

        const index = this.editingIndex;
        this.subtasks.update((items) =>
            items.map((item, position) => (position === index ? value : item)),
        );
        this.editingIndex = -1;
    }

    protected selectPriority(priority: string): void {
        this.form.patchValue({ priority });
    }

    protected isPriority(priority: string): boolean {
        return this.form.value.priority === priority;
    }

    protected async createTask(): Promise<void> {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        const currentTask = this.task();
        const task = currentTask
            ? await this.tasksService.updateTask(currentTask.id, this.buildTask())
            : await this.tasksService.addTask(this.buildTask());
        this.isSubmitting.set(false);

        if (!task) return;
        this.clearForm();
        if (currentTask) {
            this.taskToastService.taskSaved();
        } else {
            this.taskToastService.taskCreated();
        }
        this.taskCreated.emit();
    }

    private buildTask(): NewTask {
        const value = this.form.getRawValue();
        const currentTask = this.task();

        return {
            title: value.title ?? '',
            description: value.description ?? '',
            due_date: this.toDatabaseDate(value.dueDate ?? ''),
            priority: (value.priority ?? 'medium') as TaskPriority,
            category: value.category as TaskCategory,
            status: currentTask?.status ?? 'todo',
            position:
                currentTask?.position ??
                this.tasksService.tasks().filter((task) => task.status === 'todo').length,
            assigned_to: this.selectedContacts().map((contact) => contact.id),
            subtasks: this.subtasks().map((title, index) => ({
                id: currentTask?.subtasks[index]?.id ?? `subtask-${Date.now()}-${index}`,
                title,
                completed: currentTask?.subtasks[index]?.completed ?? false,
            })),
        };
    }

    private setTaskValues(): void {
        const task = this.task();
        if (!task) return;
        this.form.patchValue({
            title: task.title,
            description: task.description,
            dueDate: this.toFormDate(task.dueDate),
            priority: task.priority,
            category: task.category,
        });
        this.selectedContacts.set(
            this.contacts().filter((contact) =>
                task.assignees.some((assignee) => assignee.id === contact.id),
            ),
        );
        this.subtasks.set(task.subtasks.map((subtask) => subtask.title));
    }

    private toDatabaseDate(value: string): string {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    }

    private toFormDate(value: string): string {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    }
}
