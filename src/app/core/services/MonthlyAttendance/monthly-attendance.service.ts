import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConfigService } from '../config.service';
import { Employee } from '../../../type/employee';

export interface MonthlyAttendance {
  id?: number;
  employee?: Employee;
  employee_id: number;
  date: string;
  attendance_type: 'full_day' | 'half_day' | 'online_day' | 'absent';
  check_in: string | null;
  check_out: string | null;
  is_excused_absence: boolean;
  excuse_document?: string;
  notes?: string;
}

export interface AttendanceReport {
  employee: {
    id: number;
    name: string;
  };
  attendance_summary: {
    full_days: number;
    half_days: number;
    online_days: number;
    excused_absences: number;
    unexcused_absences: number;
  };
  daily_records: MonthlyAttendance[];
}

export interface AttendanceStats {
  total_records: number;
  attendance_by_type: {
    full_days: number;
    half_days: number;
    online_days: number;
    excused_absences: number;
  };
  period: {
    start_date: string;
    end_date: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MonthlyAttendanceService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private attendanceSignal = signal<MonthlyAttendance[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private reportSignal = signal<AttendanceReport[]>([]);
  private statsSignal = signal<AttendanceStats | null>(null);

  // Computed values and public accessors
  public attendanceRecords = computed(() => this.attendanceSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());
  public report = computed(() => this.reportSignal());
  public stats = computed(() => this.statsSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('monthlyAttendance');
  }

  // إنشاء سجل دوام جديد
  createAttendance(attendance: Omit<MonthlyAttendance, 'id'>): Observable<MonthlyAttendance> {
    this.loadingSignal.set(true);

    return this.http.post<MonthlyAttendance>(this.apiEndpoint, attendance).pipe(
      tap({
        next: (newAttendance) => {
          const currentRecords = this.attendanceSignal();
          this.attendanceSignal.set([...currentRecords, newAttendance]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // تسجيل وقت الانصراف
  checkOut(id: number): Observable<MonthlyAttendance> {
    this.loadingSignal.set(true);

    return this.http.put<MonthlyAttendance>(`${this.apiEndpoint}/checkout/${id}`, {}).pipe(
      tap({
        next: (updatedAttendance) => {
          const currentRecords = this.attendanceSignal();
          const updatedRecords = currentRecords.map(record => 
            record.id === id ? updatedAttendance : record
          );
          this.attendanceSignal.set(updatedRecords);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }


  // إضافة ميثود جديدة في MonthlyAttendanceService
getDailyAttendance(): Observable<MonthlyAttendance[]> {
  this.loadingSignal.set(true);
  const today = new Date().toISOString().split('T')[0];

  return this.http.get<MonthlyAttendance[]>(`${this.apiEndpoint}/daily`).pipe(
      tap({
          next: (records) => {
              this.attendanceSignal.set(records);
              this.errorSignal.set(null);
          },
          error: (error) => this.errorSignal.set(error.message),
          finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
  );
}

  // الحصول على سجلات دوام موظف معين
  getEmployeeAttendance(employeeId: number, startDate?: string, endDate?: string): Observable<MonthlyAttendance[]> {
    this.loadingSignal.set(true);

    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);

    return this.http.get<MonthlyAttendance[]>(
      `${this.apiEndpoint}/employee/${employeeId}`,
      { params }
    ).pipe(
      tap({
        next: (records) => {
          this.attendanceSignal.set(records);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // الحصول على التقرير الشهري
  getMonthlyReport(year: number, month: number, employeeId?: number): Observable<AttendanceReport[]> {
    this.loadingSignal.set(true);

    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    if (employeeId) params = params.set('employee_id', employeeId.toString());

    return this.http.get<AttendanceReport[]>(`${this.apiEndpoint}/report`, { params }).pipe(
      tap({
        next: (report) => {
          this.reportSignal.set(report);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // تحديث سجل دوام
  updateAttendance(id: number, attendance: Partial<MonthlyAttendance>): Observable<MonthlyAttendance> {
    this.loadingSignal.set(true);

    return this.http.put<MonthlyAttendance>(`${this.apiEndpoint}/${id}`, attendance).pipe(
      tap({
        next: (updatedAttendance) => {
          const currentRecords = this.attendanceSignal();
          const updatedRecords = currentRecords.map(record => 
            record.id === id ? updatedAttendance : record
          );
          this.attendanceSignal.set(updatedRecords);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // حذف سجل دوام
  deleteAttendance(id: number): Observable<void> {
    this.loadingSignal.set(true);

    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentRecords = this.attendanceSignal();
          this.attendanceSignal.set(currentRecords.filter(record => record.id !== id));
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // الحصول على إحصائيات الدوام
  getAttendanceStats(startDate?: string, endDate?: string, employeeId?: number): Observable<AttendanceStats> {
    this.loadingSignal.set(true);

    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (employeeId) params = params.set('employee_id', employeeId.toString());

    return this.http.get<AttendanceStats>(`${this.apiEndpoint}/stats`, { params }).pipe(
      tap({
        next: (stats) => {
          this.statsSignal.set(stats);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'حدث خطأ. الرجاء المحاولة مرة أخرى.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'طلب غير صالح';
          break;
        case 404:
          errorMessage = 'سجل الدوام غير موجود';
          break;
        case 409:
          errorMessage = 'يوجد سجل دوام مسجل لهذا اليوم';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم. الرجاء المحاولة مرة أخرى لاحقاً.';
          break;
      }
    }

    this.errorSignal.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}