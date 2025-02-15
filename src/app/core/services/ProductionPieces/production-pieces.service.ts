import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';

export interface PriceLevel {
  [key: string]: number;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

export interface ProductionPiece {
  id?: number;
  piece_number: string;
  piece_name: string;
  price_levels: PriceLevel;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionPiecesService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private piecesSignal = signal<ProductionPiece[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values and public accessors
  public pieces = computed(() => this.piecesSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('productionPieces');
  }

  getPieces(): Observable<ProductionPiece[]> {
    this.loadingSignal.set(true);
    
    return this.http.get<ProductionPiece[]>(this.apiEndpoint).pipe(
      tap({
        next: (pieces) => {
          this.piecesSignal.set(pieces);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  addPiece(piece: Omit<ProductionPiece, 'id' | 'created_at' | 'updated_at'>): Observable<ProductionPiece> {
    this.loadingSignal.set(true);

    return this.http.post<ProductionPiece>(this.apiEndpoint, piece).pipe(
      tap({
        next: (newPiece) => {
          const currentPieces = this.piecesSignal();
          this.piecesSignal.set([...currentPieces, newPiece]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  updatePiece(id: number, piece: Partial<ProductionPiece>): Observable<ProductionPiece> {
    this.loadingSignal.set(true);

    return this.http.put<ProductionPiece>(`${this.apiEndpoint}/${id}`, piece).pipe(
      tap({
        next: (updatedPiece) => {
          const currentPieces = this.piecesSignal();
          const updatedPieces = currentPieces.map(p => 
            p.id === id ? updatedPiece : p
          );
          this.piecesSignal.set(updatedPieces);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  deletePiece(id: number): Observable<void> {
    this.loadingSignal.set(true);
  
    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentPieces = this.piecesSignal();
          this.piecesSignal.set(currentPieces.filter(p => p.id !== id));
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

  getPieceByNumber(pieceNumber: string): Observable<ProductionPiece> {
    this.loadingSignal.set(true);

    return this.http.get<ProductionPiece>(`${this.apiEndpoint}/number/${pieceNumber}`).pipe(
      tap({
        next: () => this.errorSignal.set(null),
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      }),
      catchError(this.handleError)
    );
  }

  // Helper Methods
  getLevelLabel(grade: string): string {
    const labels: { [key: string]: string } = {
      'A': 'ممتاز',
      'B': 'جيد جداً',
      'C': 'جيد',
      'D': 'مقبول',
      'E': 'ضعيف'
    };
    return labels[grade] || grade;
  }

  getLevelSeverity(grade: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'danger',
      'E': 'secondary'
    };
    return severityMap[grade] || 'secondary';
  }

  getEmptyPiece(): ProductionPiece {
    return {
      piece_number: '',
      piece_name: '',
      price_levels: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0
      }
    };
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
          errorMessage = 'القطعة غير موجودة';
          break;
        case 409:
          errorMessage = 'رقم القطعة موجود مسبقاً';
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