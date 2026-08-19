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

  it('should render an empty-state hint for every column', () => {
    const element = fixture.nativeElement as HTMLElement;
    const emptyStates = element.querySelectorAll('.board__empty-state');

    expect(emptyStates).toHaveLength(4);
  });

  it('should render add buttons for every open column', () => {
    const element = fixture.nativeElement as HTMLElement;
    const addButtons = element.querySelectorAll('.board__column-add');

    expect(addButtons).toHaveLength(3);
  });
});
