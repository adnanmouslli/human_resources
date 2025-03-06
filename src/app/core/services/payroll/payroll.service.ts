import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';

// Define interfaces for the payroll data
interface PayrollCalculation {
  general_statistics: {
    total_employees: number;
    total_payroll: string;
    total_basic_salaries: string;
    total_allowances: string;
    total_additions: string;
    total_deductions: string;
    calculation_date: string;
    month: number;
    year: number;
  };
  systems_statistics: {
    monthly_system: {
      employee_count: number;
      total_salaries: string;
      total_additions: string;
      total_deductions: string;
      attendance_summary: {
        full_days: number;
        half_days: number;
        online_days: number;
        excused_absences: number;
        unexcused_absences: number;
      };
    };
    production_system: {
      employee_count: number;
      total_salaries: string;
      total_production_value: string;
      total_pieces: number;
      quality_summary: {
        [key: string]: {
          count: number;
          value: string;
        };
      };
    };
    shift_system: {
      employee_count: number;
      total_salaries: string;
      total_working_hours: number;
      total_overtime_hours: number;
      total_delay_minutes: number;
      total_break_minutes: number;
    };
  };
  employees_by_system: {
    monthly_system: EmployeeSalary[];
    production_system: EmployeeSalary[];
    shift_system: EmployeeSalary[];
    hourly_employees: EmployeeSalary[];
  };
}

interface EmployeeSalary {
  employee_id: number;
  employee_name: string;
  fingerprint_id: string;
  position: string;
  system_type: string;
  basic_salary: string;
  allowances: string;
  additions: string;
  deductions: string;
  net_salary: string;
  notes: string;
  calculation_date: string;
  system_details: any;
}

interface EmployeePayroll {
  employee_id: number;
  employee_name: string;
  fingerprint_id: string;
  system_type: string;
  position: string;
  salary_details: {
    basic_salary: string;
    allowances: string;
    additions: string;
    deductions: string;
    net_salary: string;
  };
  calculation_date: string;
  period: {
    month: number;
    year: number;
  };
  notes: string;
  system_details?: any;
  advances?: Array<{
    date: string;
    amount: string;
    document_number: string;
    notes: string;
  }>;
}

interface PayrollFilter {
  month: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private payrollDataSignal = signal<PayrollCalculation | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Employee payroll signals
  private employeePayrollSignal = signal<EmployeePayroll | null>(null);
  private employeeLoadingSignal = signal<boolean>(false);
  private employeeErrorSignal = signal<string | null>(null);

  // Computed values and public accessors
  public payrollData = computed(() => this.payrollDataSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());
  
  // Employee payroll computed values
  public employeePayroll = computed(() => this.employeePayrollSignal());
  public employeeLoading = computed(() => this.employeeLoadingSignal());
  public employeeError = computed(() => this.employeeErrorSignal());

