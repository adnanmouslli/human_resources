// attendance.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ConfigService } from '../../../core/services/config.service';
import { AttendanceRecord } from '../../../type/attendance';


@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  
  private attendanceSubject = new BehaviorSubject<AttendanceRecord[]>([]);
  public attendance$ = this.attendanceSubject.asObservable();
  
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('attendances');
  }

  getAttendanceSummary(date: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiEndpoint}/summary?startDate=${date}`).pipe(
      tap(records => {
        console.log("attendance records", records);
        this.attendanceSubject.next(records);
      }),
      catchError(this.handleError)
    );
  }

  checkIn(employeeId: number, checkInTime?: string): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.apiEndpoint}/checkin`, {
      empId: employeeId,
      checkInTime: checkInTime || null
    }).pipe(
      tap(newRecord => {
        const currentRecords = this.attendanceSubject.getValue();
        const index = currentRecords.findIndex(r => r.employee.id === employeeId);
        
        if (index !== -1) {
          // Update existing record
          currentRecords[index] = newRecord;
          this.attendanceSubject.next([...currentRecords]);
        } else {
          // Add new record
          this.attendanceSubject.next([...currentRecords, newRecord]);
        }
      }),
      catchError(this.handleError)
    );
  }


 
  checkOut(employeeId: number, productivity?: number): Observable<AttendanceRecord> {
    const payload = { 
      empId: employeeId,
      productionQuantity: productivity 
    };
    return this.http.post<AttendanceRecord>(`${this.apiEndpoint}/checkout`, payload).pipe(
      tap(updatedRecord => {
        const currentRecords = this.attendanceSubject.getValue();
        const index = currentRecords.findIndex(r => r.employee.id === employeeId);
        
        if (index !== -1) {
          currentRecords[index] = updatedRecord;
          this.attendanceSubject.next([...currentRecords]);
        }
      }),
      catchError(this.handleError)
    );
  }

  updateAttendanceRecord(id: number, record: Partial<AttendanceRecord>): Observable<AttendanceRecord> {
    return this.http.put<AttendanceRecord>(`${this.apiEndpoint}/${id}`, record).pipe(
      tap(updatedRecord => {
        const records = this.attendanceSubject.getValue();
        const index = records.findIndex(r => r.employee.id === updatedRecord.employee.id);
        if (index !== -1) {
          records[index] = updatedRecord;
          this.attendanceSubject.next([...records]);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Operation failed. Please try again.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid attendance request';
          break;
        case 404:
          errorMessage = 'Attendance record not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }

    if (this.configService.isFeatureEnabled('logging')) {
      console.error('Attendance Service Error:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}