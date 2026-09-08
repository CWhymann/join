import { Contact } from '../../core/models/contact.model';

/** Board column a task sits in. */
export type TaskStatus = 'todo' | 'in-progress' | 'await-feedback' | 'done';
/** Priority level of a task. */
export type TaskPriority = 'urgent' | 'medium' | 'low';
/** Category label shown on the task card. */
export type TaskCategory = 'User Story' | 'Technical Task';
/** Direction a task moves within its own column. */
export type TaskMoveDirection = 'up' | 'down';
/** The contact fields a task card needs to draw an avatar. */
export type TaskAssignee = Pick<Contact, 'id' | 'name' | 'color'>;

/** One target column offered in the move menu. */
export interface TaskMoveOption {
  title: string;
  status: TaskStatus;
}

/** A move asked for by a card: to another column, or one slot up or down. */
export interface TaskMoveRequest {
  task: BoardTask;
  status?: TaskStatus;
  direction?: TaskMoveDirection;
}

/** One subtask with its done state. */
export interface BoardSubtask {
  id: string;
  title: string;
  completed: boolean;
}

/** A task in the shape the board renders, with its assignees resolved. */
export interface BoardTask {
  id: number;
  category: TaskCategory;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  isProtected: boolean;
  assignees: TaskAssignee[];
  subtasks: BoardSubtask[];
}

/** A task row as stored in Supabase. */
export interface TaskRow {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  position: number;
  assigned_to: number[] | null;
  subtasks: BoardSubtask[] | null;
  is_protected: boolean;
}

/** Fields needed to create a task; id, timestamp and flag are set by the database. */
export type NewTask = Omit<TaskRow, 'id' | 'created_at' | 'is_protected'>;
