import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { AttendanceRecord, AttendanceStats } from '../../../type/attendance';
import { AttendanceService } from '../../../core/services/attendance/attendance.service';
import { Employee } from '../../../type/employee';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-attendance-employees',
  standalone: true,
  imports: [
    // Angular Modules
    CommonModule,
    FormsModule,
    
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    CardModule,
    TagModule,
    TooltipModule,
    ChartModule,
    DialogModule,
    ProgressBarModule,
    AvatarModule,
    BadgeModule,
    InputNumberModule,
    TabViewModule,
    FieldsetModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './attendance-employees.component.html',
  styles: [`
    .attendance-page {
      padding: 1.5rem;
    }
    
    .stats-card {
      background: var(--surface-card);
      border-radius: var(--border-radius);
      padding: 1.5rem;
    }
    
    .stats-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-900);
    }

    .attendance-details-dialog .p-dialog-content {
      padding: 0;
    }

    .late-time {
      &.warning {
        color: var(--yellow-600);
      }
      &.danger {
        color: var(--red-600);
      }
    }

    :host ::ng-deep {
      .p-card {
        border-radius: var(--border-radius);
        box-shadow: var(--card-shadow);
      }

      .p-datatable {
        .p-datatable-header {
          background: var(--surface-card);
          border: none;
          padding: 1rem;
        }

        .p-datatable-thead > tr > th {
          background: var(--surface-ground);
          padding: 1rem;
        }

        .p-datatable-tbody > tr {
          transition: background-color 0.2s;

          &:hover {
            background: var(--surface-hover);
          }
        }
      }

      .p-calendar {
        .p-inputtext {
          min-width: 150px;
        }
      }

      .p-progressbar {
        background: var(--surface-200);
        .p-progressbar-value {
          background: var(--primary-color);
        }
      }
    }
  `]
})
export class AttendanceEmployeesComponent implements OnInit {
showDetailsDialog: boolean = false;
selectedRecord: any = null;
 

showCheckInDialog: boolean = false;
showCheckOutDialog: boolean = false;
currentDateTime: string = '';
productivityAmount: number = 0;
isProductivityBased: boolean = false;


selectedDate: Date = new Date();
attendanceRecords: AttendanceRecord[] = [];

attendance$ = this.attendanceService.attendance$;


stats: AttendanceStats = {
  present: 0,
  absent: 0,
  late: 0,
  total: 0
};


// اعدادات تسجيل الحضور الخارجي
showAddAttendanceDialog: boolean = false;
selectedEmployee: Employee | null = null;
selectedAttendanceTime: Date = new Date();
employees: Employee[] = []; // قائمة الموظفين
disableCheckInButton: boolean = false; // إضافة متغير لتعطيل الزر

checkOutTime: Date = new Date();
checkInTime: Date = new Date();
checkInReason: string = '';
checkOutReason: string = '';

openAddAttendanceDialog() {
  const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  this.selectedAttendanceTime = new Date(); // الوقت الافتراضي هو الآن

  // جلب الموظفين الذين لم يسجلوا حضورًا
  if (today) {
    this.employeeService.getAbsentEmployees(today).subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => console.error('Error fetching absent employees:', error)
    });
  }

  this.showAddAttendanceDialog = true;
  this.selectedEmployee = null;
}

cancelAddAttendance() {
  this.showAddAttendanceDialog = false;
  this.selectedEmployee = null;
  this.selectedAttendanceTime = new Date();
}

confirmAddAttendance() {
  if (!this.selectedEmployee || !this.selectedAttendanceTime) {
    alert('يرجى اختيار الموظف ووقت الحضور.');
    return;
  }

  const attendanceData = {
    employeeId: this.selectedEmployee.id,
    checkInTime: this.datePipe.transform(this.selectedAttendanceTime, 'HH:mm:ss'), // صيغة الوقت
  };
  
  this.attendanceService.checkIn(this.selectedEmployee.id , attendanceData.checkInTime!).subscribe({
    next: () => {
      this.showAddAttendanceDialog = false;
      this.loadAttendanceData(); // تحديث جدول الحضور
    },
    error: (error) => console.error('Error adding attendance:', error),
  });

}


  constructor(
    private attendanceService: AttendanceService ,
    private datePipe: DatePipe, 
    private employeeService: EmployeeService,

  ) {}


  // أولاً، نضيف دالة مساعدة في الكومبوننت للتعامل مع تنسيق الوقت
