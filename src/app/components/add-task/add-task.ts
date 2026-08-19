import { Component } from '@angular/core';
import { AddTaskForm } from './add-task-form/add-task-form';

@Component({
    selector: 'app-add-task',
    standalone: true,
    imports: [AddTaskForm],
    templateUrl: './add-task.html',
    styleUrl: './add-task.scss',
})
export class AddTask {}
