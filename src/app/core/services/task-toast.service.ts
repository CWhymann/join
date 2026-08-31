import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskToastService {
    show = signal(false);
    message = signal('');

    showToast(message: string): void {
        this.message.set(message);
        this.show.set(true);
        setTimeout(() => this.show.set(false), 2500);
    }

    taskCreated(): void {
        this.showToast('Task edit to Board');
    }

    taskSaved(): void {
        this.showToast('Task saved');
    }

    taskDeleted(): void {
        this.showToast('Task deleted');
    }

    taskLocked(): void {
        this.showToast("Dummy-Task can't be deleted or edited");
    }
}
