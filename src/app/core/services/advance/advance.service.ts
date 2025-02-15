import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../config.service';
import { Employee } from '../../../type/employee';


export interface Advance {
  id?: number;
  date?: string;
  employee_id?: number;
  employee?: Employee;
  amount: number;
  document_number: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeAdvancesService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private advancesSignal = signal<Advance[]>([]);
  private employeesSignal = signal<Employee[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values
  public advances = computed(() => this.advancesSignal());
  public employees = computed(() => this.employeesSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('advances');
  }

  // Get all advances
  getAdvances(): Observable<Advance[]> {
    this.loadingSignal.set(true);
    return this.http.get<Advance[]>(this.apiEndpoint).pipe(
      tap({
        next: (advances) => {
          this.advancesSignal.set(advances);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

  // Create new advance
  createAdvance(advance: Omit<Advance, 'id'>): Observable<Advance> {
    this.loadingSignal.set(true);
    return this.http.post<Advance>(this.apiEndpoint, advance).pipe(
      tap({
        next: (newAdvance) => {
          const currentAdvances = this.advancesSignal();
          console.log("currentAdvances", currentAdvances);
          console.log("newAdvance (before transform)", newAdvance);
  
          if (!newAdvance.employee?.id) {
            console.error("employee_id is undefined in newAdvance");
            this.errorSignal.set("Invalid employee_id in newAdvance");
            return;
          }
  
          const transformedNewAdvance: any = {
            ...newAdvance,
            employee: { id: newAdvance.employee?.id!, name: newAdvance.employee?.full_name! }, // اضبط الاسم إذا كان متوفرًا
          };
            
          this.advancesSignal.set([...currentAdvances, transformedNewAdvance]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }
  
  

  // Update advance
  updateAdvance(id: number, advance: Advance): Observable<Advance> {
    this.loadingSignal.set(true);

    console.log(advance);
    return this.http.put<Advance>(`${this.apiEndpoint}/${id}`, advance).pipe(
      tap({
        next: (updatedAdvance) => {

          const currentAdvances = this.advancesSignal();
          const updatedAdvances = currentAdvances.map(adv => 
            adv.id === id ? updatedAdvance : adv
          );
          this.advancesSignal.set(updatedAdvances);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.errorSignal.set(error.message);
        },
        finalize: () => {
          this.loadingSignal.set(false);
        }
      })
    );
  }
  

  // Delete advance
  deleteAdvance(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentAdvances = this.advancesSignal();
          this.advancesSignal.set(currentAdvances.filter(adv => adv.id !== id));
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

  // Get employees list
  getEmployees(): Observable<Employee[]> {
    this.loadingSignal.set(true);
    const employeesEndpoint = this.configService.getApiEndpoint('employees');
    return this.http.get<Employee[]>(employeesEndpoint).pipe(
      tap({
        next: (employees) => {
          this.employeesSignal.set(employees);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

getEmployeeAdvancesTotal(employeeId: number): Observable<{ total_advances_for_current_month: number }> {
  this.loadingSignal.set(true);

  return this.http.get<{ total_advances_for_current_month: number }>(
    `${this.apiEndpoint}/employee/${employeeId}/current-month`
  ).pipe(
    tap({
      next: (response) => {
        this.errorSignal.set(null);
      },
      error: (error) => {
        this.errorSignal.set(error.message);
      },
      finalize: () => {
        this.loadingSignal.set(false);
      }
    })
  );
}

} 