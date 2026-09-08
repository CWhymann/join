import { BoardTask, TaskAssignee, TaskPriority } from './board-task.model';

/**
 * Capitalises a priority for the detail overlay.
 * @param priority - Priority as stored on the task.
 * @returns Same priority with a leading capital letter.
 */
function formatPriority(priority: TaskPriority): 'Urgent' | 'Medium' | 'Low' {
    return (priority.charAt(0).toUpperCase() + priority.slice(1)) as 'Urgent' | 'Medium' | 'Low';
}

/**
 * Maps an assignee to the avatar the detail overlay draws.
 * @param assignee - Contact assigned to the task.
 * @returns Initials, name and color for the avatar.
 */
function toAssignedContact(assignee: TaskAssignee) {
    return {
        initials: assignee.name
            .split(' ')
            .map((name) => name[0])
            .join(''),
        name: assignee.name,
        color: assignee.color,
    };
}

/**
 * Maps a board task to the shape the detail overlay expects.
 * @param task - Task shown on the board.
 * @returns Task with capitalised priority and avatar-ready assignees.
 */
export function toTaskDetailData(task: BoardTask) {
    return {
        isProtected: task.isProtected,
        category: task.category,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: formatPriority(task.priority),
        assignedTo: task.assignees.map(toAssignedContact),
        subtasks: task.subtasks.map((subtask) => ({ title: subtask.title, done: subtask.completed })),
    };
}
