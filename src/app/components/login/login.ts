import { Component, input, output, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface LoginData {
    email: string;
    password: string;
}

export interface SignUpData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptedPrivacy: boolean;
}

export type LoginResult = 'user' | 'guest' | null;

function fullNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value.trim();
    if (!name) return null;
    const hasValidCharacters = /^\p{L}+([ '-]\p{L}+)*$/u.test(name);
    const hasFirstAndLastName = name.split(/\s+/).length >= 2;
    return hasValidCharacters && hasFirstAndLastName ? null : { invalidName: true };
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    readonly errorMessage = input('');
    readonly isLoading = input(false);
    readonly result = input<LoginResult>(null);
    readonly userName = input('');
    readonly loginSubmitted = output<LoginData>();
    readonly guestLoginRequested = output<void>();
    readonly signUpSubmitted = output<SignUpData>();
    readonly greetingFinished = output<void>();

    protected readonly isSignUp = signal(false);
    protected readonly showSplash = signal(true);
    protected readonly showLoginPassword = signal(false);
    protected readonly showSignUpPassword = signal(false);
    protected readonly showConfirmPassword = signal(false);

    protected readonly loginForm = new FormBuilder().nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
    });

    protected readonly signUpForm = new FormBuilder().nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(40), fullNameValidator]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(80)]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        acceptedPrivacy: [false, Validators.requiredTrue],
    });

    protected openSignUp(): void {
        this.isSignUp.set(true);
    }

    protected openLogin(): void {
        this.isSignUp.set(false);
    }

    protected submitLogin(): void {
        if (this.loginForm.invalid || this.isLoading()) return this.loginForm.markAllAsTouched();
        this.loginSubmitted.emit(this.loginForm.getRawValue());
    }

    protected submitSignUp(): void {
        if (this.signUpForm.invalid || this.isLoading()) return this.signUpForm.markAllAsTouched();
        this.signUpSubmitted.emit(this.signUpForm.getRawValue());
    }

    protected finishSplash(): void {
        this.showSplash.set(false);
    }

    protected finishGreeting(): void {
        this.greetingFinished.emit();
    }
}
