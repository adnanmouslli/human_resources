import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';

// Services & Interfaces
import { ToastService } from '../../../core/services/toast.service';
import { EmployeeService, WorkSystem } from '../../../core/services/employee/employee.service';
import { MonthlyAttendance, MonthlyAttendanceService } from '../../../core/services/MonthlyAttendance/monthly-attendance.service';
import { ListEmployee } from '../../../type/employee';




type TagSeverity = 'success' | 'info' | 'warning' | 'danger';

@Component({
    selector: 'app-monthly-attendance',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        AutoCompleteModule,
        InputTextModule,
        InputTextareaModule,
        CheckboxModule,
        ToastModule,
        ToolbarModule,
        DialogModule,
        ConfirmDialogModule,
        TagModule,
        DropdownModule,
        LoadingComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './monthly-attendance.component.html'
})
export class MonthlyAttendanceComponent implements OnInit {
    private attendanceService = inject(MonthlyAttendanceService);
    private employeeService = inject(EmployeeService);
    private toastService = inject(ToastService);
    private confirmationService = inject(ConfirmationService);

    // Computed values from service
    attendanceRecords = computed(() => this.attendanceService.attendanceRecords());
    loading = computed(() => this.attendanceService.loading());

    // Dialog state
    displayDialog = false;
    dialogHeader = '';
    isEditMode = false;
    selectedAttendanceEmployee: ListEmployee | null = null;
    employeeSuggestions: ListEmployee[] = [];
    submitted = false;

    attendanceForm: Partial<MonthlyAttendance> = this.getInitialAttendanceForm();
    readonly WorkSystem = WorkSystem;
    monthlyEmployees: ListEmployee[] = [];
    // Dropdown options
    attendanceTypes = [
        { label: 'يوم كامل', value: 'full_day' },
        { label: 'نصف يوم', value: 'half_day' },
        { label: 'أون لاين', value: 'online_day' },
        { label: 'غائب', value: 'absent' }
    ];

    ngOnInit() {
        this.loadTodayAttendance();
        this.loadSystemEmployees();

    }

    // Data loading
    private loadTodayAttendance() {
        this.attendanceService.getDailyAttendance().subscribe({
            error: (error) => this.handleError(error)
        });
    }

    private loadSystemEmployees() {
        this.employeeService.getEmployeesBySystem(WorkSystem.MONTHLY).subscribe({
            next: (employees) => {
                this.monthlyEmployees = employees ;
            },
            error: (error) => this.handleError(error)
        });
    }

    // Employee search
    filterEmployees(event: { query: string }) {
        // this.employeeService.getListEmployees().subscribe({
        //     next: (employees) => this.employeeSuggestions = employees,
        //     error: (error) => this.handleError(error)
        // });
    }

    // Dialog management
    showCreateDialog() {
        this.isEditMode = false;
        this.dialogHeader = 'تسجيل حضور جديد';
        this.selectedAttendanceEmployee = null;
        this.attendanceForm = this.getInitialAttendanceForm();
        this.submitted = false;
        this.displayDialog = true;
    }

    editAttendance(record: MonthlyAttendance) {
        this.isEditMode = true;
        this.dialogHeader = 'تعديل سجل الحضور';
        this.selectedAttendanceEmployee = this.monthlyEmployees.find(
            emp => emp.id === record.employee?.id
        ) || null;
        this.attendanceForm = { ...record };
        this.submitted = false;
        this.displayDialog = true;
    }

    hideDialog() {
        this.displayDialog = false;
        this.attendanceForm = this.getInitialAttendanceForm();
        this.selectedAttendanceEmployee = null;
        this.submitted = false;
    }

