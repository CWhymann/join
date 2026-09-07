import { BoardTask } from './board-task.model';

function hasPointerPosition(event: DragEvent): boolean {
    return typeof event.clientX === 'number' && typeof event.clientY === 'number';
}

export function isDropBeforeCard(event: DragEvent): boolean {
    const target = event.currentTarget as HTMLElement;
    const cardRect = target.querySelector('.task-card')?.getBoundingClientRect();
    if (!cardRect || !hasPointerPosition(event)) return true;

    const isHorizontal = getComputedStyle(target).flexBasis !== 'auto';
    const pointerPosition = isHorizontal ? event.clientX : event.clientY;
    const cardMiddle = isHorizontal
        ? cardRect.left + cardRect.width / 2
        : cardRect.top + cardRect.height / 2;
    return pointerPosition < cardMiddle;
}

export function getDropBeforeId(
    tasks: BoardTask[],
    taskId: number,
    isBefore: boolean,
): number | undefined {
    if (isBefore) return taskId;
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    return tasks[taskIndex + 1]?.id;
}
