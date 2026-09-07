import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/** Passes the request to highlight urgent tasks from the summary to the board. */
export class UrgentHighlightService {
    private readonly highlightUrgentSignal = signal<boolean>(false);
    readonly highlightUrgent = this.highlightUrgentSignal.asReadonly();

    /** Raises the highlight flag. */
    trigger(): void {
        this.highlightUrgentSignal.set(true);
    }

    /** Clears the highlight flag once the board has read it. */
    consume(): void {
        this.highlightUrgentSignal.set(false);
    }
}
