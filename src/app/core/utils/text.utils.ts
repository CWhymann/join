import { AbstractControl, ValidationErrors } from '@angular/forms';

const READABLE_TEXT = /[\p{L}\p{N}]/u;

/**
 * Reports whether a value contains at least one letter or digit.
 * @param value - Text to inspect.
 * @returns `true` when readable characters are present.
 */
export function hasReadableText(value: string): boolean {
    return READABLE_TEXT.test(value);
}

/**
 * Rejects input made up only of punctuation or symbols.
 * @param control - Form control holding the text.
 * @returns `noReadableText` error, or `null` when empty or readable.
 */
export function readableTextValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value as string) ?? '';

    return !value.trim() || hasReadableText(value) ? null : { noReadableText: true };
}
