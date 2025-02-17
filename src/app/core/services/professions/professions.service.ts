import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConfigService } from '../config.service';

export interface Profession {
  id?: number;
  name: string;
  hourly_rate: number;
  daily_rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionsService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private professionsSignal = signal<Profession[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values and public accessors
  public professions = computed(() => this.professionsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('professions');
  }

  getAllProfessions(): Observable<Profession[]> {
    this.loadingSignal.set(true);
    
    return this.http.get<Profession[]>(this.apiEndpoint).pipe(
      tap({
        next: (professions) => {
          this.professionsSignal.set(professions);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  getProfessionById(id: number): Observable<Profession> {
    this.loadingSignal.set(true);

    return this.http.get<Profession>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => this.errorSignal.set(null),
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  createProfession(profession: Omit<Profession, 'id'>): Observable<Profession> {
    this.loadingSignal.set(true);

    return this.http.post<Profession>(this.apiEndpoint, profession).pipe(
      tap({
        next: (newProfession) => {
          const currentProfessions = this.professionsSignal();
          this.professionsSignal.set([...currentProfessions, newProfession]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  updateProfession(id: number, profession: Profession): Observable<Profession> {
    this.loadingSignal.set(true);

    profession.daily_rate = Number(profession.daily_rate);
    profession.hourly_rate = Number(profession.hourly_rate);

    return this.http.put<Profession>(`${this.apiEndpoint}/${id}`, {
      daily_rate: profession.daily_rate,
      hourly_rate: profession.hourly_rate,
      name: profession.name,
    }).pipe(
      tap({
        next: (updatedProfession) => {
          
          const currentProfessions = this.professionsSignal();
          const updatedProfessions = currentProfessions.map(p => 
            p.id === id ? updatedProfession : p
          );
          this.professionsSignal.set(updatedProfessions);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  deleteProfession(id: number): Observable<void> {
    this.loadingSignal.set(true);
  
    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentProfessions = this.professionsSignal();
          this.professionsSignal.set(currentProfessions.filter(p => p.id !== id));
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(error.message);
          throw error;
        },
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
          errorMessage = 'المهنة غير موجودة';
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