getWorkTimePercentage(totalWorkTime: string): number {
  if (!totalWorkTime) return 0;
  
  // التعامل مع التنسيق "X hours Y minutes"
  const matches = totalWorkTime.match(/(\d+)\s*hours\s*(\d+)\s*minutes/);
  if (matches) {
    const hours = parseInt(matches[1]);
    const minutes = parseInt(matches[2]);
    const totalMinutes = (hours * 60) + minutes;
    // اعتبار يوم العمل 8 ساعات
    return (totalMinutes / (8 * 60)) * 100;
  }
  return 0;
}



  ngOnInit(): void {
    this.loadAttendanceData();
  }
  // تحديث البيانات عند تغيير التاريخ
  onDateChange(event: any) {
    this.loadAttendanceData();

    // تحقق من إذا كان التاريخ المحدد هو اليوم
    const selectedDate = this.selectedDate;
    const currentDate = new Date();

    // تحقق إذا كان التاريخ المختار يطابق تاريخ اليوم
    if (selectedDate.getFullYear() === currentDate.getFullYear() &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getDate() === currentDate.getDate()) {
      this.disableCheckInButton = false; // إذا كان التاريخ هو اليوم، يمكن تمكين الزر
    } else {
      this.disableCheckInButton = true; // إذا كان التاريخ غير اليوم، تعطيل الزر
    }
  }


  loadAttendanceData() {
    const formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-M-d'); // تنسيق التاريخ
    if (formattedDate) {
      this.attendanceService.getAttendanceSummary(formattedDate).subscribe({
        next: (data: any[]) => {
          // @ts-ignore
          if (data && data.message) {
            this.attendanceRecords = [];
          } else {
            this.attendanceRecords = data || [];
          }
  
          this.updateStatistics();
        },
        error: (error) => console.error('Error loading attendance data:', error)
      });
    }
  }
  
  

  updateStatistics() {
    const stats = {
      present: this.attendanceRecords?.filter(r => r.actualCheckIn).length,
      absent: this.attendanceRecords?.filter(r => !r.actualCheckIn).length,
      late: this.attendanceRecords?.filter(r => r.checkInStatus === 'Late').length,
      total: this.attendanceRecords?.length
    };
    this.stats = stats;
  }
  
  
// Add these methods to the component class
updateCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  this.currentDateTime = `${hours}:${minutes}`;
}

openCheckInDialog(record: any) {
  this.selectedRecord = record;
  // تعيين الوقت الحالي كقيمة افتراضية
  this.checkInTime = new Date();
  // إعادة تعيين سبب الدخول
  this.checkInReason = '';
  this.showCheckInDialog = true;
}
openCheckOutDialog(record: any) {
  this.selectedRecord = record;
  // تعيين الوقت الحالي كقيمة افتراضية
  this.checkOutTime = new Date();
  // إعادة تعيين سبب الخروج
  this.checkOutReason = '';
  // تعيين إذا كان الموظف يعمل بنظام الإنتاجية
  this.isProductivityBased = record?.employee?.work_system === 'production';
  this.showCheckOutDialog = true;
}



// تعديل دالة تأكيد الحضور
confirmCheckIn() {
  if (this.selectedRecord) {
    // تنسيق الوقت المختار إلى سلسلة نصية بتنسيق "HH:MM:SS"
    const hours = this.checkInTime.getHours().toString().padStart(2, '0');
    const minutes = this.checkInTime.getMinutes().toString().padStart(2, '0');
    const seconds = this.checkInTime.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    this.attendanceService.checkIn(
      this.selectedRecord.employee.id, 
      formattedTime,
      this.checkInReason // إضافة سبب الدخول
    ).subscribe({
      next: () => {
        this.showCheckInDialog = false;
        this.selectedRecord = null;
        this.loadAttendanceData();
      },
      error: (error) => console.error('Error checking in:', error)
    });
  }
}

