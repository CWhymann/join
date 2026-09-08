import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EMAIL_PATTERN, fullNameValidator, MIN_PASSWORD_LENGTH } from '../utils/validation.utils';

/** Keeps the auth forms and the card the user was on while the legal pages are open. */
@Injectable({ providedIn: 'root' })
export class AuthFormStateService {
    private readonly formBuilder = inject(FormBuilder);

    readonly isSignUp = signal(false);
    readonly showSplash = signal(true);
    readonly loginForm = this.formBuilder.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
    });

    readonly signUpForm = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(40), fullNameValidator]],
        email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(80)]],
        password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
        confirmPassword: ['', Validators.required],
        acceptedPrivacy: [false, Validators.requiredTrue],
    });

    /** Empties both forms and puts the page back to its first state. */
    reset(): void {
        this.loginForm.reset();
        this.signUpForm.reset();
        this.isSignUp.set(false);
        this.showSplash.set(true);
    }
}
