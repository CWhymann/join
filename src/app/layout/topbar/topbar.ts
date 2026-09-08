import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskToastService } from '../../core/services/task-toast.service';

/** Renders the header with the profile menu and the logout action. */
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

    /**
     * Opens or closes the profile menu.
     * @param event - Click event, stopped so the outside-click listener does not fire.
     */
    protected toggleProfileMenu(event: MouseEvent): void {
        event.stopPropagation();
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    /** Closes the profile menu. */
    protected closeProfileMenu(): void {
        this.isProfileMenuOpen = false;
    }

    /** Signs the user out, confirms it with a toast and returns to the login page. */
    protected async logout(): Promise<void> {
        await this.authService.logout();
        this.closeProfileMenu();
        this.taskToastService.logout();
        this.router.navigate(['/login']);
    }

    /** Closes the profile menu on any click outside it. */
    @HostListener('document:click')
    protected closeProfileMenuOnOutsideClick(): void {
        this.closeProfileMenu();
    }

    /** Closes the profile menu when Escape is pressed. */
    @HostListener('document:keydown.escape')
    protected closeProfileMenuOnEscape(): void {
        this.closeProfileMenu();
    }
}
