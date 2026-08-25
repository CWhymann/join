import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AddTaskForm } from './add-task-form/add-task-form';

@Component({
    selector: 'app-add-task',
    standalone: true,
    imports: [AddTaskForm],
    templateUrl: './add-task.html',
    styleUrl: './add-task.scss',
})
export class AddTask {
    private router = inject(Router);

    protected onTaskCreated(): void {
        this.router.navigate(['/board']);
    }
}
