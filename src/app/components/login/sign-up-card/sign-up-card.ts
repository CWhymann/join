import { Component, input, model, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SignUpFormGroup } from '../auth-forms.model';

@Component({
    selector: 'app-sign-up-card',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './sign-up-card.html',
    styleUrl: './sign-up-card.scss',
})
export class SignUpCard {
    readonly form = input.required<SignUpFormGroup>();
    readonly errorMessage = input.required<string>();
    readonly isLoading = input.required<boolean>();
    readonly showPassword = model.required<boolean>();
    readonly showConfirmPassword = model.required<boolean>();
    readonly submitted = output<void>();
    readonly back = output<void>();
}