    // Form submission
    submitAttendance() {
        this.submitted = true;

        if (!this.validateForm()) {
            return;
        }

        const employeeId = this.isEditMode 
            ? this.attendanceForm.employee_id 
            : this.selectedAttendanceEmployee?.id 
                ? this.selectedAttendanceEmployee.id 
                : null;

        if (employeeId === null) {
            this.toastService.error('خطأ في بيانات الموظف', 'خطأ');
            return;
        }

        const attendance: MonthlyAttendance = {
            ...this.attendanceForm,
            employee_id: employeeId,
            date: new Date().toISOString().split('T')[0]
        } as MonthlyAttendance;

        const action = this.isEditMode
            ? this.attendanceService.updateAttendance(this.attendanceForm.id!, attendance)
            : this.attendanceService.createAttendance(attendance);

        action.subscribe({
            next: () => {
                this.toastService.success(
                    this.isEditMode ? 'تم تحديث السجل بنجاح' : 'تم تسجيل الحضور بنجاح',
                    'نجاح'
                );
                this.hideDialog();
                this.loadTodayAttendance();
            },
            error: (error) => this.handleError(error)
        });
    }

    // Delete attendance
    deleteAttendance(id: number) {
        this.confirmationService.confirm({
            message: 'هل أنت متأكد من حذف هذا السجل؟',
            header: 'تأكيد الحذف',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'نعم',
            rejectLabel: 'لا',
            accept: () => {
                this.attendanceService.deleteAttendance(id).subscribe({
                    next: () => {
                        this.toastService.success('تم حذف السجل بنجاح', 'نجاح');
                        this.loadTodayAttendance();
                    },
                    error: (error) => this.handleError(error)
                });
            }
        });
    }

    // Check out
    checkOut(id: number) {
        this.confirmationService.confirm({
            message: 'هل أنت متأكد من تسجيل الانصراف؟',
            header: 'تأكيد الانصراف',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'نعم',
            rejectLabel: 'لا',
            accept: () => {
                this.attendanceService.checkOut(id).subscribe({
                    next: () => {
                        this.toastService.success('تم تسجيل الانصراف بنجاح', 'نجاح');
                        this.loadTodayAttendance();
                    },
                    error: (error) => this.handleError(error)
                });
            }
        });
    }

    // Helper methods
    private getInitialAttendanceForm(): Partial<MonthlyAttendance> {
        return {
            attendance_type: 'full_day',
            is_excused_absence: false,
            notes: ''
        };
    }

    private validateForm(): boolean {
        if (!this.attendanceForm.attendance_type) {
            this.toastService.error('يرجى اختيار نوع الدوام', 'خطأ');
            return false;
        }

        if (!this.isEditMode && !this.selectedAttendanceEmployee?.id) {
            this.toastService.error('يرجى اختيار الموظف', 'خطأ');
            return false;
        }

        return true;
    }


absenceDetailsDialog: boolean = false;
selectedAbsenceReason: string = '';

showAbsenceDetails(reason: string) {
    this.selectedAbsenceReason = reason;
    this.absenceDetailsDialog = true;
}

handleAttendanceTypeChange() {
    if (this.attendanceForm.attendance_type !== 'absent') {
        this.attendanceForm.excuse_document = ''; 
    }
}

    private handleError(error: any) {
        console.error('Error:', error);
        this.toastService.error(
            error.message || 'حدث خطأ أثناء تنفيذ العملية',
            'خطأ'
        );
    }

    // UI helpers
    getStatusSeverity(type: string | undefined): TagSeverity {
        switch (type) {
            case 'full_day':
                return 'success';
            case 'half_day':
                return 'warning';
            case 'online_day':
                return 'info';
            case 'absent':
                return 'danger';
            default:
                return 'danger';
        }
    }
    
    getAttendanceTypeLabel(type: string | undefined): string {
        switch (type) {
            case 'full_day':
                return 'يوم كامل';
            case 'half_day':
                return 'نصف يوم';
            case 'online_day':
                return 'أون لاين';
            case 'absent':
                return 'غائب';
            default:
                return 'غير محدد';
        }
    }

    formatTime(time: string | null): string {
        if (!time) return '-';
        const date = new Date(`1970-01-01T${time}`);
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    
}