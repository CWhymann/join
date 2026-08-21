import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TaskDetail } from './task-detail';

describe('TaskDetail', () => {
    let component: TaskDetail;
    let fixture: ComponentFixture<TaskDetail>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskDetail],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskDetail);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close when the outer overlay is clicked', () => {
        const closeSpy = vi.fn();
        component.closeClicked.subscribe(closeSpy);
        const overlay = document.createElement('div');

        component.onOverlayClick({ target: overlay, currentTarget: overlay } as unknown as MouseEvent);

        expect(closeSpy).toHaveBeenCalled();
    });

    it('should stay open when the task card is clicked', () => {
        const closeSpy = vi.fn();
        component.closeClicked.subscribe(closeSpy);

        component.onOverlayClick({
            target: document.createElement('div'),
            currentTarget: document.createElement('div'),
        } as unknown as MouseEvent);

        expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should close when Escape is pressed', () => {
        const closeSpy = vi.fn();
        component.closeClicked.subscribe(closeSpy);

        component.onEscape();

        expect(closeSpy).toHaveBeenCalled();
    });
});
