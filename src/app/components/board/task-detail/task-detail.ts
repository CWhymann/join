import { afterRenderEffect, Component, ElementRef, HostListener, inject, input, OnDestroy, output, Renderer2, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';

const MIN_TITLE_FONT_SIZE = 16;

/** One subtask line in the detail view. */
interface Subtask {
    title: string;
    done: boolean;
}

/** One assignee as the detail view draws them. */
interface AssignedContact {
    initials: string;
    name: string;
    color: string;
}

/** The task in the shape the detail overlay expects. */
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

/** Overlay showing one task in full, with its subtasks and delete confirmation. */
@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './task-detail.html',
    styleUrl: './task-detail.scss',
})
export class TaskDetail implements OnDestroy {
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);
    private readonly titleElement = viewChild<ElementRef<HTMLElement>>('titleElement');

    task = input<TaskDetailData | null>(null);

    editClicked = output<TaskDetailData>();
    deleteClicked = output<TaskDetailData>();
    closeClicked = output<void>();
    subtaskChanged = output<{ index: number; done: boolean }>();

    deleteConfirmOpen = signal(false);
    isClosing = signal(false);

    private scrollPosition = 0;

    /** Freezes the page behind the overlay and keeps the title fitted after every render. */
    constructor() {
        this.scrollPosition = this.document.defaultView?.scrollY ?? 0;
        this.renderer.setStyle(this.document.body, 'top', `-${this.scrollPosition}px`);
        this.renderer.addClass(this.document.body, 'modal-open');
        afterRenderEffect(() => this.fitTitle());
    }

    /** Shrinks the title font until it fits its box, down to 16 pixels. */
    private fitTitle(): void {
        const element = this.titleElement()?.nativeElement;
        if (!element || !this.task()) return;
        this.renderer.removeStyle(element, 'font-size');
        let size = Number.parseFloat(getComputedStyle(element).fontSize);
        while (element.scrollHeight > element.clientHeight + 1 && size > MIN_TITLE_FONT_SIZE) {
            size -= 1;
            this.renderer.setStyle(element, 'font-size', `${size}px`);
        }
    }

    /** Refits the title when the window size changes. */
    @HostListener('window:resize')
    onResize(): void {
        this.fitTitle();
    }

    /** Unfreezes the page and restores the scroll position it had. */
    ngOnDestroy(): void {
        this.renderer.removeClass(this.document.body, 'modal-open');
        this.renderer.removeStyle(this.document.body, 'top');
        this.document.defaultView?.scrollTo(0, this.scrollPosition);
    }

    /** Plays the closing animation, then reports the close to the board. */
    closeDetail(): void {
        if (this.isClosing()) return;
        this.isClosing.set(true);
        setTimeout(() => {
            this.closeClicked.emit();
        }, 300);
    }

    /**
     * Closes the overlay when the click hit the backdrop rather than the card.
     * @param event - Click event on the overlay.
     */
    onOverlayClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.closeDetail();
    }

    /**
     * Closes the overlay on any click outside it.
     * @param event - Click event anywhere in the document.
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target;

        if (!(target instanceof Element) || target.closest('.task-detail-overlay')) return;
        this.closeDetail();
    }

    /** Closes the delete confirmation on Escape, or the overlay when none is open. */
    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.deleteConfirmOpen()) {
            this.cancelDelete();
            return;
        }
        this.closeDetail();
    }

    /**
     * Ticks a subtask off or back on and reports the change to the board.
     * @param subtask - Subtask that was clicked.
     * @param index - Its position in the task's subtask list.
     */
    toggleSubtask(subtask: Subtask, index: number): void {
        subtask.done = !subtask.done;
        this.subtaskChanged.emit({ index, done: subtask.done });
    }

    /**
     * Requests the edit form for this task.
     * @param task - Task shown in the overlay.
     */
    onEdit(task: TaskDetailData): void {
        this.editClicked.emit(task);
    }

    /** Opens the delete confirmation, or reports the refusal for a dummy task. */
    onDelete(): void {
        const task = this.task();
        if (task?.isProtected) {
            this.deleteClicked.emit(task);
            return;
        }
        this.deleteConfirmOpen.set(true);
    }

    /**
     * Confirms the deletion and passes it on to the board.
     * @param task - Task to delete.
     */
    confirmDelete(task: TaskDetailData): void {
        this.deleteConfirmOpen.set(false);
        this.deleteClicked.emit(task);
    }

    /** Closes the delete confirmation. */
    cancelDelete(): void {
        this.deleteConfirmOpen.set(false);
    }
}
