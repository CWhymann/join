import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { getInitials } from '../../../core/utils/avatar.utils';
import {
    BoardTask,
    TaskMoveDirection,
    TaskMoveOption,
    TaskMoveRequest,
    TaskStatus,
} from '../board-task.model';

const MAX_VISIBLE_AVATARS = 3;
const DESCRIPTION_PREVIEW_LENGTH = 72;

@Component({
    selector: 'app-task-card',
    standalone: true,
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    @Input({ required: true }) task!: BoardTask;
    @Input({ required: true }) moveOptions: TaskMoveOption[] = [];
    @Input() canMoveUp = false;
    @Input() canMoveDown = false;
    @Input() isPulsing = false;
    @Output() taskSelected = new EventEmitter<BoardTask>();
    @Output() taskDragStart = new EventEmitter<{ event: DragEvent; task: BoardTask }>();
    @Output() taskDragEnd = new EventEmitter<void>();
    @Output() taskMoveRequested = new EventEmitter<TaskMoveRequest>();

    protected readonly getInitials = getInitials;
    protected isDragging = false;
    protected isMoveMenuOpen = false;

    protected get visibleAssignees() {
        return this.task.assignees.slice(0, MAX_VISIBLE_AVATARS);
    }

    protected get hiddenAssigneesCount(): number {
        return Math.max(0, this.task.assignees.length - MAX_VISIBLE_AVATARS);
    }

    protected get completedSubtasks(): number {
        return this.task.subtasks.filter((subtask) => subtask.completed).length;
    }

    protected get subtaskProgress(): number {
        if (!this.task.subtasks.length) return 0;
        return (this.completedSubtasks / this.task.subtasks.length) * 100;
    }

    protected get descriptionPreview(): string {
        if (this.task.description.length <= DESCRIPTION_PREVIEW_LENGTH)
            return this.task.description;
        const preview = this.task.description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim();
        const lastSpace = preview.lastIndexOf(' ');
        return `${lastSpace > 0 ? preview.slice(0, lastSpace) : preview}…`;
    }

    protected selectTask(event: Event): void {
        if (event.target instanceof Element && event.target.closest('.task-card__move')) return;
        this.taskSelected.emit(this.task);
    }

    protected availableMoveOptions(): TaskMoveOption[] {
        return this.moveOptions.filter((option) => option.status !== this.task.status);
    }

    protected toggleMoveMenu(event: Event): void {
        event.stopPropagation();
        this.isMoveMenuOpen = !this.isMoveMenuOpen;
    }

    protected requestStatusMove(event: Event, status: TaskStatus): void {
        event.stopPropagation();
        this.taskMoveRequested.emit({ task: this.task, status });
        this.isMoveMenuOpen = false;
    }

    protected requestPositionMove(event: Event, direction: TaskMoveDirection): void {
        event.stopPropagation();
        this.taskMoveRequested.emit({ task: this.task, direction });
        this.isMoveMenuOpen = false;
    }

    protected startDrag(event: DragEvent): void {
        const card = event.currentTarget as HTMLElement;
        const dragImage = card.cloneNode(true) as HTMLElement;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        dragImage.style.left = '-1000px';
        dragImage.style.opacity = '1';
        dragImage.style.transform = 'rotate(5deg)';
        dragImage.style.pointerEvents = 'none';
        document.body.appendChild(dragImage);
        event.dataTransfer?.setDragImage(dragImage, card.offsetWidth / 2, 24);
        setTimeout(() => dragImage.remove());
        this.isDragging = true;
        this.taskDragStart.emit({ event, task: this.task });
    }

    protected endDrag(): void {
        this.isDragging = false;
        this.taskDragEnd.emit();
    }

    @HostListener('document:click')
    protected closeMoveMenu(): void {
        this.isMoveMenuOpen = false;
    }
}
