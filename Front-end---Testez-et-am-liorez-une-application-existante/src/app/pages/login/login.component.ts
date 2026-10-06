import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { LoginResponse } from '../../core/models/LoginResponse';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  token: string = '';

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
      {
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.token = '';
    if (this.loginForm.invalid) {
      return;
    }
    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.loading = true;
    this.userService.login(credentials)
      .pipe(
        finalize(() => this.loading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: LoginResponse) => this.token = response.token,
        error: (error: HttpErrorResponse) => this.errorMessage = this.getErrorMessage(error)
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = '';
    this.token = '';
    this.loginForm.reset();
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Server unreachable, please try again later.';
    }
    if (typeof error.error === 'string' && error.error) {
      return error.error;
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return `Authentication failed (HTTP ${error.status}).`;
  }
}
