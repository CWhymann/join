import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UrgentHighlightService {
    private readonly highlightUrgentSignal = signal<boolean>(false);
    readonly highlightUrgent = this.highlightUrgentSignal.asReadonly();

    trigger(): void {
        this.highlightUrgentSignal.set(true);
    }

    consume(): void {
        this.highlightUrgentSignal.set(false);
    }
}