  // Additional computed signals for easy access to statistics
  public generalStats = computed(() => this.payrollDataSignal()?.general_statistics);
  public monthlySystemStats = computed(() => this.payrollDataSignal()?.systems_statistics.monthly_system);
  public productionSystemStats = computed(() => this.payrollDataSignal()?.systems_statistics.production_system);
  public shiftSystemStats = computed(() => this.payrollDataSignal()?.systems_statistics.shift_system);

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('payroll');
  }

  calculatePayroll(params: PayrollFilter): Observable<PayrollCalculation> {
    this.loadingSignal.set(true);

    return this.http.post<PayrollCalculation>(`${this.apiEndpoint}/calculate`, params).pipe(
      tap({
        next: (data) => {
          this.payrollDataSignal.set(data);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }
  
  /**
   * حساب راتب موظف محدد عن طريق الرقم التعريفي
   * @param employeeId الرقم التعريفي للموظف
   * @param params فلتر الشهر والسنة
   * @returns بيانات راتب الموظف
   */
  calculateEmployeePayroll(employeeId: number, params: PayrollFilter): Observable<EmployeePayroll> {
    this.employeeLoadingSignal.set(true);
    this.employeeErrorSignal.set(null);
    
    return this.http.post<EmployeePayroll>(`${this.apiEndpoint}/employee/${employeeId}`, params).pipe(
      tap({
        next: (data) => {
          this.employeePayrollSignal.set(data);
        },
        error: (error) => this.employeeErrorSignal.set(error.message),
        finalize: () => this.employeeLoadingSignal.set(false)
      }),
      catchError(this.handleEmployeeError)
    );
  }
  
  /**
   * إعادة تعيين بيانات راتب الموظف
   */
  resetEmployeePayroll(): void {
    this.employeePayrollSignal.set(null);
    this.employeeErrorSignal.set(null);
  }

  getEmployeesBySystem(systemType: 'monthly' | 'production' | 'shift' | 'hourly'): EmployeeSalary[] {
    const data = this.payrollDataSignal();
    if (!data) return [];

    switch (systemType) {
      case 'monthly':
        return data.employees_by_system.monthly_system;
      case 'production':
        return data.employees_by_system.production_system;
      case 'shift':
        return data.employees_by_system.shift_system;
      case 'hourly':
        return data.employees_by_system.hourly_employees;
      default:
        return [];
    }
  }

  // Helper methods for formatting and calculations
  formatCurrency(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(numValue);
  }

  getSystemLabel(systemType: string): string {
    const labels: { [key: string]: string } = {
      'monthly': 'نظام شهري',
      'production': 'نظام إنتاج',
      'shift': 'نظام ورديات',
      'hourly': 'نظام ساعات',
      'none': 'غير محدد'
    };
    return labels[systemType] || systemType;
  }

  // يمكن استخدام هذه الدالة للحصول على وصف مفصل للنظام
  getSystemDescription(systemType: string): string {
    const descriptions: { [key: string]: string } = {
      'monthly': 'راتب شهري ثابت مع خصومات حسب الحضور والغياب',
      'production': 'راتب حسب عدد القطع المنتجة ومستوى الجودة',
      'shift': 'راتب حسب الورديات والساعات الإضافية',
      'hourly': 'راتب بالساعة أو باليوم (يحسب الأعلى منهما)',
      'none': 'لا يوجد نظام محدد'
    };
    return descriptions[systemType] || 'نظام غير معروف';
  }

  calculateTotalsByDepartment(): { [key: string]: { count: number; total: number } } {
    const data = this.payrollDataSignal();
    if (!data) return {};

    const totals: { [key: string]: { count: number; total: number } } = {};
    const allEmployees = [
      ...data.employees_by_system.monthly_system,
      ...data.employees_by_system.production_system,
      ...data.employees_by_system.shift_system,
      ...data.employees_by_system.hourly_employees
    ];

    allEmployees.forEach(employee => {
      const department = employee.position || 'غير محدد';
      if (!totals[department]) {
        totals[department] = { count: 0, total: 0 };
      }
      totals[department].count++;
      totals[department].total += parseFloat(employee.net_salary);
    });

    return totals;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'حدث خطأ. الرجاء المحاولة مرة أخرى.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'طلب غير صالح - تأكد من صحة البيانات المدخلة';
          break;
        case 404:
          errorMessage = 'لم يتم العثور على بيانات الرواتب';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم. الرجاء المحاولة مرة أخرى لاحقاً.';
          break;
      }
    }

    this.errorSignal.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
  
  private handleEmployeeError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'حدث خطأ أثناء حساب راتب الموظف. الرجاء المحاولة مرة أخرى.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'بيانات غير صحيحة - تأكد من صحة الشهر والسنة';
          break;
        case 404:
          errorMessage = 'لم يتم العثور على الموظف المحدد';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم أثناء حساب الراتب. الرجاء المحاولة مرة أخرى لاحقاً.';
          break;
      }
    }

    this.employeeErrorSignal.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}