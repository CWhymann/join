import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSearchTest } from './task-search-test';

describe('TaskSearchTest', () => {
    let component: TaskSearchTest;
    let fixture: ComponentFixture<TaskSearchTest>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskSearchTest],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskSearchTest);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
