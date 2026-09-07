import { FormControl, FormGroup } from '@angular/forms';

/** Typed shape of the login form. */
export type LoginFormGroup = FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
}>;

/** Typed shape of the registration form. */
export type SignUpFormGroup = FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
    acceptedPrivacy: FormControl<boolean>;
}>;
