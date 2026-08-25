import { AbstractControl, ValidationErrors } from '@angular/forms';

export const DATE_SEPARATOR = '/';
export const DATE_LENGTH = 10;
export const YEAR_RANGE = 4;

const MAX_DAY = 31;
const MAX_MONTH = 12;

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

function joinDateParts(day: string, month: string, year: string): string {
    if (day.length < 2) {
        return day;
    }

    if (month.length < 2) {
        return `${day}${DATE_SEPARATOR}${month}`;
    }

    return `${day}${DATE_SEPARATOR}${month}${DATE_SEPARATOR}${year}`;
}

export function formatDateInput(value: string): string {
    const digits = value.replace(/\D/g, '');
    const [day, afterDay] = readSegment(digits, 0, MAX_DAY);
    const [month, afterMonth] = readSegment(digits, afterDay, MAX_MONTH);

    return joinDateParts(day, month, digits.slice(afterMonth, afterMonth + 4));
}

export function parseDate(value: string): Date | null {
    if (value.length !== DATE_LENGTH) {
        return null;
    }

    const [day, month, year] = value.split(DATE_SEPARATOR).map(Number);
    const date = new Date(year, month - 1, day);
    const isReal = date.getDate() === day && date.getMonth() === month - 1;

    return isReal ? date : null;
}

export function formatDate(date: Date): string {
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');

    return `${day}${DATE_SEPARATOR}${month}${DATE_SEPARATOR}${date.getFullYear()}`;
}

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

function checkDateRange(date: Date): ValidationErrors | null {
    const today = new Date();
    const minYear = today.getFullYear();

    if (date.getFullYear() < minYear || date.getFullYear() > minYear + YEAR_RANGE) {
        return { yearRange: true };
    }
    today.setHours(0, 0, 0, 0);
    return date < today ? { pastDate: true } : null;
}

export function isDateAllowed(date: Date): boolean {
    return checkDateRange(date) === null;
}
