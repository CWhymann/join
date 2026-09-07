import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskToastService } from '../../core/services/task-toast.service';
import { EMAIL_PATTERN, fullNameValidator, MIN_PASSWORD_LENGTH } from '../../core/utils/validation.utils';
import { LoginCard } from './login-card/login-card';
import { SignUpCard } from './sign-up-card/sign-up-card';

export type LoginResult = 'user' | 'guest' | null;
const GREETING_MEDIA_QUERY = '(max-width: 1255px)';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RouterLink, LoginCard, SignUpCard],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    private readonly authService = inject(AuthService);
    protected readonly taskToastService = inject(TaskToastService);
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
        email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(80)]],
        password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
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
        if (this.isLoginBlocked()) return;
        const { email, password } = this.loginForm.getRawValue();
        const success = await this.runLogin(() => this.authService.login(email, password), 'user');
        if (success) this.taskToastService.login();
    }

    private isLoginBlocked(): boolean {
        if (this.loginForm.valid && !this.isLoading()) return false;
        this.loginForm.markAllAsTouched();
        return true;
    }

    protected async loginAsGuest(): Promise<void> {
        if (this.isLoading()) return;
        await this.runLogin(() => this.authService.loginAsGuest(), 'guest');
    }

    private async runLogin(
        request: () => Promise<string | null>,
        result: 'user' | 'guest',
    ): Promise<boolean> {
        this.startLogin();
        const error = await request();
        this.isLoading.set(false);
        if (error) return this.handleLoginError(error);
        this.completeLogin(result);
        return true;
    }

    private startLogin(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');
    }

    private handleLoginError(error: string): false {
        this.errorMessage.set(error);
        return false;
    }

    private completeLogin(result: 'user' | 'guest'): void {
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
        if (this.isSignUpBlocked(password, confirmPassword)) return;
        const success = await this.registerUser(name, email, password);
        if (success) this.taskToastService.signUp();
    }

    private isSignUpBlocked(password: string, confirmation: string): boolean {
        if (this.signUpForm.valid && !this.isLoading() && password === confirmation) return false;
        this.signUpForm.markAllAsTouched();
        return true;
    }

    private registerUser(name: string, email: string, password: string): Promise<boolean> {
        return this.runLogin(() => this.authService.signUp({ name, email, password }), 'user');
    }

    protected finishSplash(): void {
        this.showSplash.set(false);
    }

    protected finishGreeting(): void {
        this.router.navigate(['/summary']);
    }
}
