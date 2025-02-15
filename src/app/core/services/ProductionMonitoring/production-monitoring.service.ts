import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import { DailyStatistics, EmployeeStatistics, MonitoringFilter, ProductionMonitoring } from '../../../type/production-monitor';



@Injectable({
  providedIn: 'root'
})
export class ProductionMonitoringService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private monitoringRecordsSignal = signal<ProductionMonitoring[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values and public accessors
  public monitoringRecords = computed(() => this.monitoringRecordsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('productionMonitoring');
  }

  getMonitoringRecords(params?: MonitoringFilter): Observable<ProductionMonitoring[]> {
    this.loadingSignal.set(true);

    const today = new Date().toLocaleDateString('en-CA');

    let httpParams = new HttpParams();
    httpParams = httpParams.set('start_date', params?.start_date || today);
    httpParams = httpParams.set('end_date', params?.end_date || today);
    
    if (params?.employee_id) {
      httpParams = httpParams.set('employee_id', params.employee_id.toString());
    }

    if (params?.piece_id) {  // إضافة piece_id للباراميترات
      httpParams = httpParams.set('piece_id', params.piece_id.toString());
    }

    return this.http.get<ProductionMonitoring[]>(this.apiEndpoint, { params: httpParams }).pipe(
      tap({
        next: (records) => {
          this.monitoringRecordsSignal.set(records);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  addMonitoringRecord(record: {
    employee_id: number;
    piece_id: number;
    quantity: number;
    quality_grade: string;
    date?: string;
    notes?: string;
  }): Observable<ProductionMonitoring> {
    this.loadingSignal.set(true);

    return this.http.post<ProductionMonitoring>(this.apiEndpoint, record).pipe(
      tap({
        next: (newRecord) => {
          const currentRecords = this.monitoringRecordsSignal();
          this.monitoringRecordsSignal.set([...currentRecords, newRecord]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  updateMonitoringRecord(id: number, updates: {
    employee_id?: number;
    piece_id?: number;  // إضافة piece_id
    quantity?: number;
    quality_grade?: string;
    notes?: string;
    date?: string;
  }): Observable<ProductionMonitoring> {
    this.loadingSignal.set(true);

    return this.http.put<ProductionMonitoring>(`${this.apiEndpoint}/${id}`, updates).pipe(
      tap({
        next: (updatedRecord) => {
          const currentRecords = this.monitoringRecordsSignal();
          const updatedRecords = currentRecords.map(record =>
            record.id === id ? updatedRecord : record
          );
          this.monitoringRecordsSignal.set(updatedRecords);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  deleteMonitoringRecord(id: number): Observable<void> {
    this.loadingSignal.set(true);

    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentRecords = this.monitoringRecordsSignal();
          this.monitoringRecordsSignal.set(currentRecords.filter(record => record.id !== id));
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  getDailyStatistics(): Observable<DailyStatistics> {
    this.loadingSignal.set(true);

    return this.http.get<DailyStatistics>(`${this.apiEndpoint}/statistics/daily`).pipe(
      tap({
        next: () => this.errorSignal.set(null),
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  getEmployeeStatistics(
    employeeId: number,
    params?: { start_date?: string; end_date?: string }
  ): Observable<EmployeeStatistics> {
    this.loadingSignal.set(true);

    let httpParams = new HttpParams();
    if (params?.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params?.end_date) httpParams = httpParams.set('end_date', params.end_date);

    return this.http.get<EmployeeStatistics>(
      `${this.apiEndpoint}/statistics/employee/${employeeId}`,
      { params: httpParams }
    ).pipe(
      tap({
        next: () => this.errorSignal.set(null),
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // Helper Methods
  getQualityLabel(grade: string): string {
    const labels: { [key: string]: string } = {
      'A': 'ممتاز',
      'B': 'جيد جداً',
      'C': 'جيد',
      'D': 'مقبول',
      'E': 'ضعيف'
    };
    return labels[grade] || grade;
  }

  getQualitySeverity(grade: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'danger',
      'E': 'secondary'
    };
    return severityMap[grade] || 'secondary';
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
          errorMessage = 'السجل غير موجود';
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