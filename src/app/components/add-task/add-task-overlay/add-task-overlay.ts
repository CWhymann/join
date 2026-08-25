import { Component, output } from '@angular/core';
import { AddTaskForm } from '../add-task-form/add-task-form';

@Component({
    selector: 'app-add-task-overlay',
    standalone: true,
    imports: [AddTaskForm],
    templateUrl: './add-task-overlay.html',
    styleUrl: './add-task-overlay.scss',
})
export class AddTaskOverlay {
    readonly closeClicked = output<void>();

    protected close(): void {
        this.closeClicked.emit();
    }

    protected onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.close();
    }
}
