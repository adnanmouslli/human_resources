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

interface Reward {
  id?: number;
  date: Date;
  employee_code: string;
  employee_name: string;
  amount: number;
  document_number: string;
  notes?: string;
}

@Component({
  selector: 'app-employee-rewards',
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
  templateUrl: './employee-rewards.component.html',
  styleUrl: './employee-rewards.component.scss'
})
export class EmployeeRewardsComponent implements OnInit {
  // Signals
  rewards = signal<Reward[]>([]);
  loading = signal<boolean>(false);

  // Component properties
  displayDialog: boolean = false;
  dialogHeader: string = '';
  submitted: boolean = false;
  
  reward: Reward = this.getNewReward();
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
    this.loadRewards();
  }

  loadRewards() {
    this.loading.set(true);
    // هنا يتم استدعاء الخدمة لجلب البيانات من الباك اند
    setTimeout(() => {
      this.rewards.set([
        {
          id: 1,
          date: new Date(),
          employee_code: 'EMP001',
          employee_name: 'أحمد محمد',
          amount: 500,
          document_number: 'REW001',
          notes: 'مكافأة الأداء المتميز'
        }
      ]);
      this.loading.set(false);
    }, 1000);
  }

  getNewReward(): Reward {
    return {
      date: new Date(),
      employee_code: '',
      employee_name: '',
      amount: 0,
      document_number: ''
    };
  }

  showAddDialog() {
    this.reward = this.getNewReward();
    this.selectedEmployee = null;
    this.dialogHeader = 'إضافة مكافأة جديدة';
    this.submitted = false;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.submitted = false;
  }

  onEmployeeSelect(event: any) {
    if (event.value) {
      this.reward.employee_code = event.value.code;
      this.reward.employee_name = event.value.name;
    } else {
      this.reward.employee_code = '';
      this.reward.employee_name = '';
    }
  }

  editReward(reward: Reward) {
    this.reward = { ...reward };
    this.selectedEmployee = this.employees.find(emp => emp.code === reward.employee_code) || null;
    this.dialogHeader = 'تعديل المكافأة';
    this.displayDialog = true;
  }

  confirmDelete(reward: Reward) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه المكافأة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteReward(reward);
      }
    });
  }

  deleteReward(reward: Reward) {
    // هنا يتم استدعاء الخدمة لحذف المكافأة
    const currentRewards = this.rewards();
    this.rewards.set(currentRewards.filter(r => r.id !== reward.id));
    
    this.messageService.add({
      severity: 'success',
      summary: 'تم بنجاح',
      detail: 'تم حذف المكافأة'
    });
  }

  saveReward() {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.reward.id) {
      // تحديث مكافأة موجودة
      const currentRewards = this.rewards();
      const index = currentRewards.findIndex(r => r.id === this.reward.id);
      if (index !== -1) {
        currentRewards[index] = this.reward;
        this.rewards.set([...currentRewards]);
      }
      this.messageService.add({
        severity: 'success',
        summary: 'تم بنجاح',
        detail: 'تم تحديث المكافأة'
      });
    } else {
      // إضافة مكافأة جديدة
      this.reward.id = this.generateId();
      this.rewards.update(rewards => [...rewards, this.reward]);
      this.messageService.add({
        severity: 'success',
        summary: 'تم بنجاح',
        detail: 'تمت إضافة المكافأة'
      });
    }

    this.hideDialog();
  }

  private isFormValid(): boolean {
    return !!(
      this.reward.date &&
      this.reward.employee_code &&
      this.reward.amount &&
      this.reward.document_number
    );
  }

  private generateId(): number {
    const currentRewards = this.rewards();
    const maxId = currentRewards.reduce((max, reward) => 
      reward.id && reward.id > max ? reward.id : max, 0
    );
    return maxId + 1;
  }
}