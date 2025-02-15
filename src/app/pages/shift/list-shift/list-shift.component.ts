import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Shift } from '../../../type/shift';
import { ShiftService } from '../../../core/services/shifts/shifts.service';
import { LoadingComponent } from "../../../components/ui/loading/loading.component";



@Component({
  selector: 'app-list-shift',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TagModule,
    TooltipModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ConfirmDialogModule,
    InputNumberModule,
    InputTextareaModule,
    LoadingComponent
],
  providers: [
    MessageService,
    ConfirmationService
  ],
  template: `

    <app-loading [show]="loading()" type="circle" message="جاري المعالجة..."></app-loading>


    <div class="card">
      <p-toast></p-toast>
      <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
      
      <p-toolbar styleClass="mb-4">
        <div class="p-toolbar-group-start">
          <h2 class="text-2xl font-bold m-0">قائمة الورديات</h2>
        </div>
        <div class="p-toolbar-group-end">
          <p-button 
            label="إضافة وردية جديدة"
            icon="pi pi-plus"
            styleClass="p-button-raised p-button-primary" 
            [rounded]="true"
            (click)="showAddDialog()">
          </p-button>
        </div>
      </p-toolbar>

      <p-table 
        [value]="shifts()" 
        [rows]="5" 
        [paginator]="true"
        [rowsPerPageOptions]="[5,10,20]"
        [showCurrentPageReport]="true"
        responsiveLayout="scroll"
        [globalFilterFields]="['name', 'start_time', 'end_time']"
        currentPageReportTemplate="عرض {first} إلى {last} من أصل {totalRecords} وردية"
        [rowHover]="true"
        styleClass="p-datatable-gridlines p-datatable-striped">

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 20%">اسم الوردية</th>
            <th style="width: 15%">وقت البداية</th>
            <th style="width: 15%">وقت النهاية</th>
            <th style="width: 15%">فترة التأخير</th>
            <th style="width: 15%">فترة الخروج</th>
            <th style="width: 15%">الإجراءات</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-shift let-i="rowIndex">
  <tr>
    <td class="text-center">{{i + 1}}</td>
    <td>
      <div class="flex align-items-center">
        <i class="pi pi-id-card mr-2"></i>
        {{shift.name}}
      </div>
    </td>
    <td class="text-center">
      <span class="time-badge start-time">
        <i class="pi pi-clock mr-2"></i>
        {{shift.start_time}}  <!-- تم التغيير من startTime -->
      </span>
    </td>
    <td class="text-center">
      <span class="time-badge end-time">
        <i class="pi pi-clock mr-2"></i>
        {{shift.end_time}}    <!-- تم التغيير من endTime -->
      </span>
    </td>
    <td class="text-center">{{shift.allowed_delay_minutes}} دقيقة</td>  <!-- تم التغيير من allowedDelayMinutes -->
    <td class="text-center">{{shift.allowed_exit_minutes}} دقيقة</td>    <!-- تم التغيير من allowedExitMinutes -->
    <td class="text-center">
      <p-button 
        icon="pi pi-pencil" 
        styleClass="p-button-rounded p-button-warning p-button-text mr-2"
        pTooltip="تعديل"
        tooltipPosition="top"
        (click)="editShift(shift)">
      </p-button>
      <p-button 
        icon="pi pi-trash" 
        styleClass="p-button-rounded p-button-danger p-button-text"
        pTooltip="حذف"
        tooltipPosition="top"
        (click)="confirmDelete(shift)">
      </p-button>
    </td>
  </tr>
</ng-template>
      </p-table>

      <!-- Dialog للإضافة والتعديل -->
      <p-dialog 
        [(visible)]="displayDialog" 
        [header]="dialogHeader"
        [modal]="true"
        [style]="{width: '800px'}"
        [draggable]="false"
        [resizable]="false"
        styleClass="p-fluid shift-dialog"
        [rtl]="true">
        
        <div class="grid">
          <!-- معلومات الوردية الأساسية -->
          <div class="col-12">
            <div class="card border-round shadow-2">
              <div class="flex align-items-center mb-4">
                <i class="pi pi-id-card text-2xl text-primary mr-2"></i>
                <h3 class="m-0">معلومات الوردية الأساسية</h3>
              </div>
              <div class="p-fluid">
                <div class="field">
                  <label for="shiftName" class="font-bold">اسم الوردية</label>
                  <span class="p-input-icon-right w-full">
                    <i class="pi pi-pencil"></i>
                    <input 
                      pInputText 
                      id="shiftName" 
                      [(ngModel)]="shift.name" 
                      placeholder="أدخل اسم الوردية"
                      [ngClass]="{'ng-invalid ng-dirty': submitted && !shift.name}"
                      class="w-full p-inputtext-lg" />
                  </span>
                  <small class="p-error" *ngIf="submitted && !shift.name">اسم الوردية مطلوب</small>
                </div>
              </div>
            </div>
          </div>

          <!-- أوقات الوردية -->
          <div class="col-12">
            <div class="card border-round shadow-2">
              <div class="flex align-items-center mb-4">
                <i class="pi pi-clock text-2xl text-primary mr-2"></i>
                <h3 class="m-0">توقيت الوردية</h3>
              </div>
              <div class="grid">
                <div class="col-6">
                  <div class="field">
                    <label class="font-bold mb-2">وقت البداية</label>
                    <p-calendar 
                      [(ngModel)]="startTime" 
                      [timeOnly]="true" 
                      [showIcon]="true"
                      [showSeconds]="false"
                      hourFormat="24"
                      inputId="startTime"
                      placeholder="00:00"
                      styleClass="w-full p-calendar-lg"
                      [ngClass]="{'ng-invalid ng-dirty': submitted && !startTime}">
                    </p-calendar>
                    <small class="p-error" *ngIf="submitted && !startTime">وقت البداية مطلوب</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="field">
                    <label class="font-bold mb-2">وقت النهاية</label>
                    <p-calendar 
                      [(ngModel)]="endTime" 
                      [timeOnly]="true" 
                      [showIcon]="true"
                      [showSeconds]="false"
                      hourFormat="24"
                      inputId="endTime"
                      placeholder="00:00"
                      styleClass="w-full p-calendar-lg"
                      [ngClass]="{'ng-invalid ng-dirty': submitted && !endTime}">
                    </p-calendar>
                    <small class="p-error" *ngIf="submitted && !endTime">وقت النهاية مطلوب</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- الفترات المسموحة والإضافية -->
          <div class="col-12">
            <div class="card border-round shadow-2">
              <div class="flex align-items-center mb-4">
                <i class="pi pi-clock text-2xl text-primary mr-2"></i>
                <h3 class="m-0">الفترات المسموحة والإضافية</h3>
              </div>
              <div class="grid">
                <div class="col-6 field">
                  <label class="font-bold">فترة التأخير المسموحة (دقائق)</label>
                  <p-inputNumber 
                    [(ngModel)]="shift.allowed_delay_minutes"
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    spinnerMode="horizontal"
                    [min]="0"
                    [inputStyleClass]="'text-center'"
                    decrementButtonClass="p-button-secondary"
                    incrementButtonClass="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    placeholder="0"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>
                <div class="col-6 field">
                  <label class="font-bold">فترة الخروج المسموحة (دقائق)</label>
                  <p-inputNumber 
                    [(ngModel)]="shift.allowed_exit_minutes"
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    spinnerMode="horizontal"
                    [min]="0"
                    [inputStyleClass]="'text-center'"
                    decrementButtonClass="p-button-secondary"
                    incrementButtonClass="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    placeholder="0"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>
                <div class="col-6 field">
                  <label class="font-bold">فترة الغياب (دقائق)</label>
                  <p-inputNumber 
                    [(ngModel)]="shift.absence_minutes"
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    spinnerMode="horizontal"
                    [min]="0"
                    [inputStyleClass]="'text-center'"
                    decrementButtonClass="p-button-secondary"
                    incrementButtonClass="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    placeholder="0"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>
                <div class="col-6 field">
                  <label class="font-bold">فترة الإضافي (دقائق)</label>
                  <p-inputNumber 
                    [(ngModel)]="shift.extra_minutes"
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    spinnerMode="horizontal"
                    [min]="0"
                    [inputStyleClass]="'text-center'"
                    decrementButtonClass="p-button-secondary"
                    incrementButtonClass="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    placeholder="0"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>
              </div>
            </div>
          </div>

          <!-- ملاحظات -->
          <div class="col-12">
            <div class="card border-round shadow-2">
              <div class="flex align-items-center mb-4">
                <i class="pi pi-comment text-2xl text-primary mr-2"></i>
                <h3 class="m-0">ملاحظات</h3>
              </div>
              <div class="field">
                <textarea 
                  pInputTextarea 
                  [(ngModel)]="shift.note"
                  rows="3"
                  placeholder="أدخل الملاحظات"
                  class="w-full">
                </textarea>
              </div>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="flex justify-content-end gap-2">
            <p-button 
              label="إلغاء" 
              icon="pi pi-times" 
              styleClass="p-button-text" 
              (click)="hideDialog()">
            </p-button>
            <p-button 
              label="حفظ" 
              icon="pi pi-check" 
              styleClass="p-button-primary" 
              (click)="saveShift()">
            </p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .time-badge {
      padding: 0.5rem;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .start-time {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    .end-time {
      background-color: #fce4ec;
      color: #c2185b;
    }
    .shift-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .shift-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }
    .shift-card-header i {
      margin-left: 0.5rem;
      font-size: 1.2rem;
    }
    .shift-card-header span {
      font-weight: bold;
      font-size: 1.1rem;
    }
    :host ::ng-deep {
      .p-card {
        margin-bottom: 1rem;
      }
      .p-button.p-button-icon-only {
        width: 2.5rem;
        height: 2.5rem;
      }
      .p-inputtext-lg {
        font-size: 1.1rem;
      }
      .p-calendar-lg .p-inputtext {
        font-size: 1.1rem;
      }
    }
  `]

})
export class ListShiftComponent implements OnInit {
  shift: Shift;
  displayDialog: boolean = false;
  submitted: boolean = false;
  isNewShift: boolean = false;
  dialogHeader: string = '';
  startTime: Date | null = null;
  endTime: Date | null = null;

