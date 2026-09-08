import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { getInitials } from '../../../core/utils/avatar.utils';
import { createDragImage } from '../board-drag.utils';
import {
    BoardTask,
    TaskMoveDirection,
    TaskMoveOption,
    TaskMoveRequest,
    TaskStatus,
} from '../board-task.model';

const MAX_VISIBLE_AVATARS = 3;
const DESCRIPTION_PREVIEW_LENGTH = 72;

/** One task card on the board, with its avatars, progress bar and move menu. */
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

    /** The first three assignees, the only ones drawn as avatars. */
    protected get visibleAssignees() {
        return this.task.assignees.slice(0, MAX_VISIBLE_AVATARS);
    }

    /** How many further assignees the counter badge stands for. */
    protected get hiddenAssigneesCount(): number {
        return Math.max(0, this.task.assignees.length - MAX_VISIBLE_AVATARS);
    }

    /** Number of subtasks already ticked off. */
    protected get completedSubtasks(): number {
        return this.task.subtasks.filter((subtask) => subtask.completed).length;
    }

    /** Progress bar width in percent; 0 when the task has no subtasks. */
    protected get subtaskProgress(): number {
        if (!this.task.subtasks.length) return 0;
        return (this.completedSubtasks / this.task.subtasks.length) * 100;
    }

    /** Description cut to 72 characters at the last full word, with an ellipsis. */
    protected get descriptionPreview(): string {
        if (this.task.description.length <= DESCRIPTION_PREVIEW_LENGTH)
            return this.task.description;
        const preview = this.task.description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim();
        const lastSpace = preview.lastIndexOf(' ');
        return `${lastSpace > 0 ? preview.slice(0, lastSpace) : preview}…`;
    }

    /**
     * Opens the task detail, unless the click came from the move menu.
     * @param event - Click event on the card.
     */
    protected selectTask(event: Event): void {
        if (event.target instanceof Element && event.target.closest('.task-card__move')) return;
        this.taskSelected.emit(this.task);
    }

    /**
     * Lists the columns the task can move to.
     * @returns Move options without the column the task already sits in.
     */
    protected availableMoveOptions(): TaskMoveOption[] {
        return this.moveOptions.filter((option) => option.status !== this.task.status);
    }

    /**
     * Opens or closes the move menu.
     * @param event - Click event, stopped so the card does not open.
     */
    protected toggleMoveMenu(event: Event): void {
        event.stopPropagation();
        this.isMoveMenuOpen = !this.isMoveMenuOpen;
    }

    /**
     * Asks the board to move the task to another column.
     * @param event - Click event, stopped so the card does not open.
     * @param status - Column to move to.
     */
    protected requestStatusMove(event: Event, status: TaskStatus): void {
        event.stopPropagation();
        this.taskMoveRequested.emit({ task: this.task, status });
        this.isMoveMenuOpen = false;
    }

    /**
     * Asks the board to move the task one slot within its column.
     * @param event - Click event, stopped so the card does not open.
     * @param direction - Whether to move up or down.
     */
    protected requestPositionMove(event: Event, direction: TaskMoveDirection): void {
        event.stopPropagation();
        this.taskMoveRequested.emit({ task: this.task, direction });
        this.isMoveMenuOpen = false;
    }

    /**
     * Starts a drag and hands the browser the tilted drag image.
     * @param event - Drag start event on the card.
     */
    protected startDrag(event: DragEvent): void {
        const card = event.currentTarget as HTMLElement;
        const dragImage = createDragImage(card);
        event.dataTransfer?.setDragImage(dragImage, card.offsetWidth / 2, 24);
        setTimeout(() => dragImage.remove());
        this.isDragging = true;
        this.taskDragStart.emit({ event, task: this.task });
    }

    /** Ends the drag and clears the dragging state. */
    protected endDrag(): void {
        this.isDragging = false;
        this.taskDragEnd.emit();
    }

    /** Closes the move menu on any click in the document. */
    @HostListener('document:click')
    protected closeMoveMenu(): void {
        this.isMoveMenuOpen = false;
    }
}
