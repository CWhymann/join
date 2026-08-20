import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Board } from './board';

describe('Board', () => {
  let fixture: ComponentFixture<Board>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Board],
    }).compileComponents();

    fixture = TestBed.createComponent(Board);
    fixture.detectChanges();
  });

  it('should render all four board columns', () => {
    const element = fixture.nativeElement as HTMLElement;
    const headings = element.querySelectorAll('.board__column-title');

    expect(headings).toHaveLength(4);
  });

  it('should render an empty-state hint for every empty column', () => {
    const element = fixture.nativeElement as HTMLElement;
    const emptyStates = element.querySelectorAll('.board__empty-state');

    expect(emptyStates).toHaveLength(3);
  });

  it('should render add buttons for every open column', () => {
    const element = fixture.nativeElement as HTMLElement;
    const addButtons = element.querySelectorAll('.board__column-add');

    expect(addButtons).toHaveLength(3);
  });

  it('should render the prepared board tasks', () => {
    const element = fixture.nativeElement as HTMLElement;
    const taskCards = element.querySelectorAll('.task-card');

    expect(taskCards).toHaveLength(2);
  });

  it('should select a task when its card is clicked', () => {
    const element = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as { selectedTask: { id: string } | null };

    element.querySelector<HTMLElement>('.task-card')?.click();
    fixture.detectChanges();

    expect(component.selectedTask?.id).toBe('task-1');
  });

  it('should move a task to another column', () => {
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('.board__column[data-status="in-progress"] .task-card');
    const target = element.querySelector('.board__column[data-status="todo"]');

    card?.dispatchEvent(new Event('dragstart', { bubbles: true }));
    target?.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(target?.querySelectorAll('.task-card')).toHaveLength(1);
  });

  it('should move a task through the mobile menu', () => {
    const element = fixture.nativeElement as HTMLElement;
    const firstCard = element.querySelector('.task-card');
    const component = fixture.componentInstance as unknown as { selectedTask: { id: string } | null };

    firstCard?.querySelector<HTMLElement>('.task-card__move-toggle')?.click();
    fixture.detectChanges();
    expect(component.selectedTask).toBeNull();
    const moveToDone = [...(firstCard?.querySelectorAll('button') ?? [])]
      .find((button) => button.textContent?.includes('Move to Done'));
    moveToDone?.click();
    fixture.detectChanges();

    const done = element.querySelector('.board__column[data-status="done"]');
    expect(done?.querySelectorAll('.task-card')).toHaveLength(1);
  });

  it('should reorder tasks inside a column', () => {
    const element = fixture.nativeElement as HTMLElement;
    const column = element.querySelector('.board__column[data-status="in-progress"]');
    const cards = column?.querySelectorAll('.task-card');
    const firstSlot = column?.querySelector('.board__task-slot');

    cards?.item(1).dispatchEvent(new Event('dragstart', { bubbles: true }));
    firstSlot?.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(column?.querySelector('.task-card__title')?.textContent).toContain('HTML Base');
  });

  it('should summarize additional assignees', () => {
    const element = fixture.nativeElement as HTMLElement;
    const additionalAssignees = element.querySelector('.task-card__avatar--more');

    expect(additionalAssignees?.textContent).toContain('+7');
  });

  it('should keep each task column vertically scrollable', () => {
    const element = fixture.nativeElement as HTMLElement;
    const content = element.querySelector('.board__column-content');

    expect(getComputedStyle(content as Element).overflowY).toBe('auto');
  });

});
