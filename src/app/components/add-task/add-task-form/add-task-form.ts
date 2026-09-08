import { Component, computed, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardTask, NewTask, TaskCategory, TaskPriority } from '../../board/board-task.model';
import { Contact } from '../../../core/models/contact.model';
import { ContactsService } from '../../../core/services/contacts.service';
import { TasksService } from '../../../core/services/tasks.service';
import { getInitials } from '../../../core/utils/avatar.utils';
import { dueDateValidator, formatDateInput, YEAR_RANGE } from '../../../core/utils/date.utils';
import { hasReadableText, readableTextValidator } from '../../../core/utils/text.utils';
import { TaskToastService } from '../../../core/services/task-toast.service';
import { DatePicker } from './date-picker/date-picker';


const MAX_VISIBLE_AVATARS = 3;

/** Form for creating and editing a task, with assignees, subtasks and the date picker. */
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
        title: ['', [Validators.required, Validators.maxLength(40), readableTextValidator]],
        description: ['', readableTextValidator],
        dueDate: ['', [Validators.required, dueDateValidator]],
        priority: ['medium'],
        category: ['', Validators.required],
    });

    /** Loads contacts and tasks, then fills the form when a task is being edited. */
    async ngOnInit(): Promise<void> {
        await Promise.all([this.contactsService.loadContacts(), this.tasksService.loadTasks()]);
        this.setTaskValues();
    }

    /**
     * Opens or closes the assignee dropdown and closes the category one.
     * @param event - Click event, stopped so the outside-click listener does not fire.
     */
    protected toggleAssigned(event: MouseEvent): void {
        event.stopPropagation();
        this.isCategoryOpen = false;
        this.isAssignedOpen = !this.isAssignedOpen;
    }

    /**
     * Opens or closes the category dropdown; closing it marks the field as touched.
     * @param event - Click event, stopped so the outside-click listener does not fire.
     */
    protected toggleCategory(event: MouseEvent): void {
        event.stopPropagation();
        this.isAssignedOpen = false;
        this.isCategoryOpen = !this.isCategoryOpen;

        if (!this.isCategoryOpen) {
            this.form.get('category')?.markAsTouched();
        }
    }

    /**
     * Opens or closes the calendar and closes both dropdowns.
     * @param event - Click event, stopped so the outside-click listener does not fire.
     */
    protected toggleDatePicker(event: MouseEvent): void {
        event.stopPropagation();
        this.isAssignedOpen = false;
        this.isCategoryOpen = false;
        this.isDatePickerOpen = !this.isDatePickerOpen;
    }

    /**
     * Takes the date picked in the calendar into the form.
     * @param value - Date as `dd/mm/yyyy`.
     */
    protected applyDate(value: string): void {
        this.form.patchValue({ dueDate: value });
        this.form.get('dueDate')?.markAsTouched();
        this.isDatePickerOpen = false;
    }

    /**
     * Takes the picked category into the form and closes the dropdown.
     * @param category - Category that was clicked.
     */
    protected selectCategory(category: string): void {
        this.form.patchValue({ category });
        this.form.get('category')?.markAsTouched();
        this.isCategoryOpen = false;
    }

    /** Resets every field, the assignees and the subtasks. */
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
        this.resetTaskSelection();
    }

    /** Clears the assignees, the subtasks and the subtask being edited. */
    private resetTaskSelection(): void {
        this.selectedContacts.set([]);
        this.subtasks.set([]);
        this.subtaskDraft.set('');
        this.editingIndex = -1;
    }

    /**
     * Reformats the due date while typing and stops deleting from re-adding separators.
     * @param event - Input event from the due date field.
     */
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

    /**
     * Picks the message shown under the due date field.
     * @returns Error text, or an empty string while the field is untouched or valid.
     */
    protected dueDateError(): string {
        const control = this.form.get('dueDate');

        if (!control || !control.touched || control.valid) {
            return '';
        }

        if (control.hasError('invalidDate')) return 'Please enter a valid date';
        if (control.hasError('yearRange')) return this.yearRangeError();
        return control.hasError('pastDate')
            ? 'The date must not be in the past'
            : 'This field is required';
    }

    /**
     * Builds the message naming the years that can be picked.
     * @returns Error text with the allowed year range.
     */
    private yearRangeError(): string {
        return `Please choose a year between ${this.minYear} and ${this.maxYear}`;
    }

    /**
     * Picks the message shown under the title field.
     * @returns Error text, or an empty string while the field is untouched or valid.
     */
    protected titleError(): string {
        const control = this.form.controls.title;

        if (!control.touched || control.valid) {
            return '';
        }

        if (control.hasError('maxlength')) return 'Maximum 40 characters';
        return control.hasError('noReadableText')
            ? 'Please enter a valid title'
            : 'This field is required';
    }

    /**
     * Reports whether a field shows its error state.
     * @param name - Name of the form control.
     * @returns `true` when the field is invalid and has been touched.
     */
    protected isInvalid(name: string): boolean {
        const control = this.form.get(name);

        return !!control && control.invalid && control.touched;
    }

    /**
     * Adds a contact to the assignees, or removes it again.
     * @param contact - Contact that was clicked.
     */
    protected toggleContact(contact: Contact): void {
        this.selectedContacts.update((selected) =>
            selected.includes(contact)
                ? selected.filter((item) => item !== contact)
                : [...selected, contact],
        );
    }

    /**
     * Reports whether a contact is assigned to the task.
     * @param contact - Contact to check.
     * @returns `true` when it is among the assignees.
     */
    protected isSelected(contact: Contact): boolean {
        return this.selectedContacts().includes(contact);
    }

    /** Closes both dropdowns and the calendar on an outside click or on Escape. */
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

    /**
     * Stores what was typed into the new-subtask field.
     * @param event - Input event from the subtask field.
     */
    protected onSubtaskInput(event: Event): void {
        this.subtaskDraft.set((event.target as HTMLInputElement).value);
    }

    /**
     * Adds the drafted subtask; ignored when it holds no readable text.
     * @param event - Submit or click event, when one triggered this.
     */
    protected addSubtask(event?: Event): void {
        event?.preventDefault();
        const value = this.subtaskDraft().trim();

        if (!hasReadableText(value)) {
            return;
        }

        this.subtasks.update((items) => [...items, value]);
        this.subtaskDraft.set('');
    }

    /** Empties the new-subtask field. */
    protected clearSubtask(): void {
        this.subtaskDraft.set('');
    }

    /**
     * Deletes one subtask.
     * @param index - Position of the subtask in the list.
     */
    protected removeSubtask(index: number): void {
        this.subtasks.update((items) => items.filter((_, position) => position !== index));
        this.editingIndex = -1;
    }

    /**
     * Opens a subtask for editing; ignored when it is already open.
     * @param index - Position of the subtask in the list.
     */
    protected startEditing(index: number): void {
        if (this.editingIndex === index) {
            return;
        }

        this.editingIndex = index;
        this.editingDraft.set(this.subtasks()[index]);
    }

    /**
     * Stores what was typed into the subtask being edited.
     * @param event - Input event from the edit field.
     */
    protected onEditingInput(event: Event): void {
        this.editingDraft.set((event.target as HTMLInputElement).value);
    }

    /**
     * Writes the edited subtask back; ignored when it holds no readable text.
     * @param event - Submit or click event, when one triggered this.
     */
    protected saveSubtask(event?: Event): void {
        event?.preventDefault();
        const value = this.editingDraft().trim();

        if (!hasReadableText(value)) {
            return;
        }

        const index = this.editingIndex;
        this.subtasks.update((items) =>
            items.map((item, position) => (position === index ? value : item)),
        );
        this.editingIndex = -1;
    }

    /**
     * Takes the picked priority into the form.
     * @param priority - Priority that was clicked.
     */
    protected selectPriority(priority: string): void {
        this.form.patchValue({ priority });
    }

    /**
     * Reports which priority button is drawn as active.
     * @param priority - Priority to check.
     * @returns `true` when the form holds that priority.
     */
    protected isPriority(priority: string): boolean {
        return this.form.value.priority === priority;
    }

    /** Validates the form, saves the task and reports it to the page or the overlay. */
    protected async createTask(): Promise<void> {
        if (this.taskSubmissionBlocked()) return;

        this.isSubmitting.set(true);
        const currentTask = this.task();
        const task = await this.saveTask(currentTask);
        this.isSubmitting.set(false);

        if (!task) return;
        this.clearForm();
        this.showTaskToast(currentTask);
        this.taskCreated.emit();
    }

    /**
     * Guards the submit and marks the fields so their errors become visible.
     * @returns `true` when the form is invalid or a save is already running.
     */
    private taskSubmissionBlocked(): boolean {
        if (!this.form.invalid && !this.isSubmitting()) return false;
        this.form.markAllAsTouched();
        return true;
    }

    /**
     * Creates a new task, or updates the one being edited.
     * @param currentTask - Task being edited, or `null` when creating one.
     * @returns Result of the request; falsy when it failed.
     */
    private saveTask(currentTask: BoardTask | null): Promise<BoardTask | boolean | null> {
        return currentTask
            ? this.tasksService.updateTask(currentTask.id, this.buildTask())
            : this.tasksService.addTask(this.buildTask());
    }

    /**
     * Confirms the save with the wording that fits the mode.
     * @param currentTask - Task that was edited, or `null` when one was created.
     */
    private showTaskToast(currentTask: BoardTask | null): void {
        currentTask ? this.taskToastService.taskSaved() : this.taskToastService.taskCreated();
    }

    /**
     * Collects the form into the shape the database expects.
     * @returns Task ready to be written; a new one lands at the end of the To-do column.
     */
    private buildTask(): NewTask {
        const currentTask = this.task();
        return {
            ...this.buildTaskFields(),
            status: currentTask?.status ?? 'todo',
            position: currentTask?.position ?? this.todoTaskCount(),
            assigned_to: this.selectedContacts().map((contact) => contact.id),
            subtasks: this.buildSubtasks(currentTask),
        };
    }

    /**
     * Reads the plain fields out of the form.
     * @returns Title, description, due date, priority and category.
     */
    private buildTaskFields(): Pick<NewTask, 'title' | 'description' | 'due_date' | 'priority' | 'category'> {
        const value = this.form.getRawValue();
        return {
            title: value.title ?? '',
            description: value.description ?? '',
            due_date: this.toDatabaseDate(value.dueDate ?? ''),
            priority: (value.priority ?? 'medium') as TaskPriority,
            category: value.category as TaskCategory,
        };
    }

    /**
     * Counts the tasks in the To-do column.
     * @returns Position a newly created task takes.
     */
    private todoTaskCount(): number {
        return this.tasksService.tasks().filter((task) => task.status === 'todo').length;
    }

    /**
     * Turns the subtask titles into rows, keeping ids and done states while editing.
     * @param currentTask - Task being edited, or `null` when creating one.
     * @returns Subtask rows for the database.
     */
    private buildSubtasks(currentTask: BoardTask | null): NewTask['subtasks'] {
        return this.subtasks().map((title, index) => ({
            id: currentTask?.subtasks[index]?.id ?? `subtask-${Date.now()}-${index}`,
            title,
            completed: currentTask?.subtasks[index]?.completed ?? false,
        }));
    }

    /** Fills the form, the assignees and the subtasks from the task being edited. */
    private setTaskValues(): void {
        const task = this.task();
        if (!task) return;
        this.patchTaskForm(task);
        this.setTaskContacts(task);
        this.subtasks.set(task.subtasks.map((subtask) => subtask.title));
    }

    /**
     * Writes the task's field values into the form.
     * @param task - Task being edited.
     */
    private patchTaskForm(task: BoardTask): void {
        this.form.patchValue({
            title: task.title,
            description: task.description,
            dueDate: this.toFormDate(task.dueDate),
            priority: task.priority,
            category: task.category,
        });
    }

    /**
     * Marks the task's assignees as selected.
     * @param task - Task being edited.
     */
    private setTaskContacts(task: BoardTask): void {
        this.selectedContacts.set(
            this.contacts().filter((contact) =>
                task.assignees.some((assignee) => assignee.id === contact.id),
            ),
        );
    }

    /**
     * Converts a date from the form into the database format.
     * @param value - Date as `dd/mm/yyyy`.
     * @returns Date as `yyyy-mm-dd`.
     */
    private toDatabaseDate(value: string): string {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    }

    /**
     * Converts a date from the database into the form format.
     * @param value - Date as `yyyy-mm-dd`.
     * @returns Date as `dd/mm/yyyy`.
     */
    private toFormDate(value: string): string {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    }
}