  // استخدام Signals من Service مباشرة
  shifts = this.shiftService.shifts;
  loading = this.shiftService.loading;
  error = this.shiftService.error;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private shiftService: ShiftService
  ) {
    this.shift = this.initializeShift();
  }

  ngOnInit() {
    this.loadShifts();
  }

  loadShifts() {
    this.shiftService.getShifts().subscribe({
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: error.message
        });
      }
    });
  }

  saveShift() {
    this.submitted = true;

    if (this.shift.name && this.startTime && this.endTime) {
      this.shift.start_time = this.formatTime(this.startTime);
      this.shift.end_time = this.formatTime(this.endTime);

      if (this.isNewShift) {
        const { id, ...newShiftData } = this.shift;
        
        this.shiftService.addShift(newShiftData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم بنجاح',
              detail: 'تمت إضافة الوردية بنجاح'
            });
            this.hideDialog();
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
        this.shiftService.updateShift(this.shift.id, this.shift).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم بنجاح',
              detail: 'تم تحديث الوردية بنجاح'
            });
            this.hideDialog();
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

  deleteShift(shift: Shift) {
    this.shiftService.deleteShift(shift.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: 'تم حذف الوردية بنجاح'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: error.message || 'حدث خطأ أثناء حذف الوردية'
        });
      }
    });
  }

  initializeShift(): Shift {
    return {
      id: 0,
      name: '',
      start_time: '',
      end_time: '',
      allowed_delay_minutes: 0,
      allowed_exit_minutes: 0,
      absence_minutes: 0,
      extra_minutes: 0,
      note: '',
    };
  }

  showAddDialog() {
    this.isNewShift = true;
    this.dialogHeader = 'إضافة وردية جديدة';
    this.shift = this.initializeShift();
    this.startTime = null;
    this.endTime = null;
    this.submitted = false;
    this.displayDialog = true;
  }

  editShift(shift: Shift) {
    this.isNewShift = false;
    this.dialogHeader = 'تعديل الوردية';
    this.shift = { ...shift };
    this.startTime = this.parseTime(shift.start_time);
    this.endTime = this.parseTime(shift.end_time);
    this.submitted = false;
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.submitted = false;
    this.loadShifts();
  }


  confirmDelete(shift: Shift) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه الوردية؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.deleteShift(shift);
      }
    });
  }
  


  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'active' ? 'success' : 'danger';
  }

 



  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return date;
  }
}