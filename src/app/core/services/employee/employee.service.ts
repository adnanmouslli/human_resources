import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ConfigService } from '../../../core/services/config.service';
import { Employee, ListEmployee } from '../../../type/employee';


export enum WorkSystem {
  MONTHLY = 'months',
  SHIFT = 'shift',
  HOURS = 'hours',
  PRODUCTION = 'production'
}


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private ListemployeesSubject = new BehaviorSubject<ListEmployee[]>([]);

  public employees$ = this.employeesSubject.asObservable();
  
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('employees');
    
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiEndpoint).pipe(
      tap(employees => {
        console.log("employees", employees);
        this.employeesSubject.next(employees);
      }),
      catchError(this.handleError)
    );
  }

  getListEmployees(): Observable<ListEmployee[]> {
    return this.http.get<ListEmployee[]>(`${this.apiEndpoint}/list`).pipe(
      tap(employees => {
        console.log("employees", employees);
        this.ListemployeesSubject.next(employees);
      }),
      catchError(this.handleError)
    );
  }

  addEmployee(formData: any): Observable<Employee> {

    return this.http.post<Employee>(this.apiEndpoint, formData).pipe(
      tap(newEmployee => {
        const currentEmployees = this.employeesSubject.getValue();
        this.employeesSubject.next([...currentEmployees, newEmployee]);
      }),
      catchError(this.handleError)
    );
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiEndpoint}/${id}`, employee).pipe(
      tap(updatedEmployee => {
        const employees = this.employeesSubject.getValue();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
          employees[index] = updatedEmployee;
          this.employeesSubject.next([...employees]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap(() => {
        const employees = this.employeesSubject.getValue();
        this.employeesSubject.next(employees.filter(e => e.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  getAbsentEmployees(date: string = new Date().toISOString().split('T')[0]): Observable<Employee[]> {
    const url = `${this.apiEndpoint}/absent?date=${date}`;
    return this.http.get<Employee[]>(url).pipe(
      tap(absentEmployees => {
        console.log("Absent Employees", absentEmployees);
      }),
      catchError(this.handleError)
    );
  }

  getEmployeesBySystem(system: WorkSystem): Observable<ListEmployee[]> {
    return this.http.get<ListEmployee[]>(`${this.apiEndpoint}/by-system/${system}`).pipe(
        map(employees => this.sortEmployees(employees)),
        catchError(error => {
            console.error(`Error fetching ${system} employees:`, error);
            return throwError(() => new Error('فشل في جلب بيانات الموظفين'));
        })
    );
}

private sortEmployees(employees: ListEmployee[]): ListEmployee[] {
  return employees.sort((a, b) => a.full_name.localeCompare(b.full_name));
}
  
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Operation failed. Please try again.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request';
          break;
        case 404:
          errorMessage = 'Employee not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }

    if (this.configService.isFeatureEnabled('logging')) {
      console.error('Employee Service Error:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}