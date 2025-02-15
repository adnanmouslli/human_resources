import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import { Shift } from '../../../type/shift';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private shiftsSignal = signal<Shift[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values and public accessors
  public shifts = computed(() => this.shiftsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('shifts');
  }

  getShifts(): Observable<Shift[]> {
    this.loadingSignal.set(true);
    
    return this.http.get<Shift[]>(this.apiEndpoint).pipe(
      tap({
        next: (shifts) => {
          this.shiftsSignal.set(shifts);
          this.errorSignal.set(null);
          console.log("shifts" , shifts)
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  addShift(shift: Omit<Shift, 'id'>): Observable<Shift> {
    this.loadingSignal.set(true);

    return this.http.post<Shift>(this.apiEndpoint, shift).pipe(
      tap({
        next: (newShift) => {
          const currentShifts = this.shiftsSignal();
          this.shiftsSignal.set([...currentShifts, newShift]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  updateShift(id: number, shift: Shift): Observable<Shift> {
    this.loadingSignal.set(true);

    return this.http.put<Shift>(`${this.apiEndpoint}/${id}`, shift).pipe(
      tap({
        next: (updatedShift) => {
          const currentShifts = this.shiftsSignal();
          const updatedShifts = currentShifts.map(s => 
            s.id === id ? updatedShift : s
          );
          this.shiftsSignal.set(updatedShifts);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  deleteShift(id: number): Observable<void> {
    this.loadingSignal.set(true);
  
    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentShifts = this.shiftsSignal();
          this.shiftsSignal.set(currentShifts.filter(s => s.id !== id));
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(error.message);
          throw error; // إعادة رمي الخطأ للتعامل معه في المكون
        },
        finalize: () => this.loadingSignal.set(false)
      })
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
          errorMessage = 'الوردية غير موجودة';
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