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
    this.dialogHeader = 'إضافة مهنة جديدة';
    this.submitted = false;
    this.displayDialog = true;
  }

  editProfession(profession: Profession) {
    this.profession = { ...profession };
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

  getStatusSeverity(status: string): string {
    return status === 'active' ? 'success' : 'danger';
  }

  private validateForm(): boolean {
    return !!(
      this.profession.name &&
      this.profession.hourly_rate &&
      this.profession.daily_rate
    );
  }


  
  private handleSaveSuccess(message: string) {
    this.hideDialog();
    this.toastService.success(message , "نجح");
  }

  private handleSaveError(error: any) {
    this.toastService.error(error.message || 'حدث خطأ أثناء حفظ البيانات'  , "خطأ");
  }
}