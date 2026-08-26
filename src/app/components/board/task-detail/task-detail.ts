import { Component, HostListener, input, output, signal } from '@angular/core';
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
    isProtected: boolean;
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
    subtaskChanged = output<{ index: number; done: boolean }>();

    deleteConfirmOpen = signal(false);

    closeDetail(): void {
        this.closeClicked.emit();
    }

    onOverlayClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.closeDetail();
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.deleteConfirmOpen()) {
            this.cancelDelete();
            return;
        }
        this.closeDetail();
    }

    toggleSubtask(subtask: Subtask, index: number): void {
        subtask.done = !subtask.done;
        this.subtaskChanged.emit({ index, done: subtask.done });
    }

    onEdit(task: TaskDetailData): void {
        this.editClicked.emit(task);
    }

    onDelete(): void {
        const task = this.task();
        if (task?.isProtected) {
            this.deleteClicked.emit(task);
            return;
        }
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
