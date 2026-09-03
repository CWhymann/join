import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-policy',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './policy.html',
    styleUrl: './policy.scss',
})
export class Policy {
    protected readonly isLoggedIn = inject(AuthService).isLoggedIn;
}
