import { BoardTask } from './board-task.model';

const assignees = {
  sofia: { id: 69, name: 'Sofia Müller', color: '#00bee8' },
  benedikt: { id: 70, name: 'Benedikt Ziegler', color: '#9327ff' },
  emanuel: { id: 71, name: 'Emanuel Mauer', color: '#1fd7c1' },
  marcel: { id: 72, name: 'Marcel Bauer', color: '#462f8a' },
  anton: { id: 73, name: 'Anton Mayer', color: '#0038ff' },
  anja: { id: 74, name: 'Anja Schulz', color: '#ff7a00' },
  david: { id: 75, name: 'David Eisenberg', color: '#6e52ff' },
  franziska: { id: 76, name: 'Franziska Roth', color: '#fc71ff' },
  hannah: { id: 77, name: 'Hannah Vogel', color: '#ff5eb3' },
  julia: { id: 78, name: 'Julia Brandt', color: '#1fd7c1' },
};

export const BOARD_TASKS: BoardTask[] = [
  {
    id: 1,
    category: 'User Story',
    title: 'Kochwelt Page & Recipe Recommender',
    description: 'Build start page with recipe recommendation.',
    dueDate: '2026-08-31',
    status: 'in-progress',
    priority: 'medium',
    position: 0,
    isProtected: false,
    assignees: [
      assignees.sofia,
      assignees.benedikt,
      assignees.emanuel,
      assignees.marcel,
      assignees.anton,
      assignees.anja,
      assignees.david,
      assignees.franziska,
      assignees.hannah,
      assignees.julia,
    ],
    subtasks: [
      { id: 'subtask-1', title: 'Build page structure', completed: true },
      { id: 'subtask-2', title: 'Add recipes', completed: false },
    ],
  },
  {
    id: 2,
    category: 'Technical Task',
    title: 'HTML Base Template Creation',
    description: 'Create reusable HTML base templates.',
    dueDate: '2026-09-01',
    status: 'in-progress',
    priority: 'low',
    position: 1,
    isProtected: false,
    assignees: [assignees.anton, assignees.sofia, assignees.benedikt],
    subtasks: [
      { id: 'subtask-3', title: 'Create template', completed: true },
      { id: 'subtask-4', title: 'Review structure', completed: true },
    ],
  },
];
