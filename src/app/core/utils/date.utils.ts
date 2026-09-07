import { AbstractControl, ValidationErrors } from '@angular/forms';

export const DATE_SEPARATOR = '/';
export const DATE_LENGTH = 10;
export const YEAR_RANGE = 4;

const MAX_DAY = 31;
const MAX_MONTH = 12;

/**
 * Reads a one- or two-digit day or month from the digit string.
 * @param digits - Input reduced to digits.
 * @param index - Position to read from.
 * @param max - Highest value the segment may take.
 * @returns The segment and the position after it.
 */
function readSegment(digits: string, index: number, max: number): [string, number] {
    const first = digits[index];
    if (!first) {
        return ['', index];
    }

    const pair = digits.slice(index, index + 2);
    if (pair.length === 2) {
        const isValid = Number(pair) >= 1 && Number(pair) <= max;
        return isValid ? [pair, index + 2] : [first, index + 2];
    }

    return Number(first) * 10 > max ? [`0${first}`, index + 1] : [first, index + 1];
}

/**
 * Joins the date parts, stopping at the first incomplete one.
 * @param day - Day segment.
 * @param month - Month segment.
 * @param year - Year segment.
 * @returns Partial or complete `dd/mm/yyyy` string.
 */
function joinDateParts(day: string, month: string, year: string): string {
    if (day.length < 2) {
        return day;
    }

    if (month.length < 2) {
        return `${day}${DATE_SEPARATOR}${month}`;
    }

    return `${day}${DATE_SEPARATOR}${month}${DATE_SEPARATOR}${year}`;
}

/**
 * Formats raw keystrokes into a date while the user types.
 * @param value - Current input value, digits and separators mixed.
 * @returns Input reformatted towards `dd/mm/yyyy`.
 */
export function formatDateInput(value: string): string {
    const digits = value.replace(/\D/g, '');
    const [day, afterDay] = readSegment(digits, 0, MAX_DAY);
    const [month, afterMonth] = readSegment(digits, afterDay, MAX_MONTH);

    return joinDateParts(day, month, digits.slice(afterMonth, afterMonth + 4));
}

/**
 * Parses a complete date string.
 * @param value - Date as `dd/mm/yyyy`.
 * @returns Parsed date, or `null` when incomplete or not a real day.
 */
export function parseDate(value: string): Date | null {
    if (value.length !== DATE_LENGTH) {
        return null;
    }

    const [day, month, year] = value.split(DATE_SEPARATOR).map(Number);
    const date = new Date(year, month - 1, day);
    const isReal = date.getDate() === day && date.getMonth() === month - 1;

    return isReal ? date : null;
}

/**
 * Formats a date for the input field.
 * @param date - Date to format.
 * @returns Date as `dd/mm/yyyy` with padded day and month.
 */
export function formatDate(date: Date): string {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');

    return `${day}${DATE_SEPARATOR}${month}${DATE_SEPARATOR}${date.getFullYear()}`;
}

/**
 * Validates the due date field.
 * @param control - Form control holding the date string.
 * @returns `invalidDate`, `yearRange` or `pastDate` error, or `null` when valid.
 */
export function dueDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value as string) ?? '';
    if (!value) {
        return null;
    }

    const date = parseDate(value);
    if (!date) {
        return { invalidDate: true };
    }
    return checkDateRange(date);
}

/**
 * Checks a date against today and the allowed year range.
 * @param date - Date to check.
 * @returns `yearRange` or `pastDate` error, or `null` when allowed.
 */
function checkDateRange(date: Date): ValidationErrors | null {
    const today = new Date();
    const minYear = today.getFullYear();

    if (date.getFullYear() < minYear || date.getFullYear() > minYear + YEAR_RANGE) {
        return { yearRange: true };
    }
    today.setHours(0, 0, 0, 0);
    return date < today ? { pastDate: true } : null;
}

/**
 * Reports whether a date can be picked in the calendar.
 * @param date - Date to check.
 * @returns `true` when the date is today or later and within range.
 */
export function isDateAllowed(date: Date): boolean {
    return checkDateRange(date) === null;
}
