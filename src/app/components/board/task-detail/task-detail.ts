import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Subtask {
    title: string;
    done: boolean;
}

interface AssignedContact {
    initials: string;
    name: string;
}

interface TaskDetailData {
    category: 'User Story' | 'Technical Task';
    title: string;
    description: string;
    dueDate: string;
    priority: 'Urgent' | 'Medium' | 'Low';
    assignedTo: AssignedContact[];
    subtasks: Subtask[];
}

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './task-detail.html',
    styleUrl: './task-detail.scss',
})
export class TaskDetail {
    task = input<TaskDetailData | null>(null);

    editClicked = output<TaskDetailData>();
    deleteClicked = output<TaskDetailData>();
    closeClicked = output<void>();

    deleteConfirmOpen = signal(false);

    closeDetail(): void {
        this.closeClicked.emit();
    }

    toggleSubtask(subtask: Subtask): void {
        subtask.done = !subtask.done;
    }

    onEdit(task: TaskDetailData): void {
        this.editClicked.emit(task);
    }

    onDelete(): void {
        this.deleteConfirmOpen.set(true);
    }

    confirmDelete(task: TaskDetailData): void {
        this.deleteConfirmOpen.set(false);
        this.deleteClicked.emit(task);
    }

    cancelDelete(): void {
        this.deleteConfirmOpen.set(false);
    }
}
