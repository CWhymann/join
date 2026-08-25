import { isDateAllowed, parseDate } from './date.utils';

export interface DayCell {
    date: Date;
    day: number;
    inMonth: boolean;
    disabled: boolean;
    selected: boolean;
}

const DAYS_PER_WEEK = 7;
const VISIBLE_DAYS = 42;

function addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date): Date {
    return addDays(date, -((date.getDay() + 6) % DAYS_PER_WEEK));
}

function createCell(date: Date, month: number, selected: Date | null): DayCell {
    return {
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === month,
        disabled: !isDateAllowed(date),
        selected: !!selected && date.getTime() === selected.getTime(),
    };
}

export function buildMonthDays(viewDate: Date, value: string): DayCell[] {
    const first = startOfWeek(startOfMonth(viewDate));
    const selected = parseDate(value);

    return Array.from({ length: VISIBLE_DAYS }, (_, index) =>
        createCell(addDays(first, index), viewDate.getMonth(), selected),
    );
}
