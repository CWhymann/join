import { Contact } from '../../core/models/contact.model';

export type TaskStatus = 'todo' | 'in-progress' | 'await-feedback' | 'done';
export type TaskPriority = 'urgent' | 'medium' | 'low';
export type TaskCategory = 'User Story' | 'Technical Task';
export type TaskMoveDirection = 'up' | 'down';
export type TaskAssignee = Pick<Contact, 'id' | 'name' | 'color'>;

export interface TaskMoveOption {
  title: string;
  status: TaskStatus;
}

export interface TaskMoveRequest {
  task: BoardTask;
  status?: TaskStatus;
  direction?: TaskMoveDirection;
}

export interface BoardSubtask {
  id: string;
  title: string;
  completed: boolean;
}

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

export type NewTask = Omit<TaskRow, 'id' | 'created_at' | 'is_protected'>;
