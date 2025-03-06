import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { Profession, ProfessionsService } from '../../../core/services/professions/professions.service';
import { LoadingComponent } from "../../../components/ui/loading/loading.component";
import { ToolbarModule } from 'primeng/toolbar';
import { ToastService } from '../../../core/services/toast.service';

interface ProfessionStatus {
  label: string;
  value: string;
}

interface RateType {
  label: string;
  value: string;
}

@Component({
  selector: 'app-hours-professions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectButtonModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule,
    LoadingComponent,
    ToolbarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './hours-professions.component.html',
  styleUrl: './hours-professions.component.scss'
})
export class HoursProfessionsComponent implements OnInit {
  private professionsService = inject(ProfessionsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  // Signals from service
  loading = this.professionsService.loading;
  professions = this.professionsService.professions;
  error = this.professionsService.error;
  
  // Component state
  displayDialog = false;
  dialogHeader = '';
  submitted = false;

  // Form model
  profession: Profession = {
    name: '',
    hourly_rate: 0,
    daily_rate: 0,
    // status: 'active'
  };

  // Rate type options
  rateTypeOptions: RateType[] = [
    { label: 'قيمة الساعة فقط', value: 'hourly' },
    { label: 'القيمة اليومية فقط', value: 'daily' },
    { label: 'كلاهما', value: 'both' }
  ];

  // Selected rate type (hourly, daily, or both)
  selectedRateType: string = 'both';

  // Status options for select button
  statusOptions: ProfessionStatus[] = [
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' }
  ];

  ngOnInit() {
    this.loadProfessions();
  }

  loadProfessions() {
    this.professionsService.getAllProfessions().subscribe({
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: error.message || 'حدث خطأ أثناء تحميل البيانات'
        });
      }
    });
  }

  showAddDialog() {
    this.profession = {
      name: '',
      hourly_rate: 0,
      daily_rate: 0,
      // status: 'active'
    };
    
    // Set default selected rate type
    this.selectedRateType = 'both';
    
    this.dialogHeader = 'إضافة مهنة جديدة';
    this.submitted = false;
    this.displayDialog = true;
  }

  editProfession(profession: Profession) {
    this.profession = { ...profession };
    
    // Set selected rate type based on existing values
    if (profession.hourly_rate > 0 && profession.daily_rate > 0) {
      this.selectedRateType = 'both';
    } else if (profession.hourly_rate > 0) {
      this.selectedRateType = 'hourly';
    } else if (profession.daily_rate > 0) {
      this.selectedRateType = 'daily';
    } else {
      // Fallback to both if none are set
      this.selectedRateType = 'both';
    }
    
    this.dialogHeader = 'تعديل مهنة';
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.submitted = false;
  }

  saveProfession() {
    this.submitted = true;

    if (this.validateForm()) {
      // Set rates to 0 if not selected
      if (!this.showHourlyRate()) {
        this.profession.hourly_rate = 0;
      }
      if (!this.showDailyRate()) {
        this.profession.daily_rate = 0;
      }

      if (this.profession.id) {
        this.professionsService.updateProfession(this.profession.id, this.profession).subscribe({
          next: () => this.handleSaveSuccess('تم تحديث المهنة بنجاح'),
          error: (error) => this.handleSaveError(error)
        });
      } else {
        const { id, ...newProfession } = this.profession;
        this.professionsService.createProfession(newProfession).subscribe({
          next: () => this.handleSaveSuccess('تم إضافة المهنة بنجاح'),
          error: (error) => this.handleSaveError(error)
        });
      }
    }
  }

  confirmDelete(profession: Profession) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه المهنة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        if (profession.id) {
          this.professionsService.deleteProfession(profession.id).subscribe({
            next: () => {
              this.messageService.add({ 
                severity: 'success', 
                summary: 'نجاح', 
                detail: 'تم حذف المهنة بنجاح' 
              });
            },
            error: (error) => {
              this.messageService.add({ 
                severity: 'error', 
                summary: 'خطأ', 
                detail: error.message || 'حدث خطأ أثناء حذف المهنة' 
              });
            }
          });
        }
      }
    });
  }

  // Helper methods to determine which fields to show
  showHourlyRate(): boolean {
    return this.selectedRateType === 'hourly' || this.selectedRateType === 'both';
  }

  showDailyRate(): boolean {
    return this.selectedRateType === 'daily' || this.selectedRateType === 'both';
  }

  getStatusSeverity(status: string): string {
    return status === 'active' ? 'success' : 'danger';
  }

  private validateForm(): boolean {
    // Validate name is required
    if (!this.profession.name) {
      return false;
    }
    
    // Rate type must be selected
    if (!this.selectedRateType) {
      return false;
    }
    
    // Validate hourly rate if hourly or both are selected
    if (this.showHourlyRate() && !this.profession.hourly_rate) {
      return false;
    }
    
    // Validate daily rate if daily or both are selected
    if (this.showDailyRate() && !this.profession.daily_rate) {
      return false;
    }
    
    return true;
  }

  private handleSaveSuccess(message: string) {
    this.hideDialog();
    this.toastService.success(message, "نجح");
  }

  private handleSaveError(error: any) {
    this.toastService.error(error.message || 'حدث خطأ أثناء حفظ البيانات', "خطأ");
  }
}