import { Component, inject, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export type LoginResult = 'user' | 'guest' | null;

// Matches $breakpoint-mobile: the greeting overlay is only rendered below this width.
const GREETING_MEDIA_QUERY = '(max-width: 767px)';

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
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly errorMessage = signal('');
    protected readonly isLoading = signal(false);
    protected readonly result = signal<LoginResult>(null);
    protected readonly userName = signal('');
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
        this.errorMessage.set('');
        this.isSignUp.set(true);
    }

    protected openLogin(): void {
        this.errorMessage.set('');
        this.isSignUp.set(false);
    }

    protected async submitLogin(): Promise<void> {
        this.errorMessage.set('');
        if (this.loginForm.invalid || this.isLoading()) {
            this.loginForm.markAllAsTouched();
            return;
        }
        const { email, password } = this.loginForm.getRawValue();
        await this.runLogin(() => this.authService.login(email, password), 'user');
    }

    protected async loginAsGuest(): Promise<void> {
        if (this.isLoading()) return;
        await this.runLogin(() => this.authService.loginAsGuest(), 'guest');
    }

    private async runLogin(
        request: () => Promise<string | null>,
        result: 'user' | 'guest',
    ): Promise<void> {
        this.isLoading.set(true);
        this.errorMessage.set('');
        const error = await request();
        this.isLoading.set(false);
        if (error) {
            this.errorMessage.set(error);
            return;
        }
        this.userName.set(this.authService.userName());
        if (window.matchMedia(GREETING_MEDIA_QUERY).matches) {
            this.result.set(result);
            return;
        }
        this.finishGreeting();
    }

    protected async submitSignUp(): Promise<void> {
        this.errorMessage.set('');
        const { name, email, password, confirmPassword } = this.signUpForm.getRawValue();
        if (this.signUpForm.invalid || this.isLoading() || password !== confirmPassword) {
            this.signUpForm.markAllAsTouched();
            return;
        }
        await this.runLogin(() => this.authService.signUp({ name, email, password }), 'user');
    }

    protected finishSplash(): void {
        this.showSplash.set(false);
    }

    protected finishGreeting(): void {
        this.router.navigate(['/summary']);
    }
}
