import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
/** Drives the short confirmation toast shown after board and auth actions. */
export class TaskToastService {
    show = signal(false);
    message = signal('');

    /**
     * Shows a toast and hides it again after 2.2 seconds.
     * @param message - Text to display.
     */
    showToast(message: string): void {
        this.message.set(message);
        this.show.set(true);
        setTimeout(() => this.show.set(false), 2200);
    }

    /** Confirms that a task was added to the board. */
    taskCreated(): void {
        this.showToast('Task edit to Board');
    }

    /** Confirms that a task was saved. */
    taskSaved(): void {
        this.showToast('Task saved');
    }

    /** Confirms that a task was deleted. */
    taskDeleted(): void {
        this.showToast('Task deleted');
    }

    /** Warns that a dummy task cannot be edited or deleted. */
    taskLocked(): void {
        this.showToast("Dummy-Task can't be deleted or edited");
    }

    /** Confirms a successful login. */
    login(): void {
        this.showToast('Logged in successfully');
    }

    /** Confirms a successful registration. */
    signUp(): void {
        this.showToast('You Signed Up successfully');
    }

    /** Confirms a successful logout. */
    logout(): void {
        this.showToast('Successfully logged out');
    }
}
