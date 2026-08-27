import { afterRenderEffect, Component, ElementRef, HostListener, inject, input, OnDestroy, output, Renderer2, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';

const MIN_TITLE_FONT_SIZE = 16;

interface Subtask {
    title: string;
    done: boolean;
}

interface AssignedContact {
    initials: string;
    name: string;
    color: string;
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

    constructor() {
        this.scrollPosition = this.document.defaultView?.scrollY ?? 0;
        this.renderer.setStyle(this.document.body, 'top', `-${this.scrollPosition}px`);
        this.renderer.addClass(this.document.body, 'modal-open');
        afterRenderEffect(() => this.fitTitle());
    }

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

    @HostListener('window:resize')
    onResize(): void {
        this.fitTitle();
    }

    ngOnDestroy(): void {
        this.renderer.removeClass(this.document.body, 'modal-open');
        this.renderer.removeStyle(this.document.body, 'top');
        this.document.defaultView?.scrollTo(0, this.scrollPosition);
    }

    closeDetail(): void {
        if (this.isClosing()) return;
        this.isClosing.set(true);
        setTimeout(() => {
            this.closeClicked.emit();
        }, 300);
    }

    onOverlayClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.closeDetail();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target;

        if (!(target instanceof Element) || target.closest('.task-detail-overlay')) return;
        this.closeDetail();
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
