import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Keeps signed-out visitors out of the app.
 * @returns `true` when a user is signed in, otherwise a redirect to `/login`.
 */
export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    return inject(AuthService).isLoggedIn() || router.createUrlTree(['/login']);
};

/**
 * Keeps signed-in users off the login and sign-up routes.
 * @returns `true` when nobody is signed in, otherwise a redirect to `/summary`.
 */
export const guestGuard: CanActivateFn = () => {
    const router = inject(Router);
    return !inject(AuthService).isLoggedIn() || router.createUrlTree(['/summary']);
};
