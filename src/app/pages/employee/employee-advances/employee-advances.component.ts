import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

// PrimeNG Services
import { ConfirmationService, MessageService } from 'primeng/api';

// Custom Components and Services

import { Advance , EmployeeAdvancesService } from '../../../core/services/advance/advance.service';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { Employee } from '../../../type/employee';
import { ToastService } from '../../../core/services/toast.service';
import { PayrollService } from '../../../core/services/payroll/payroll.service';

@Component({
  selector: 'app-employee-advances',
  templateUrl: './employee-advances.component.html',
  providers: [ConfirmationService, MessageService],
  standalone: true,
  imports: [
    // Angular Modules
    CommonModule,
    FormsModule,
    
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    ConfirmDialogModule,
    TooltipModule,
    SkeletonModule,

    // Custom Components
    LoadingComponent
  ]
})
export class EmployeeAdvancesComponent implements OnInit {
  private advancesService = inject(EmployeeAdvancesService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private PayrollService = inject(PayrollService);

  // Access signals from service
  advances = this.advancesService.advances;
  employees = this.advancesService.employees;
  loading = this.advancesService.loading;
  error = this.advancesService.error;

  displayDialog = false;
  dialogHeader = '';
  advance: Advance = this.getEmptyAdvance();
  selectedEmployee: Employee | null = null;
  submitted = false;


  constructor(
        private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadAdvances();
    this.loadEmployees();
  }

  private getEmptyAdvance(): Advance {
    return {
      amount: 0,
      document_number: '',
      notes: ''
    };
  }

  loadAdvances() {
    this.advancesService.getAdvances().subscribe({
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تحميل البيانات'
        });
      }
    });
  }

  loadEmployees() {
    this.advancesService.getEmployees().subscribe({
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تحميل بيانات الموظفين'
        });
      }
    });
  }

  showAddDialog() {
    this.advance = this.getEmptyAdvance();
    this.selectedEmployee = null;
    this.submitted = false;
    this.dialogHeader = 'إضافة سلفة جديدة';
    this.displayDialog = true;
  }

  editAdvance(advance: Advance) {
    this.advance = { ...advance };
    this.selectedEmployee = advance.employee || null;
    this.dialogHeader = 'تعديل السلفة';
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.submitted = false;
  }

  onEmployeeSelect(event: any) {
    if (event.value) {
      this.advance.employee_id = event.value.id;
    }
  }

  saveAdvance() {
    this.submitted = true;
  
    if (!this.advance.amount || !this.advance.document_number || 
        (!this.advance.id && !this.selectedEmployee)) {
      return;
    }
  
    const employeeId = this.advance.id ? this.advance.employee_id : this.selectedEmployee?.id;
  
    if (!employeeId) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'لم يتم تحديد الموظف'
      });
      return;
    }
  
    // الحصول على الشهر والسنة الحاليين
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() يبدأ من 0
    const currentYear = today.getFullYear();
  
    // حساب راتب الموظف الحالي باستخدام الخدمة الجديدة
    this.PayrollService.calculateEmployeePayroll(employeeId, {
      month: currentMonth,
      year: currentYear
    }).subscribe({
      next: (payrollData) => {
        // الحصول على الراتب الإجمالي الحالي
        const netSalary = parseFloat(payrollData.salary_details.net_salary);
  
        
            const employeeList = this.advancesService.employees(); 
            const employee = employeeList.find(emp => emp.id === employeeId);
  
            if (!employee) {
              this.messageService.add({
                severity: 'error',
                summary: 'خطأ',
                detail: 'لم يتم العثور على بيانات الموظف'
              });
              return;
            }
  
            // استخدام الراتب الإجمالي الحالي بدلاً من الراتب الأساسي
            const maxAllowedAdvance = netSalary * employee.advancePercentage!;
  
            const newTotal = this.advance.amount;
  
            console.log('صافي الراتب الحالي:', netSalary);
            console.log('السلفة الجديدة:', this.advance.amount);
            console.log('المجموع الكلي للسلف:', newTotal);
            console.log('الحد الأقصى المسموح به:', maxAllowedAdvance);
  
            if (newTotal > maxAllowedAdvance) {
              this.toastService.error(
                `الموظف تجاوز الحد المسموح للسلف. الحد المسموح: ${this.PayrollService.formatCurrency(maxAllowedAdvance)}, السلفة الحالية: ${this.PayrollService.formatCurrency(newTotal)}`, 
                'رفض العملية'
              );
              return;
            }
  
            // إذا كان كل شيء صحيحًا، يتم تنفيذ الإضافة أو التحديث
            if (this.advance.id) {
              this.advancesService.updateAdvance(this.advance.id, this.advance).subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'نجاح',
                    detail: 'تم تحديث السلفة بنجاح'
                  });
                  this.hideDialog();
                },
                error: () => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'خطأ',
                    detail: 'حدث خطأ أثناء تحديث السلفة'
                  });
                }
              });
            } else {
              const newAdvance = {
                ...this.advance,
                employee_id: employeeId
              };
  
              this.advancesService.createAdvance(newAdvance).subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'نجاح',
                    detail: 'تم إضافة السلفة بنجاح'
                  });
                  this.hideDialog();
                },
                error: () => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'خطأ',
                    detail: 'حدث خطأ أثناء إضافة السلفة'
                  });
                }
              });
            }
        
      },
      error: (error:any) => {
        console.error('خطأ في حساب راتب الموظف:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذر حساب الراتب الإجمالي الحالي للموظف'
        });
      }
    });
  }

  confirmDelete(advance: Advance) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه السلفة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (advance.id) {
          this.advancesService.deleteAdvance(advance.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'نجاح',
                detail: 'تم حذف السلفة بنجاح'
              });
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'خطأ',
                detail: 'حدث خطأ أثناء حذف السلفة'
              });
            }
          });
        }
      }
    });
  }
}