// src/app/core/services/job-titles/job-titles.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { ConfigService } from '../config.service';
import { JobTitle } from '../../../type/job-title';

@Injectable({
  providedIn: 'root'
})
export class JobTitleService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiEndpoint: string;

  // State management using Signals
  private jobTitlesSignal = signal<JobTitle[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values
  public jobTitles = computed(() => this.jobTitlesSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.apiEndpoint = this.configService.getApiEndpoint('jobTitles');
  }

  getJobTitles(): Observable<JobTitle[]> {
    this.loadingSignal.set(true);
    return this.http.get<JobTitle[]>(this.apiEndpoint).pipe(
      tap({
        next: (jobTitles) => {
          this.jobTitlesSignal.set(jobTitles);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

  addJobTitle(jobTitle: Omit<JobTitle, 'id'>): Observable<JobTitle> {
    this.loadingSignal.set(true);
    return this.http.post<JobTitle>(this.apiEndpoint, jobTitle).pipe(
      tap({
        next: (newJobTitle) => {
          const currentJobTitles = this.jobTitlesSignal();
          this.jobTitlesSignal.set([...currentJobTitles, newJobTitle]);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

  updateJobTitle(id: number, jobTitle: JobTitle): Observable<JobTitle> {
    this.loadingSignal.set(true);
    return this.http.put<JobTitle>(`${this.apiEndpoint}/${id}`, jobTitle).pipe(
      tap({
        next: (updatedJobTitle) => {
          const currentJobTitles = this.jobTitlesSignal();
          const updatedJobTitles = currentJobTitles.map(jt => 
            jt.id === id ? updatedJobTitle : jt
          );
          this.jobTitlesSignal.set(updatedJobTitles);
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

  deleteJobTitle(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiEndpoint}/${id}`).pipe(
      tap({
        next: () => {
          const currentJobTitles = this.jobTitlesSignal();
          this.jobTitlesSignal.set(currentJobTitles.filter(jt => jt.id !== id));
          this.errorSignal.set(null);
        },
        error: (error) => this.errorSignal.set(error.message),
        finalize: () => this.loadingSignal.set(false)
      })
    );
  }

  getEnabledSystems(jobTitleId: number): Observable<{ enabled_systems: string[] }> {
    return this.http.get<{ enabled_systems: string[] }>(
      `${this.apiEndpoint}/${jobTitleId}/enabled_systems`
    );
  }

}