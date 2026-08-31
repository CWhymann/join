import { AbstractControl, ValidationErrors } from '@angular/forms';

const READABLE_TEXT = /[\p{L}\p{N}]/u;

export function hasReadableText(value: string): boolean {
    return READABLE_TEXT.test(value);
}

export function readableTextValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value as string) ?? '';

    return !value.trim() || hasReadableText(value) ? null : { noReadableText: true };
}
