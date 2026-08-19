import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-task-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './add-task-form.html',
    styleUrl: './add-task-form.scss',
})
export class AddTaskForm {
    private formBuilder = inject(FormBuilder);

    protected readonly form = this.formBuilder.group({
        title: [''],
        description: [''],
        dueDate: [''],
    });
}
