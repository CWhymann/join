import { computed, inject, Injectable, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BoardTask, NewTask, TaskRow } from '../../components/board/board-task.model';
import { ContactsService } from './contacts.service';
import { SupabaseService } from './supabase.service';

const TABLE = 'tasks';

@Injectable({ providedIn: 'root' })
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

  async loadTasks(): Promise<void> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).select('*').order('position');
    if (error) return this.failRequest(error.message, undefined);
    this.rowsSignal.set((data ?? []) as TaskRow[]);
    this.loadingSignal.set(false);
  }

  async addTask(task: NewTask): Promise<BoardTask | null> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).insert(task).select().single();
    if (error) return this.failRequest(error.message, null);
    await this.loadTasks();
    return this.toBoardTask(data as TaskRow);
  }

  async updateTask(id: number, changes: Partial<NewTask>): Promise<boolean> {
    this.startRequest();
    const { error } = await this.supabase.from(TABLE).update(changes).eq('id', id);
    if (error) return this.failRequest(error.message, false);
    await this.loadTasks();
    return true;
  }

  async updateTaskPosition(id: number, status: TaskRow['status'], position: number): Promise<boolean> {
    const { error } = await this.supabase.from(TABLE).update({ status, position }).eq('id', id);
    if (error) return this.failRequest(error.message, false);
    return true;
  }

  async deleteTask(id: number): Promise<boolean> {
    this.startRequest();
    const { data, error } = await this.supabase.from(TABLE).delete().eq('id', id).select('id');
    if (error || !data?.length) return this.failRequest(error?.message ?? 'Task could not be deleted', false);
    await this.loadTasks();
    return true;
  }

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

  async unsubscribeFromChanges(): Promise<void> {
    if (!this.realtimeChannel) return;
    await this.supabase.removeChannel(this.realtimeChannel);
    this.realtimeChannel = undefined;
  }

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

  private resolveAssignees(ids: number[] | null) {
    return this.contactsService.contacts().filter((contact) => (ids ?? []).includes(contact.id));
  }

  private startRequest(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  private failRequest<T>(message: string, result: T): T {
    this.errorSignal.set(message);
    this.loadingSignal.set(false);
    return result;
  }
}
