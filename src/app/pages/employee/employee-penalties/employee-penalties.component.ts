import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';

interface Employee {
  id: number;
  code: string;
  name: string;
}

interface Penalty {
  id?: number;
  date: Date;
  employee_code: string;
  employee_name: string;
  amount: number;
  document_number: string;
  notes?: string;
}

@Component({
  selector: 'app-employee-penalties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    ConfirmDialogModule,
    TooltipModule,
    LoadingComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employee-penalties.component.html',
  styleUrl: './employee-penalties.component.scss'
})
export class EmployeePenaltiesComponent implements OnInit {
  // Signals
  penalties = signal<Penalty[]>([]);
  loading = signal<boolean>(false);

  // Component properties
  displayDialog: boolean = false;
  dialogHeader: string = '';
  submitted: boolean = false;
  
  penalty: Penalty = this.getNewPenalty();
  selectedEmployee: Employee | null = null;
  
  employees: Employee[] = [
    { id: 1, code: 'EMP001', name: 'أحمد محمد' },
    { id: 2, code: 'EMP002', name: 'محمد علي' },
    // يمكن إضافة المزيد من الموظفين هنا
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPenalties();
  }

  loadPenalties() {
    this.loading.set(true);
    // هنا يتم استدعاء الخدمة لجلب البيانات من الباك اند
    setTimeout(() => {
      this.penalties.set([
        {
          id: 1,
          date: new Date(),
          employee_code: 'EMP001',
          employee_name: 'أحمد محمد',
          amount: 100,
          document_number: 'PEN001',
          notes: 'جزاء تأخير'
        }
      ]);
      this.loading.set(false);
    }, 1000);
  }

  getNewPenalty(): Penalty {
    return {
      date: new Date(),
      employee_code: '',
      employee_name: '',
      amount: 0,
      document_number: ''
    };
  }

  showAddDialog() {
    this.penalty = this.getNewPenalty();
    this.selectedEmployee = null;
    this.dialogHeader = 'إضافة جزاء جديد';
    this.submitted = false;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.submitted = false;
  }

  onEmployeeSelect(event: any) {
    if (event.value) {
      this.penalty.employee_code = event.value.code;
      this.penalty.employee_name = event.value.name;
    } else {
      this.penalty.employee_code = '';
      this.penalty.employee_name = '';
    }
  }

  editPenalty(penalty: Penalty) {
    this.penalty = { ...penalty };
    this.selectedEmployee = this.employees.find(emp => emp.code === penalty.employee_code) || null;
    this.dialogHeader = 'تعديل الجزاء';
    this.displayDialog = true;
  }

  confirmDelete(penalty: Penalty) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الجزاء؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deletePenalty(penalty);
      }
    });
  }

  deletePenalty(penalty: Penalty) {
    // هنا يتم استدعاء الخدمة لحذف الجزاء
    const currentPenalties = this.penalties();
    this.penalties.set(currentPenalties.filter(p => p.id !== penalty.id));
    
    this.messageService.add({
      severity: 'success',
      summary: 'تم بنجاح',
      detail: 'تم حذف الجزاء'
    });
  }

  savePenalty() {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.penalty.id) {
      // تحديث جزاء موجود
      const currentPenalties = this.penalties();
      const index = currentPenalties.findIndex(p => p.id === this.penalty.id);
      if (index !== -1) {
        currentPenalties[index] = this.penalty;
        this.penalties.set([...currentPenalties]);
      }
      this.messageService.add({
        severity: 'success',
        summary: 'تم بنجاح',
        detail: 'تم تحديث الجزاء'
      });
    } else {
      // إضافة جزاء جديد
      this.penalty.id = this.generateId();
      this.penalties.update(penalties => [...penalties, this.penalty]);
      this.messageService.add({
        severity: 'success',
        summary: 'تم بنجاح',
        detail: 'تمت إضافة الجزاء'
      });
    }

    this.hideDialog();
  }

  private isFormValid(): boolean {
    return !!(
      this.penalty.date &&
      this.penalty.employee_code &&
      this.penalty.amount &&
      this.penalty.document_number
    );
  }

  private generateId(): number {
    const currentPenalties = this.penalties();
    const maxId = currentPenalties.reduce((max, penalty) => 
      penalty.id && penalty.id > max ? penalty.id : max, 0
    );
    return maxId + 1;
  }
}