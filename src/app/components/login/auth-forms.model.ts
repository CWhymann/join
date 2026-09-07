import { FormControl, FormGroup } from '@angular/forms';

export type LoginFormGroup = FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
}>;

export type SignUpFormGroup = FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
    acceptedPrivacy: FormControl<boolean>;
}>;
