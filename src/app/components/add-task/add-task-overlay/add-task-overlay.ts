import { Component, input, output, signal, viewChild } from '@angular/core';
import { AddTaskForm } from '../add-task-form/add-task-form';
import { BoardTask } from '../../board/board-task.model';

/** Wraps the add-task form in the overlay the board opens. */
@Component({
    selector: 'app-add-task-overlay',
    standalone: true,
    imports: [AddTaskForm],
    templateUrl: './add-task-overlay.html',
    styleUrl: './add-task-overlay.scss',
})
export class AddTaskOverlay {
    readonly task = input<BoardTask | null>(null);
    readonly closeClicked = output<void>();
    readonly taskCreated = output<void>();

    private readonly addTaskForm = viewChild(AddTaskForm);
    protected readonly discardConfirmOpen = signal(false);

    /** Closes right away when nothing changed, otherwise asks first. */
    protected attemptClose(): void {
        if (this.task() && this.addTaskForm()?.hasUnsavedChanges()) {
            this.discardConfirmOpen.set(true);
            return;
        }
        this.close();
    }

    /** Reports the close request to the board. */
    private close(): void {
        this.closeClicked.emit();
    }

    /**
     * Closes the overlay when the click hit the backdrop rather than the form.
     * @param event - Click event on the overlay.
     */
    protected onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.attemptClose();
    }

    /** Saves the changes; the form reports back via (taskCreated). */
    protected async confirmSave(): Promise<void> {
        this.discardConfirmOpen.set(false);
        await this.addTaskForm()?.submitFromOutside();
    }

    /** Discards the changes and closes the overlay. */
    protected cancelSave(): void {
        this.discardConfirmOpen.set(false);
        this.close();
    }

    /** Keeps editing; closes only the confirmation. */
    protected cancelDiscard(): void {
        this.discardConfirmOpen.set(false);
    }

    /** Reports the saved task to the board and closes the overlay. */
    protected created(): void {
        this.taskCreated.emit();
        this.close();
    }
}
