import { BoardTask, TaskAssignee, TaskPriority } from './board-task.model';

function formatPriority(priority: TaskPriority): 'Urgent' | 'Medium' | 'Low' {
    return (priority.charAt(0).toUpperCase() + priority.slice(1)) as 'Urgent' | 'Medium' | 'Low';
}

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
