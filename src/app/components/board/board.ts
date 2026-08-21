import { Component } from '@angular/core';
import { BoardTask, TaskMoveDirection, TaskMoveRequest, TaskStatus } from './board-task.model';
import { BOARD_TASKS } from './board-tasks.data';
import { TaskCard } from './task-card/task-card';
import { TaskDetail } from './task-detail/task-detail';

interface BoardColumn {
    title: string;
    status: TaskStatus;
    emptyMessage: string;
}

@Component({
    selector: 'app-board',
    standalone: true,
    imports: [TaskCard, TaskDetail],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board {
    protected tasks = [...BOARD_TASKS];
    protected selectedTask: BoardTask | null = null;
    protected dragOverStatus: TaskStatus | null = null;
    private draggedTaskId: string | null = null;
    protected searchTerm = '';

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

    protected tasksFor(status: TaskStatus): BoardTask[] {
        return this.tasks.filter((task) => task.status === status);
    }

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

    protected onSearchInput(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    protected clearSearch(): void {
        this.searchTerm = '';
    }

    protected hasNoResults(status: TaskStatus): boolean {
        return this.searchTerm.trim().length >= 3 && this.filteredTasksFor(status).length === 0;
    }
    protected selectTask(task: BoardTask): void {
        this.selectedTask = task;
    }

    protected startDrag(event: { event: DragEvent; task: BoardTask }): void {
        this.draggedTaskId = event.task.id;
        event.event.dataTransfer?.setData('text/plain', event.task.id);
        if (event.event.dataTransfer) event.event.dataTransfer.effectAllowed = 'move';
    }

    protected allowDrop(event: DragEvent, status: TaskStatus): void {
        event.preventDefault();
        this.dragOverStatus = status;
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    }

    protected dropTask(event: DragEvent, status: TaskStatus, beforeId?: string): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.draggedTaskId) this.moveTask(this.draggedTaskId, status, beforeId);
        this.clearDragState();
    }

    protected clearDragState(): void {
        this.draggedTaskId = null;
        this.dragOverStatus = null;
    }

    protected canMoveUp(task: BoardTask): boolean {
        return this.tasksFor(task.status).findIndex((item) => item.id === task.id) > 0;
    }

    protected canMoveDown(task: BoardTask): boolean {
        const columnTasks = this.tasksFor(task.status);
        return columnTasks.findIndex((item) => item.id === task.id) < columnTasks.length - 1;
    }

    protected moveFromMenu(request: TaskMoveRequest): void {
        if (request.status) this.moveTask(request.task.id, request.status);
        if (request.direction) this.moveWithinColumn(request.task, request.direction);
    }

    private moveWithinColumn(task: BoardTask, direction: TaskMoveDirection): void {
        const columnTasks = this.tasksFor(task.status);
        const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 2;
        if (direction === 'up' && currentIndex < 1) return;
        if (direction === 'down' && currentIndex >= columnTasks.length - 1) return;
        this.moveTask(task.id, task.status, columnTasks[targetIndex]?.id);
    }

    private moveTask(taskId: string, status: TaskStatus, beforeId?: string): void {
        const tasks = [...this.tasks];
        const sourceIndex = tasks.findIndex((task) => task.id === taskId);
        if (sourceIndex < 0) return;
        const [sourceTask] = tasks.splice(sourceIndex, 1);
        const targetIndex = beforeId ? tasks.findIndex((task) => task.id === beforeId) : -1;
        const updatedTask = { ...sourceTask, status };
        tasks.splice(targetIndex < 0 ? tasks.length : targetIndex, 0, updatedTask);
        this.tasks = tasks;
    }
    protected toDetailData(task: BoardTask) {
        return {
            category: task.category,
            title: task.title,
            description: task.description,
            dueDate: '',
            priority: (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) as
                'Urgent' | 'Medium' | 'Low',
            assignedTo: task.assignees.map((a) => ({
                initials: a.name
                    .split(' ')
                    .map((n) => n[0])
                    .join(''),
                name: a.name,
            })),
            subtasks: task.subtasks.map((s) => ({ title: s.title, done: s.completed })),
        };
    }

    protected closeTaskDetail(): void {
        this.selectedTask = null;
    }
}
