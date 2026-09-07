import { computed, inject, Injectable, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BoardTask, NewTask, TaskRow } from '../../components/board/board-task.model';
import { ContactsService } from './contacts.service';
import { SupabaseService } from './supabase.service';

const TABLE = 'tasks';

@Injectable({ providedIn: 'root' })
/** Loads and edits the board tasks and mirrors changes made in other sessions. */
export class TasksService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly contactsService = inject(ContactsService);
  private readonly rowsSignal = signal<TaskRow[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private realtimeChannel?: RealtimeChannel;

  readonly tasks = computed(() => this.rowsSignal().map((row) => this.toBoardTask(row)));
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /** Reloads all tasks, ordered by their position on the board. */
  async loadTasks(): Promise<void> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).select('*').order('position');
    if (error) return this.failRequest(error.message, undefined);
    this.rowsSignal.set((data ?? []) as TaskRow[]);
    this.loadingSignal.set(false);
  }

  /**
   * Creates a task on the board.
   * @param task - Values for the new task.
   * @returns Created task, or `null` when the insert failed.
   */
  async addTask(task: NewTask): Promise<BoardTask | null> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).insert(task).select().single();
    if (error) return this.failRequest(error.message, null);
    await this.loadTasks();
    return this.toBoardTask(data as TaskRow);
  }

  /**
   * Applies changes to one task and reloads the board.
   * @param id - Id of the task to change.
   * @param changes - Fields to overwrite.
   * @returns `true` when the update succeeded.
   */
  async updateTask(id: number, changes: Partial<NewTask>): Promise<boolean> {
    this.startRequest();
    const { error } = await this.supabase.from(TABLE).update(changes).eq('id', id);
    if (error) return this.failRequest(error.message, false);
    await this.loadTasks();
    return true;
  }

  /**
   * Moves a task to another column or slot without reloading the board.
   * @param id - Id of the task to move.
   * @param status - Column the task now belongs to.
   * @param position - Sort position within that column.
   * @returns `true` when the move was stored.
   */
  async updateTaskPosition(id: number, status: TaskRow['status'], position: number): Promise<boolean> {
    const { error } = await this.supabase.from(TABLE).update({ status, position }).eq('id', id);
    if (error) return this.failRequest(error.message, false);
    return true;
  }

  /**
   * Deletes one task.
   * @param id - Id of the task to delete.
   * @returns `true` when a row was removed, `false` when it was blocked or failed.
   */
  async deleteTask(id: number): Promise<boolean> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).delete().eq('id', id).select('id');
    if (error || !data?.length) return this.failRequest(error?.message ?? 'Task could not be deleted', false);
    await this.loadTasks();
    return true;
  }

  /**
   * Starts mirroring task changes from other sessions; ignored when already running.
   * @param onTasksChanged - Called after each reload caused by a remote change.
   */
  subscribeToChanges(onTasksChanged: () => void): void {
    if (this.realtimeChannel) return;
    this.realtimeChannel = this.supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, async () => {
        await this.loadTasks();
        onTasksChanged();
      })
      .subscribe();
  }

  /** Stops mirroring remote task changes. */
  async unsubscribeFromChanges(): Promise<void> {
    if (!this.realtimeChannel) return;
    await this.supabase.removeChannel(this.realtimeChannel);
    this.realtimeChannel = undefined;
  }

  /**
   * Maps a database row to the shape the board renders.
   * @param row - Raw task row from Supabase.
   * @returns Task with its assignees resolved.
   */
  private toBoardTask(row: TaskRow): BoardTask {
    return {
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description ?? '',
      dueDate: row.due_date,
      status: row.status,
      priority: row.priority,
      position: row.position,
      isProtected: row.is_protected,
      assignees: this.resolveAssignees(row.assigned_to),
      subtasks: row.subtasks ?? [],
    };
  }

  /**
   * Resolves assignee ids against the loaded contacts.
   * @param ids - Assigned contact ids, or `null` when nobody is assigned.
   * @returns Matching contacts, empty when none are loaded.
   */
  private resolveAssignees(ids: number[] | null) {
    return this.contactsService.contacts().filter((contact) => (ids ?? []).includes(contact.id));
  }

  /** Marks a request as running and clears the previous error. */
  private startRequest(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  /**
   * Stores an error message, ends the request and hands a fallback back to the caller.
   * @param message - Text to show in the UI.
   * @param result - Value the calling method should return.
   * @returns The given fallback value.
   */
  private failRequest<T>(message: string, result: T): T {
    this.errorSignal.set(message);
    this.loadingSignal.set(false);
    return result;
  }
}
