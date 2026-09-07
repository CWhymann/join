import { Component, input, output } from '@angular/core';
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

    /** Reports the close request to the board. */
    protected close(): void {
        this.closeClicked.emit();
    }

    /**
     * Closes the overlay when the click hit the backdrop rather than the form.
     * @param event - Click event on the overlay.
     */
    protected onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.close();
    }

    /** Reports the saved task to the board and closes the overlay. */
    protected created(): void {
        this.taskCreated.emit();
        this.close();
    }
}
