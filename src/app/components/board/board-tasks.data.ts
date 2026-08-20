import { BoardTask } from './board-task.model';

const assignees = {
  sofia: { id: 'sofia', name: 'Sofia Müller', color: '#00bee8' },
  benedikt: { id: 'benedikt', name: 'Benedikt Ziegler', color: '#9327ff' },
  emanuel: { id: 'emanuel', name: 'Emanuel Mauer', color: '#1fd7c1' },
  marcel: { id: 'marcel', name: 'Marcel Bauer', color: '#462f8a' },
  anton: { id: 'anton', name: 'Anton Mayer', color: '#0038ff' },
  anja: { id: 'anja', name: 'Anja Schulz', color: '#ff7a00' },
  david: { id: 'david', name: 'David Eisenberg', color: '#6e52ff' },
  franziska: { id: 'franziska', name: 'Franziska Roth', color: '#fc71ff' },
  hannah: { id: 'hannah', name: 'Hannah Vogel', color: '#ff5eb3' },
  julia: { id: 'julia', name: 'Julia Brandt', color: '#1fd7c1' },
};

export const BOARD_TASKS: BoardTask[] = [
  {
    id: 'task-1',
    category: 'User Story',
    title: 'Kochwelt Page & Recipe Recommender',
    description: 'Build start page with recipe recommendation.',
    status: 'in-progress',
    priority: 'medium',
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
    id: 'task-2',
    category: 'Technical Task',
    title: 'HTML Base Template Creation',
    description: 'Create reusable HTML base templates.',
    status: 'in-progress',
    priority: 'low',
    assignees: [assignees.anton, assignees.sofia, assignees.benedikt],
    subtasks: [
      { id: 'subtask-3', title: 'Create template', completed: true },
      { id: 'subtask-4', title: 'Review structure', completed: true },
    ],
  },
];
