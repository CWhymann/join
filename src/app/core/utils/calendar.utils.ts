import { isDateAllowed, parseDate } from './date.utils';

/** One day cell in the date picker grid. */
export interface DayCell {
    date: Date;
    day: number;
    inMonth: boolean;
    disabled: boolean;
    selected: boolean;
}

const DAYS_PER_WEEK = 7;
const VISIBLE_DAYS = 42;

/**
 * Shifts a date by a number of days.
 * @param date - Starting date.
 * @param days - Days to add; negative values move backwards.
 * @returns New date at midnight local time.
 */
function addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * Returns the first day of the month a date falls in.
 * @param date - Any date within the month.
 * @returns First day of that month.
 */
export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Returns the Monday of the week a date falls in.
 * @param date - Any date within the week.
 * @returns Monday of that week.
 */
function startOfWeek(date: Date): Date {
    return addDays(date, -((date.getDay() + 6) % DAYS_PER_WEEK));
}

/**
 * Builds a single day cell for the calendar grid.
 * @param date - Date the cell represents.
 * @param month - Zero-based month currently shown.
 * @param selected - Currently selected date, or `null`.
 * @returns Cell with its display and state flags.
 */
function createCell(date: Date, month: number, selected: Date | null): DayCell {
    return {
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === month,
        disabled: !isDateAllowed(date),
        selected: !!selected && date.getTime() === selected.getTime(),
    };
}

/**
 * Builds the six-week grid shown for one month.
 * @param viewDate - Any date within the month to display.
 * @param value - Selected date as `dd/mm/yyyy`, empty when none.
 * @returns 42 cells starting on the Monday before the first of the month.
 */
export function buildMonthDays(viewDate: Date, value: string): DayCell[] {
    const first = startOfWeek(startOfMonth(viewDate));
    const selected = parseDate(value);

    return Array.from({ length: VISIBLE_DAYS }, (_, index) =>
        createCell(addDays(first, index), viewDate.getMonth(), selected),
    );
}
