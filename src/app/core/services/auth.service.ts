import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthError, User } from '@supabase/supabase-js';
import { getInitials } from '../utils/avatar.utils';
import { SupabaseService } from './supabase.service';

const GUEST_EMAIL = 'guest@join.de';
const GUEST_PASSWORD = 'Guest1234!';

export interface SignUpInput {
    name: string;
    email: string;
    password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly supabase = inject(SupabaseService).client;
    private readonly userSignal = signal<User | null>(null);

    readonly user = this.userSignal.asReadonly();
    readonly isLoggedIn = computed(() => this.userSignal() !== null);
    readonly isGuest = computed(() => this.userSignal()?.email === GUEST_EMAIL);
    readonly userName = computed(() => this.readName(this.userSignal()));
    readonly initials = computed(() => getInitials(this.userName()));

    async restoreSession(): Promise<void> {
        const { data } = await this.supabase.auth.getSession();
        this.userSignal.set(data.session?.user ?? null);
    }

    async login(email: string, password: string): Promise<string | null> {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) return this.toMessage(error);
        this.userSignal.set(data.user);
        return null;
    }

    loginAsGuest(): Promise<string | null> {
        return this.login(GUEST_EMAIL, GUEST_PASSWORD);
    }

    async signUp(input: SignUpInput): Promise<string | null> {
        const { data, error } = await this.supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: { data: { name: input.name } },
        });
        if (error) return this.toMessage(error);
        this.userSignal.set(data.user);
        return null;
    }

    async logout(): Promise<void> {
        await this.supabase.auth.signOut();
        this.userSignal.set(null);
    }

    private readName(user: User | null): string {
        if (!user) return '';
        if (user.email === GUEST_EMAIL) return 'Guest';
        return (user.user_metadata['name'] as string | undefined) ?? '';
    }

    private toMessage(error: AuthError): string {
        return error.message === 'Invalid login credentials'
            ? 'Check your email and password. Please try again.'
            : error.message;
    }
}