confirmCheckOut() {
  if (this.selectedRecord) {
    // تنسيق الوقت المختار إلى سلسلة نصية بتنسيق "HH:MM:SS"
    const hours = this.checkOutTime.getHours().toString().padStart(2, '0');
    const minutes = this.checkOutTime.getMinutes().toString().padStart(2, '0');
    const seconds = this.checkOutTime.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    this.attendanceService.checkOut(
      this.selectedRecord.employee.id,
      formattedTime, // وقت الانصراف المخصص
      this.checkOutReason // إضافة سبب الخروج
    ).subscribe({
      next: () => {
        this.showCheckOutDialog = false;
        this.productivityAmount = 0;
        this.selectedRecord = null;
        this.loadAttendanceData();
      },
      error: (error) => console.error('Error checking out:', error)
    });
  }
}


  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'حاضر':
        return 'success';
      case 'متأخر':
        return 'warning';
      case 'غائب':
        return 'danger';
      case 'إجازة':
        return 'info';
      default:
        return 'secondary';
    }
  }

  showDetails(record: any) {
    this.selectedRecord = record;
    this.showDetailsDialog = true;
  }

  editRecord(record: any) {
    console.log('تعديل السجل:', record);
    // يمكن إضافة منطق التعديل هنا
  }

  getLateClass(minutes: number): string {
    if (minutes === 0) return '';
    return minutes <= 15 ? 'late-time warning' : 'late-time danger';
  }

  getAvatarLabel(name: string | undefined): string {
    if (!name) return '??';
    return name.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  
  // دالة للحصول على لون عشوائي ثابت لكل موظف
  getAvatarColor(name: string | undefined): string {
    if (!name) return '#000000'; // لون افتراضي في حالة عدم وجود اسم
    
    const colors = [
      '#2196F3', '#4CAF50', '#FF9800', '#E91E63',
      '#9C27B0', '#3F51B5', '#00BCD4', '#009688'
    ];
  
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  exportToExcel() {
    // يمكن إضافة منطق التصدير إلى Excel هنا
    console.log('جاري التصدير إلى Excel...');
  }

  calculateWorkingHours(checkIn: string, checkOut: string): string {
    if (!checkIn || !checkOut) return '0:00';
      
    const start = new Date(`2024-01-01 ${checkIn}`);
    const end = new Date(`2024-01-01 ${checkOut}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }


  // في الكومبوننت، نضيف هذه الدالة لتنسيق الوقت
formatTime(timeStr: string): string {
  if (!timeStr) return '-';
  
  // إذا كان التنسيق مثل "09:32:28.501396"
  if (timeStr.includes(':')) {
    // نأخذ فقط الساعات والدقائق
    return timeStr.split('.')[0].slice(0, 5);
  }
  return timeStr;
}

// دالة لتنسيق مدة العمل
formatWorkTime(workTime: string): string {
  if (!workTime) return '-';
  
  // تنسيق مثل "0 hours 24 minutes"
  const matches = workTime.match(/(\d+)\s*hours\s*(\d+)\s*minutes/);
  if (matches) {
    const hours = parseInt(matches[1]);
    const minutes = parseInt(matches[2]);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return workTime;
}

isToday(dateString: string): boolean {
  const recordDate = new Date(dateString).toDateString(); 
  const todayDate = new Date().toDateString();
  return recordDate === todayDate;
}


getWorkSystemLabel(workSystem: string): string {
  const labels:any = {
    'shift': 'نظام ورديات',
    'hours': 'نظام ساعات',
    'production': 'نظام إنتاجية',
    'monthly': 'نظام شهري'
  };
  return labels[workSystem] || workSystem;
}

getCheckOutStatusLabel(status: string): string {
  const labels:any = {
    'Early': 'مبكر',
    'On Time': 'في الوقت',
    'No Check-out': 'لم يسجل خروج',
    'Recorded': 'مسجل'
  };
  return labels[status] || status;
}


// أضف هذه الدوال إلى ملف المكون TypeScript


/**
 * حساب المدة بين وقت الدخول والخروج
 */
calculateDuration(checkInTime: string, checkOutTime: string): string {
  if (!checkInTime || !checkOutTime) return '-';
  
  // تحويل الأوقات إلى دقائق
  const getTimeInMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // حساب الفرق بالدقائق
  let inMinutes = getTimeInMinutes(checkInTime);
  let outMinutes = getTimeInMinutes(checkOutTime);
  
  // معالجة حالة الخروج في اليوم التالي
  if (outMinutes < inMinutes) {
    outMinutes += 24 * 60;
  }
  
  const totalMinutes = outMinutes - inMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // تنسيق الناتج بالعربية
  return this.formatDurationText(hours, minutes);
}

/**
 * تنسيق نص المدة بالعربية
 */
formatDurationText(hours: number, minutes: number): string {
  let result = '';
  
  if (hours > 0) {
    result += `${hours} ${this.pluralize(hours, 'ساعة', 'ساعتان', 'ساعات')}`;
  }
  
  if (minutes > 0) {
    if (result) result += ' و';
    result += `${minutes} ${this.pluralize(minutes, 'دقيقة', 'دقيقتان', 'دقائق')}`;
  }
  
  if (!result) {
    result = 'أقل من دقيقة';
  }
  
  return result;
}

/**
 * صياغة الكلمات العربية حسب العدد (مفرد، مثنى، جمع)
 */
pluralize(number: number, singular: string, dual: string, plural: string): string {
  if (number === 0) return plural;
  if (number === 1) return singular;
  if (number === 2) return dual;
  if (number >= 3 && number <= 10) return plural;
  return plural;
}

}