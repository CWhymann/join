import { BoardTask } from './board-task.model';

/**
 * Builds the tilted copy of a card that follows the pointer while dragging.
 * @param card - Card element being dragged.
 * @returns Detached clone parked off screen; the caller removes it again.
 */
export function createDragImage(card: HTMLElement): HTMLElement {
    const dragImage = card.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'fixed';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.opacity = '1';
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    return dragImage;
}

/**
 * Reports whether a drag event carries pointer coordinates.
 * @param event - Drag event to inspect.
 * @returns `true` when both coordinates are present.
 */
function hasPointerPosition(event: DragEvent): boolean {
    return typeof event.clientX === 'number' && typeof event.clientY === 'number';
}

/**
 * Decides which side of a card the drop lands on.
 * @param event - Drop event on the card's slot.
 * @returns `true` when the pointer sits before the middle of the card.
 */
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

/**
 * Names the task the dropped one is inserted in front of.
 * @param tasks - Tasks of the target column, in display order.
 * @param taskId - Task the drop happened on.
 * @param isBefore - Whether the drop landed before that task.
 * @returns Id to insert before, or `undefined` when the task goes last.
 */
export function getDropBeforeId(
    tasks: BoardTask[],
    taskId: number,
    isBefore: boolean,
): number | undefined {
    if (isBefore) return taskId;
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    return tasks[taskIndex + 1]?.id;
}
