import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DummyTask {
    title: string;
    description: string;
}

@Component({
    selector: 'app-task-search-test',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './task-search-test.html',
    styleUrl: './task-search-test.scss',
})
export class TaskSearchTest {
    searchTerm = signal('');

    tasks = signal<DummyTask[]>([
        {
            title: 'Kochwelt Page & Recipe Recommender',
            description: 'Build start page with recipe recommendation.',
        },
        {
            title: 'HTML Base Template Creation',
            description: 'Create reusable HTML base templates.',
        },
        {
            title: 'Daily Kochwelt Recipe',
            description: 'Implement daily recipe and portion calculator.',
        },
        {
            title: 'CSS Architecture Planning',
            description: 'Define CSS naming conventions and structure.',
        },
        { title: 'Contact Form & Imprint', description: 'Create a contact form and imprint page.' },
    ]);

    filteredTasks = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();

        if (term.length < 3) {
            return this.tasks();
        }

        return this.tasks().filter(
            (task) =>
                task.title.toLowerCase().includes(term) ||
                task.description.toLowerCase().includes(term),
        );
    });

    showNoResults = computed(
        () => this.searchTerm().trim().length >= 3 && this.filteredTasks().length === 0,
    );

    onSearchInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchTerm.set(value);
    }

    clearSearch(): void {
        this.searchTerm.set('');
    }
}
