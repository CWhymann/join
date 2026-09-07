import { Component, input, model, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginFormGroup } from '../auth-forms.model';

@Component({
    selector: 'app-login-card',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login-card.html',
    styleUrl: './login-card.scss',
})
export class LoginCard {
    readonly form = input.required<LoginFormGroup>();
    readonly errorMessage = input.required<string>();
    readonly isLoading = input.required<boolean>();
    readonly showPassword = model.required<boolean>();
    readonly submitted = output<void>();
    readonly guestRequested = output<void>();
}
