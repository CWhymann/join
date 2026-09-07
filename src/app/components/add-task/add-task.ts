import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AddTaskForm } from './add-task-form/add-task-form';

/** Add-task page: shows the form and returns to the board once a task is saved. */
@Component({
    selector: 'app-add-task',
    standalone: true,
    imports: [AddTaskForm],
    templateUrl: './add-task.html',
    styleUrl: './add-task.scss',
})
export class AddTask {
    private router = inject(Router);

    /** Returns to the board after a task was saved. */
    protected onTaskCreated(): void {
        this.router.navigate(['/board']);
    }
}
