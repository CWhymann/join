import { AbstractControl, ValidationErrors } from '@angular/forms';

export const EMAIL_PATTERN = /^[\w+-]+(\.[\w+-]+)*@([a-z\d]([a-z\d-]*[a-z\d])?\.){1,3}[a-z]{2,}$/i;
export const MIN_PASSWORD_LENGTH = 6;

export function fullNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = (control.value ?? '').trim();
    if (!name) return null;
    const hasValidCharacters = /^\p{L}+([ '-]\p{L}+)*$/u.test(name);
    const hasFirstAndLastName = name.split(/\s+/).length >= 2;
    return hasValidCharacters && hasFirstAndLastName ? null : { invalidName: true };
}
