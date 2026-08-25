import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { buildMonthDays, DayCell, startOfMonth } from '../../../../core/utils/calendar.utils';
import { formatDate, parseDate } from '../../../../core/utils/date.utils';

@Component({
    selector: 'app-date-picker',
    standalone: true,
    templateUrl: './date-picker.html',
    styleUrl: './date-picker.scss',
})
export class DatePicker implements OnInit {
    readonly value = input('');
    readonly dateSelected = output<string>();

    protected readonly weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    protected readonly viewDate = signal(startOfMonth(new Date()));
    protected readonly days = computed(() => buildMonthDays(this.viewDate(), this.value()));
    protected readonly monthLabel = computed(() =>
        this.viewDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    );

    ngOnInit(): void {
        this.viewDate.set(startOfMonth(parseDate(this.value()) ?? new Date()));
    }

    protected shiftMonth(offset: number): void {
        const current = this.viewDate();

        this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + offset, 1));
    }

    protected selectDay(cell: DayCell): void {
        this.dateSelected.emit(formatDate(cell.date));
    }
}
