import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;

 registerForm = this.fb.nonNullable.group({

  firstName: ['', [
    Validators.required,
    Validators.minLength(2)
  ]],

  lastName: ['', [
    Validators.required,
    Validators.minLength(2)
  ]],

  username: ['', [
    Validators.required,
    Validators.minLength(3)
  ]],

  email: ['', [
    Validators.required,
    Validators.email
  ]],

  password: ['', [
    Validators.required,
    Validators.minLength(6)
  ]],

  confirmPassword: ['', [
    Validators.required
  ]],

  role: ['USER']

});

  register() {

    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const value = this.registerForm.getRawValue();

    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.register({

  firstName: value.firstName,
  lastName: value.lastName,
  username: value.username,
  email: value.email,
  password: value.password,
  role: value.role

})
    .pipe(
      finalize(() => this.loading = false)
    )
    .subscribe({

      next: () => {

        alert('Account created successfully!');

        this.router.navigate(['/login']);

      },

      error: err => {

        this.errorMessage =
          err.error?.message ??
          'Registration failed.';

      }

    });

  }

}