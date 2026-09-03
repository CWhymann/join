import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskToastService } from '../../core/services/task-toast.service';

@Component({
    selector: 'app-topbar',
    imports: [RouterLink],
    templateUrl: './topbar.html',
    styleUrl: './topbar.scss',
})
export class Topbar {
    private readonly authService = inject(AuthService);
    private readonly taskToastService = inject(TaskToastService);
    private readonly router = inject(Router);

    protected readonly isLoggedIn = this.authService.isLoggedIn;
    protected readonly initials = this.authService.initials;

    protected isProfileMenuOpen = false;

    protected toggleProfileMenu(event: MouseEvent): void {
        event.stopPropagation();
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    protected closeProfileMenu(): void {
        this.isProfileMenuOpen = false;
    }

    protected async logout(): Promise<void> {
        await this.authService.logout();
        this.closeProfileMenu();
        this.taskToastService.logout();
        this.router.navigate(['/login']);
    }

    @HostListener('document:click')
    protected closeProfileMenuOnOutsideClick(): void {
        this.closeProfileMenu();
    }

    @HostListener('document:keydown.escape')
    protected closeProfileMenuOnEscape(): void {
        this.closeProfileMenu();
    }
}
