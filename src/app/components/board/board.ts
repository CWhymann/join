import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AddTaskOverlay } from '../add-task/add-task-overlay/add-task-overlay';
import { BoardTask, TaskMoveDirection, TaskMoveRequest, TaskStatus } from './board-task.model';
import { ContactsService } from '../../core/services/contacts.service';
import { TasksService } from '../../core/services/tasks.service';
import { TaskCard } from './task-card/task-card';
import { TaskDetail } from './task-detail/task-detail';
import { TaskToastService } from '../../core/services/task-toast.service';
import { UrgentHighlightService } from '../../core/services/urgent-highlight.service';
import { getDropBeforeId, isDropBeforeCard } from './board-drag.utils';
import { toTaskDetailData } from './board-task.mapper';

/** One column of the board with its heading and empty-state text. */
interface BoardColumn {
    title: string;
    status: TaskStatus;
    emptyMessage: string;
}

/** The board: four columns, search, drag and drop, and the task overlays. */
@Component({
    selector: 'app-board',
    standalone: true,
    imports: [AddTaskOverlay, TaskCard, TaskDetail],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
    private readonly contactsService = inject(ContactsService);
    private readonly tasksService = inject(TasksService);
    protected readonly taskToastService = inject(TaskToastService);
    protected readonly urgentHighlightService = inject(UrgentHighlightService);

    protected readonly tasks = signal<BoardTask[]>([]);
    protected selectedTask: BoardTask | null = null;
    protected dragOverStatus: TaskStatus | null = null;
    private draggedTaskId: number | null = null;
    protected dragBeforeId?: number;
    protected searchTerm = '';
    protected isAddTaskOpen = false;
    protected editingTask: BoardTask | null = null;
    private readonly settledUrgentTaskIds = new Set<number>();

    protected readonly columns: BoardColumn[] = [
        { title: 'To do', status: 'todo', emptyMessage: 'No tasks To do' },
        { title: 'In progress', status: 'in-progress', emptyMessage: 'No tasks in progress' },
        {
            title: 'Await feedback',
            status: 'await-feedback',
            emptyMessage: 'No tasks Await feedback',
        },
        { title: 'Done', status: 'done', emptyMessage: 'No tasks Done' },
    ];

    /** Loads contacts and tasks, then starts mirroring changes from other sessions. */
    async ngOnInit(): Promise<void> {
        await Promise.all([this.contactsService.loadContacts(), this.tasksService.loadTasks()]);
        this.tasks.set(this.tasksService.tasks());
        this.tasksService.subscribeToChanges(() => this.tasks.set(this.tasksService.tasks()));
    }

    /** Stops mirroring remote changes and clears the urgent highlight. */
    ngOnDestroy(): void {
        void this.tasksService.unsubscribeFromChanges();
        this.urgentHighlightService.consume();
    }

    /**
     * Picks the tasks of one column.
     * @param status - Column to read.
     * @returns Tasks currently in that column.
     */
    protected tasksFor(status: TaskStatus): BoardTask[] {
        return this.tasks().filter((task) => task.status === status);
    }

    /**
     * Applies the search to one column; the term takes effect from three characters.
     * @param status - Column to read.
     * @returns Matching tasks, or all of them while the term is still short.
     */
    protected filteredTasksFor(status: TaskStatus): BoardTask[] {
        const term = this.searchTerm.toLowerCase().trim();
        const columnTasks = this.tasksFor(status);

        if (term.length < 3) {
            return columnTasks;
        }

        return columnTasks.filter(
            (task) =>
                task.title.toLowerCase().includes(term) ||
                task.description.toLowerCase().includes(term),
        );
    }

    /**
     * Stores what was typed into the search field.
     * @param event - Input event from the search field.
     */
    protected onSearchInput(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    /** Empties the search field and shows all tasks again. */
    protected clearSearch(): void {
        this.searchTerm = '';
    }

    /**
     * Reports whether a column shows its no-results message.
     * @param status - Column to check.
     * @returns `true` when a search is active and the column has no match.
     */
    protected hasNoResults(status: TaskStatus): boolean {
        return this.searchTerm.trim().length >= 3 && this.filteredTasksFor(status).length === 0;
    }

    /**
     * Reports whether a card still pulses after the summary asked for the highlight.
     * @param task - Task on the card.
     * @returns `true` for urgent tasks the user has not opened yet.
     */
    protected isPulsing(task: BoardTask): boolean {
        return (
            this.urgentHighlightService.highlightUrgent() &&
            task.priority === 'urgent' &&
            !this.settledUrgentTaskIds.has(task.id)
        );
    }

    /**
     * Opens a task in the detail overlay and stops its highlight.
     * @param task - Task that was clicked.
     */
    protected selectTask(task: BoardTask): void {
        this.settledUrgentTaskIds.add(task.id);
        this.selectedTask = task;
    }

    /**
     * Notes which task is being dragged and prepares the transfer data.
     * @param event - Drag start reported by the card, together with its task.
     */
    protected startDrag(event: { event: DragEvent; task: BoardTask }): void {
        this.draggedTaskId = event.task.id;
        event.event.dataTransfer?.setData('text/plain', String(event.task.id));
        if (event.event.dataTransfer) event.event.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Marks a column as a valid drop target and remembers the insert position.
     * @param event - Drag-over event.
     * @param status - Column being hovered.
     * @param beforeId - Task to insert before, absent when dropping at the end.
     */
    protected allowDrop(event: DragEvent, status: TaskStatus, beforeId?: number): void {
        event.preventDefault();
        if (beforeId) event.stopPropagation();
        this.dragBeforeId = beforeId;
        this.dragOverStatus = status;
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    }

    /**
     * Works out the insert position while the pointer hovers over a card.
     * @param event - Drag-over event on the card.
     * @param status - Column being hovered.
     * @param task - Card under the pointer.
     */
    protected allowTaskDrop(event: DragEvent, status: TaskStatus, task: BoardTask): void {
        const columnTasks = this.tasksFor(status).filter((item) => item.id !== this.draggedTaskId);
        const beforeId = getDropBeforeId(columnTasks, task.id, isDropBeforeCard(event));
        this.allowDrop(event, status, beforeId);
    }

    /**
     * Drops the dragged task into a column.
     * @param event - Drop event.
     * @param status - Column dropped into.
     * @param beforeId - Task to insert before; falls back to the hovered position.
     */
    protected dropTask(event: DragEvent, status: TaskStatus, beforeId?: number): void {
        event.preventDefault();
        event.stopPropagation();
        const targetBeforeId = beforeId ?? this.dragBeforeId;
        if (this.draggedTaskId) this.moveTask(this.draggedTaskId, status, targetBeforeId);
        this.clearDragState();
    }

    /**
     * Drops the dragged task onto a card and inserts it at that card's position.
     * @param event - Drop event on the card.
     * @param status - Column dropped into.
     * @param task - Card the drop landed on.
     */
    protected dropOnTask(event: DragEvent, status: TaskStatus, task: BoardTask): void {
        const beforeId = this.dragOverStatus === status ? this.dragBeforeId : task.id;
        this.dropTask(event, status, beforeId);
    }

    /** Forgets the dragged task and the hovered drop position. */
    protected clearDragState(): void {
        this.draggedTaskId = null;
        this.dragOverStatus = null;
        this.dragBeforeId = undefined;
    }

    /**
     * Reports whether a task has a slot above it in its column.
     * @param task - Task to check.
     * @returns `true` when it is not the first one.
     */
    protected canMoveUp(task: BoardTask): boolean {
        return this.tasksFor(task.status).findIndex((item) => item.id === task.id) > 0;
    }

    /**
     * Reports whether a task has a slot below it in its column.
     * @param task - Task to check.
     * @returns `true` when it is not the last one.
     */
    protected canMoveDown(task: BoardTask): boolean {
        const columnTasks = this.tasksFor(task.status);
        return columnTasks.findIndex((item) => item.id === task.id) < columnTasks.length - 1;
    }

    /**
     * Reports whether the drop indicator is drawn in front of a card.
     * @param task - Task on the card.
     * @returns `true` while the dragged task would land before it.
     */
    protected isDropBefore(task: BoardTask): boolean {
        return (
            this.dragOverStatus === task.status &&
            this.dragBeforeId === task.id &&
            this.draggedTaskId !== task.id
        );
    }

    /**
     * Carries out a move asked for through a card's move menu.
     * @param request - Target column, or the direction to move within the column.
     */
    protected moveFromMenu(request: TaskMoveRequest): void {
        if (request.status) this.moveTask(request.task.id, request.status);
        if (request.direction) this.moveWithinColumn(request.task, request.direction);
    }

    /**
     * Moves a task one slot up or down; ignored at the ends of the column.
     * @param task - Task to move.
     * @param direction - Whether to move up or down.
     */
    private moveWithinColumn(task: BoardTask, direction: TaskMoveDirection): void {
        const columnTasks = this.tasksFor(task.status);
        const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 2;
        if (direction === 'up' && currentIndex < 1) return;
        if (direction === 'down' && currentIndex >= columnTasks.length - 1) return;
        this.moveTask(task.id, task.status, columnTasks[targetIndex]?.id);
    }

    /**
     * Reorders the tasks locally and writes the new positions to Supabase.
     * @param taskId - Task to move.
     * @param status - Column the task now belongs to.
     * @param beforeId - Task to insert before; appends when absent.
     */
    private moveTask(taskId: number, status: TaskStatus, beforeId?: number): void {
        const tasks = [...this.tasks()];
        const sourceIndex = tasks.findIndex((task) => task.id === taskId);
        if (sourceIndex < 0) return;
        const [sourceTask] = tasks.splice(sourceIndex, 1);
        const targetIndex = beforeId ? tasks.findIndex((task) => task.id === beforeId) : -1;
        const updatedTask = { ...sourceTask, status };
        tasks.splice(targetIndex < 0 ? tasks.length : targetIndex, 0, updatedTask);
        this.tasks.set(this.updatePositions(tasks));
        void this.savePositions();
    }

    /**
     * Renumbers the tasks so every column counts from zero again.
     * @param tasks - Tasks in their new order.
     * @returns The same tasks with their position updated.
     */
    private updatePositions(tasks: BoardTask[]): BoardTask[] {
        return tasks.map((task) => ({
            ...task,
            position: tasks.filter((item) => item.status === task.status).indexOf(task),
        }));
    }

    /** Writes the current column and position of every task to Supabase. */
    private async savePositions(): Promise<void> {
        await Promise.all(
            this.tasks().map((task) =>
                this.tasksService.updateTaskPosition(task.id, task.status, task.position),
            ),
        );
    }

    /**
     * Maps a task to the shape the detail overlay expects.
     * @param task - Task to show.
     * @returns Task ready for the overlay.
     */
    protected toDetailData(task: BoardTask) {
        return toTaskDetailData(task);
    }

    /** Closes the detail overlay. */
    protected closeTaskDetail(): void {
        this.selectedTask = null;
    }

    /**
     * Applies a subtask tick from the overlay to the board and to Supabase.
     * @param change - Index of the subtask and its new done state.
     */
    protected updateSubtask(change: { index: number; done: boolean }): void {
        if (!this.selectedTask) return;
        const subtasks = this.selectedTask.subtasks.map((subtask, index) =>
            index === change.index ? { ...subtask, completed: change.done } : subtask,
        );
        const updatedTask = { ...this.selectedTask, subtasks };
        this.selectedTask = updatedTask;
        this.tasks.update((tasks) =>
            tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
        void this.tasksService.updateTask(updatedTask.id, { subtasks });
    }

    /** Deletes the task shown in the overlay, refusing dummy tasks. */
    protected async deleteTask(): Promise<void> {
        const task = this.selectedTask;
        if (!task) return;
        if (task.isProtected) {
            this.taskToastService.taskLocked();
            return;
        }
        const deleted = await this.tasksService.deleteTask(task.id);
        if (!deleted) return;
        this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
        this.selectedTask = null;
        this.taskToastService.taskDeleted();
    }

    /** Opens the add-task overlay with an empty form. */
    protected openAddTask(): void {
        this.editingTask = null;
        this.isAddTaskOpen = true;
    }

    /** Opens the add-task overlay filled with the selected task, refusing dummy tasks. */
    protected openEditTask(): void {
        if (this.selectedTask?.isProtected) {
            this.taskToastService.taskLocked();
            return;
        }
        this.editingTask = this.selectedTask;
        this.selectedTask = null;
        this.isAddTaskOpen = true;
    }

    /** Closes the add-task overlay and drops the task being edited. */
    protected closeAddTask(): void {
        this.isAddTaskOpen = false;
        this.editingTask = null;
    }

    /** Takes over the task list after the overlay saved a task. */
    protected onTaskCreated(): void {
        this.tasks.set(this.tasksService.tasks());
    }
}
