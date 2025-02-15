import { Component, inject, ViewChild } from '@angular/core';
import { LayoutService } from '../../../layout/service/layout-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {  ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from "../../../components/ui/dynamic-form/dynamic-form.component";
import { DynamicButtonComponent } from "../../../components/ui/dynamic-button/dynamic-button.component";
import {  HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth-service.service';
import { LoginCredentials } from '../../../type/login';
import { catchError, finalize, throwError } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent, DynamicButtonComponent,
    ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [
  ]
})

export class LoginComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  // Loading state for UI
  isLoading = false;

  // Form field configuration with localized Arabic labels
  fields = [
    {
      name: 'username',
      label: 'اسم المستخدم',
      type: 'text',
      placeholder: 'أدخل اسم المستخدم',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 50
      }
    },
    {
      name: 'password',
      label: 'كلمة المرور',
      type: 'password',
      placeholder: 'أدخل كلمة المرور',
      required: true,
      validation: {
        minLength: 8
      }
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    public layoutService: LayoutService,
    private toastService: ToastService
  ) {}

  /**
   * Handle form submission
   * @param data Form data from dynamic form
   */
  async handleFormSubmit(data: any): Promise<void> {

    // debugger;
    // Validate input
    if (!this.validateInput(data)) {
      return;
    }

    // Hash password client-side
    // const hashedPassword = await this.hashPassword(data.password);

    // Prepare login credentials
    const loginCredentials: LoginCredentials = {
      username: data.username,
      password: data.password
    };

    // Set loading state
    this.isLoading = true;

    // Attempt login using AuthService
    this.authService.login(loginCredentials)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(this.handleLoginError)
      )
      .subscribe({
        next: (response) => this.handleSuccessfulLogin(response),
        error: (error) => this.displayLoginError(error)
      });
  }

  /**
   * Validate input before submission
   * @param data Form data
   * @returns Boolean indicating validation status
   */
  private validateInput(data: any): boolean {
    // Comprehensive input validation
    if (!data.username || data.username.length < 3 || data.username.length > 50) {
      this.displayError('اسم المستخدم يجب أن يكون بين 3 و 50 حرفًا');
      return false;
    }

    if (!data.password || data.password.length < 4) {
      this.displayError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return false;
    }

    return true;
  }

  /**
   * Hash password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  // private async hashPassword(password: string): Promise<string> {
  //   const salt = await bcrypt.genSalt(10);
  //   return bcrypt.hash(password, salt);
  // }

  /**
   * Handle successful login
   * @param response Login response
   */
  private handleSuccessfulLogin(response: any): void {
    // Navigate to dashboard or default route
    this.router.navigateByUrl('dashboard');
    this.toastService.success('مرحبًا بك في النظام!' , "نجح");
    
  }

  /**
   * Handle login errors from AuthService
   * @param error Error object
   */
  private handleLoginError = (error: HttpErrorResponse) => {
    // Return observable error for RxJS error handling
    return throwError(() => error);
  }

  /**
   * Display login error to user
   * @param error Error object
   */
  private displayLoginError(error: Error): void {
    // Use LayoutService or another notification method to show error
    this.toastService.error(error.message);
    console.log("error", error);
  }

  /**
   * Display general error message
   * @param message Error message to display
   */
  private displayError(message: string): void {
    console.log("message" , message)
    this.toastService.error(message);
   // this.layoutService.showErrorToast(message);
  }
  
  /**
   * Trigger form submission
   */
  onSubmit(): void {
    if (this.dynamicForm) {
      this.dynamicForm.onSubmit();
    }
  }

}
