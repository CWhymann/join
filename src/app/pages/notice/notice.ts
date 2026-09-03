import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-notice',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './notice.html',
    styleUrl: './notice.scss',
})
export class Notice {
    protected readonly isLoggedIn = inject(AuthService).isLoggedIn;
}
