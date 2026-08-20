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
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: TaskAssignee[];
  subtasks: BoardSubtask[];
}
