import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthError, User } from '@supabase/supabase-js';
import { Contact } from '../models/contact.model';
import { getInitials } from '../utils/avatar.utils';
import { ContactsService } from './contacts.service';
import { SupabaseService } from './supabase.service';

const GUEST_EMAIL = 'guest@join.de';
const GUEST_PASSWORD = 'Guest1234!';

/** Values the registration form hands to the service. */
export interface SignUpInput {
    name: string;
    email: string;
    password: string;
}

@Injectable({ providedIn: 'root' })
/** Signs users in and out and keeps the current user in a signal. */
export class AuthService {
    private readonly supabase = inject(SupabaseService).client;
    private readonly contactsService = inject(ContactsService);
    private readonly userSignal = signal<User | null>(null);

    readonly user = this.userSignal.asReadonly();
    readonly isLoggedIn = computed(() => this.userSignal() !== null);
    readonly isGuest = computed(() => this.userSignal()?.email === GUEST_EMAIL);
    readonly userName = computed(() => this.readName(this.userSignal()));
    readonly initials = computed(() => getInitials(this.userName()));

    /** Reads the stored Supabase session and republishes the current user. */
    async restoreSession(): Promise<void> {
        const { data } = await this.supabase.auth.getSession();
        this.userSignal.set(data.session?.user ?? null);
    }

    /**
     * Signs a user in with email and password.
     * @param email - Registered email address.
     * @param password - Matching password.
     * @returns `null` on success, otherwise an error message for the form.
     */
    async login(email: string, password: string): Promise<string | null> {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) return this.toMessage(error);
        this.userSignal.set(data.user);
        return null;
    }

    /**
     * Signs in with the shared guest account.
     * @returns `null` on success, otherwise an error message for the form.
     */
    loginAsGuest(): Promise<string | null> {
        return this.login(GUEST_EMAIL, GUEST_PASSWORD);
    }

    /**
     * Registers a user and files them in the contact list.
     * @param input - Name, email and password from the form.
     * @returns `null` on success, otherwise an error message for the form.
     */
    async signUp(input: SignUpInput): Promise<string | null> {
        const { data, error } = await this.supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: { data: { name: input.name } },
        });
        if (error) return this.toMessage(error);
        this.userSignal.set(data.user);
        await this.addToContacts(input, data.user?.id);
        return null;
    }

    /**
     * Claims a listed contact with the same email, or creates a new one.
     * @param input - Name and email of the new user.
     * @param userId - Supabase user id, absent while confirmation is pending.
     */
    private async addToContacts(input: SignUpInput, userId?: string): Promise<void> {
        await this.contactsService.loadContacts();
        const listed = this.findContactByEmail(input.email);
        if (listed) {
            await this.claimListedContact(listed, userId);
            return;
        }
        await this.contactsService.addContact({
            name: input.name,
            email: input.email,
            phone: '',
            user_id: userId,
        });
    }

    /**
     * Looks up a contact by email, ignoring case.
     * @param email - Email address to match.
     * @returns Matching contact, or `undefined` when none is listed.
     */
    private findContactByEmail(email: string): Contact | undefined {
        const normalizedEmail = email.toLowerCase();
        return this.contactsService
            .contacts()
            .find((contact) => contact.email.toLowerCase() === normalizedEmail);
    }

    /**
     * Links an unclaimed contact to the account that just registered.
     * @param contact - Contact found under the same email.
     * @param userId - Supabase user id, absent while confirmation is pending.
     */
    private async claimListedContact(contact: Contact, userId?: string): Promise<void> {
        if (userId && !contact.user_id) {
            await this.contactsService.claimContact(contact.id, userId);
        }
    }

    /** Ends the Supabase session and clears the current user. */
    async logout(): Promise<void> {
        await this.supabase.auth.signOut();
        this.userSignal.set(null);
    }

    /**
     * Reads the display name from the user metadata.
     * @param user - Signed-in user, or `null`.
     * @returns Stored name, `Guest` for the guest account, empty when signed out.
     */
    private readName(user: User | null): string {
        if (!user) return '';
        if (user.email === GUEST_EMAIL) return 'Guest';
        return (user.user_metadata['name'] as string | undefined) ?? '';
    }

    /**
     * Turns a Supabase auth error into text for the form.
     * @param error - Error returned by Supabase.
     * @returns Friendlier wording for wrong credentials, otherwise the original message.
     */
    private toMessage(error: AuthError): string {
        return error.message === 'Invalid login credentials'
            ? 'Check your email and password. Please try again.'
            : error.message;
    }
}
