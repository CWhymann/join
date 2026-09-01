import { Component, OnInit, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TasksService } from '../../core/services/tasks.service';
import { UrgentHighlightService } from '../../core/services/urgent-highlight.service';

@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './summary.html',
    styleUrl: './summary.scss',
})
export class Summary implements OnInit {
    private readonly tasksService = inject(TasksService);
    private readonly urgentHighlightService = inject(UrgentHighlightService);
    private readonly router = inject(Router);

    // TODO: connect to auth service once login is implemented
    // e.g. [currentUserName]="user()?.name" from AuthService
    readonly currentUserName = input<string | null>(null);

    readonly greetingText = computed(() => this.getGreetingByHour(new Date().getHours()));

    private readonly tasks = this.tasksService.tasks;

    readonly todoCount = computed(() => this.tasks().filter((t) => t.status === 'todo').length);
    readonly doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);
    readonly inProgressCount = computed(
        () => this.tasks().filter((t) => t.status === 'in-progress').length,
    );
    readonly awaitFeedbackCount = computed(
        () => this.tasks().filter((t) => t.status === 'await-feedback').length,
    );
    readonly totalTasksInBoard = computed(() => this.tasks().length);

    private readonly urgentTasks = computed(() =>
        this.tasks().filter((t) => t.priority === 'urgent'),
    );
    readonly urgentCount = computed(() => this.urgentTasks().length);

    private readonly nextUrgentDeadline = computed(() => {
        const dates = this.urgentTasks()
            .map((t) => t.dueDate)
            .filter(Boolean)
            .sort();
        return dates.length ? dates[0] : null;
    });

    readonly formattedDeadline = computed(() => {
        const date = this.nextUrgentDeadline();
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    });

    ngOnInit(): void {
        this.tasksService.loadTasks();
    }

    onUrgentClick(): void {
        this.urgentHighlightService.trigger();
        this.router.navigate(['/board']);
    }

    private getGreetingByHour(hour: number): string {
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }
}
