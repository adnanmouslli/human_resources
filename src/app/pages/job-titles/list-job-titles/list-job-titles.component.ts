import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';
import { JobTitle } from '../../../type/job-title';
import { JobTitleService } from '../../../core/services/job-titles/job-titles.service';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';

@Component({
  selector: 'app-list-job-titles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    ConfirmDialogModule,
    CheckboxModule,
    LoadingComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-job-titles.component.html',
  styles: [`
    :host ::ng-deep {
      .p-datatable .p-datatable-header {
        padding: 1rem;
        text-align: right;
      }
      .p-dialog .p-dialog-content {
        padding: 2rem;
      }
      .field {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class ListJobTitlesComponent implements OnInit {
  jobTitle: JobTitle;
  breakTime: Date | null = null;
  displayDialog: boolean = false;
  submitted: boolean = false;
  isNewJobTitle: boolean = false;
  dialogHeader: string = '';

  jobTitles = this.jobTitleService.jobTitles;
  loading = this.jobTitleService.loading;
  error = this.jobTitleService.error;

  constructor(
    private jobTitleService: JobTitleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.jobTitle = this.initializeJobTitle();
  }

  ngOnInit() {
    this.loadJobTitles();
  }

  initializeJobTitle(): JobTitle {
    return {
      title_name: '',
      allowed_break_time: '00:00',
      overtime_hour_value: 0,
      delay_minute_value: 0,
      shift_system: false,
      production_system: false
      // work_systems: {
      //   custom_system: false,
      //   hours_system: false,
      //   productivity_system: false,
      //   shift_system: false
      // }
    };
  }

  loadJobTitles() {
    this.jobTitleService.getJobTitles().subscribe({
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: error.message
        });
      }
    });
  }

  showAddDialog() {
    this.isNewJobTitle = true;
    this.dialogHeader = 'إضافة مسمى وظيفي جديد';
    this.jobTitle = this.initializeJobTitle();
    this.breakTime = null;
    this.submitted = false;
    this.displayDialog = true;
  }

  editJobTitle(jobTitle: JobTitle) {
    this.isNewJobTitle = false;
    this.dialogHeader = 'تعديل المسمى الوظيفي';
    this.jobTitle = { ...jobTitle };
    this.breakTime = this.parseTime(jobTitle.allowed_break_time);
    this.submitted = false;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.submitted = false;
  }

  saveJobTitle() {
    this.submitted = true;
    
    if (this.isValid()) {
      this.jobTitle.allowed_break_time = this.formatTime(this.breakTime!);

      if (this.isNewJobTitle) {
        this.jobTitleService.addJobTitle(this.jobTitle).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم بنجاح',
              detail: 'تمت إضافة المسمى الوظيفي بنجاح'
            });
            
            this.hideDialog();
            this.loadJobTitles();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: error.message
            });
          }
        });
      } else {
        this.jobTitleService.updateJobTitle(this.jobTitle.id!, this.jobTitle).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم بنجاح',
              detail: 'تم تحديث المسمى الوظيفي بنجاح'
            });
            this.hideDialog();
            this.loadJobTitles();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: error.message
            });
          }
        });
      }
    }
  }

  confirmDelete(jobTitle: JobTitle) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا المسمى الوظيفي؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.deleteJobTitle(jobTitle);
      }
    });
  }

  deleteJobTitle(jobTitle: JobTitle) {
    this.jobTitleService.deleteJobTitle(jobTitle.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: 'تم حذف المسمى الوظيفي بنجاح'
        });
        this.loadJobTitles();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: error.message
        });
      }
    });
  }

  private isValid(): boolean {
    return !!(
      this.jobTitle.title_name &&
      this.breakTime &&
      this.jobTitle.overtime_hour_value >= 0 &&
      this.jobTitle.delay_minute_value >= 0
    );
  }
  
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    return date;
  }
}
