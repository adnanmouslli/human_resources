import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DynamicButtonComponent } from '../../../components/ui/dynamic-button/dynamic-button.component';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { animate, style, transition, trigger } from '@angular/animations';
import { ShiftService } from '../../../core/services/shifts/shifts.service';
import { JobTitleService } from '../../../core/services/job-titles/job-titles.service';
import { JobTitle } from '../../../type/job-title';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    InputTextareaModule,
    ButtonModule,
    CardModule,
    DividerModule,
    TooltipModule,
    RippleModule,
    InputGroupModule,
    InputGroupAddonModule,
    DynamicButtonComponent,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './add-employee.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent implements OnInit {
  @ViewChild('employeeForm') formElement!: ElementRef;
  employeeForm!: FormGroup;
  loading: boolean = false;
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private shiftService = inject(ShiftService);
  private jobTitleService = inject(JobTitleService);
  
  private readonly WORK_SYSTEM_MAPPINGS: { [key: string]: any } = {
    'Production System': { label: 'نظام انتاجية', value: 'productivity', icon: 'pi pi-chart-line' },
    'Shift System': { label: 'نظام وردية', value: 'shift', icon: 'pi pi-clock' },
    'Hours System': { label: 'نظام ساعات', value: 'hours', icon: 'pi pi-calendar' },
    'Custom System': { label: 'نظام مخصص', value: 'custom', icon: 'pi pi-cog' }
  };

  jobTitles: JobTitle[] = [];
  workSystemOptions: any[] = [];
  shifts: any[] = [];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit() {
    this.loadJobTitles();
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions() {
    // مراقبة تغييرات المسمى الوظيفي
    this.employeeForm.get('position')?.valueChanges.subscribe(positionId => {
      if (positionId) {
        this.loadWorkSystems(positionId);
        // إعادة تعيين قيم نظام العمل والوردية
        this.employeeForm.patchValue({
          work_system: '',
          shift_id: ''
        });
      } else {
        this.workSystemOptions = [];
      }
    });

    // مراقبة تغييرات نظام العمل
    this.employeeForm.get('work_system')?.valueChanges.subscribe(value => {
      const shiftControl = this.employeeForm.get('shift_id');
      if (value === 'shift') {
        shiftControl?.setValidators([Validators.required]);
        this.loadShifts();
      } else {
        shiftControl?.clearValidators();
        shiftControl?.setValue('');
      }
      shiftControl?.updateValueAndValidity();
    });
  }

  private loadWorkSystems(jobTitleId: number) {
    this.jobTitleService.getEnabledSystems(jobTitleId).subscribe({
      next: (response: { enabled_systems: string[] }) => {
        // تحويل أسماء الأنظمة إلى خيارات العرض المناسبة
        this.workSystemOptions = response.enabled_systems
          .map(systemName => this.WORK_SYSTEM_MAPPINGS[systemName])
          .filter(system => system !== undefined);
      },
      error: (error) => {
        console.error('Error loading work systems:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تحميل أنظمة العمل'
        });
        this.workSystemOptions = [];
      }
    });
  }

  private loadJobTitles() {
    this.jobTitleService.getJobTitles().subscribe({
      next: (response) => {
        this.jobTitles = response;
        
        // إذا كان هناك مسمى وظيفي محدد مسبقاً، قم بتحميل أنظمة العمل الخاصة به
        const currentPosition = this.employeeForm.get('position')?.value;
        if (currentPosition) {
          this.loadWorkSystems(currentPosition);
        }
      },
      error: (error) => {
        console.error('Error loading job titles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تحميل المسميات الوظيفية'
        });
      }
    });
  }

  private loadShifts() {
    this.shiftService.getShifts().subscribe({
      next: (shifts) => {
        this.shifts = shifts;
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تحميل الورديات'
        });
      }
    });
  }
  
  private initForm() {
    this.employeeForm = this.fb.group({
      shift_id: [''],
      fingerprint_id: ['', [Validators.required]],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      position: ['', [Validators.required]], 
      salary: [null, [Validators.required, Validators.min(0)]],
      advancePercentage: [null, [Validators.required, Validators.min(1), Validators.max(100)]], // حقل نسبة السلفة
      work_system: ['', Validators.required],
      certificates: [''],
      birth_date: [null],
      birth_place: [''],
      id_number: [''],
      national_id: ['', [Validators.required]],
      residence: [''],
      phone1: ['', [Validators.required]],
      phone2: [''],
      phone3: [''],
      agreement: ['Standard'],
      notes: ['']
    });
  }
  

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return field ? (field.invalid && field.touched) : false;
  }

  onSubmit() {
    console.log(this.employeeForm)
    if (this.employeeForm.valid) {
      this.loading = true;
      const formattedData = this.formatEmployeeData(this.employeeForm.value);
      
      this.employeeService.addEmployee(formattedData).subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إضافة الموظف بنجاح'
          });
          this.loading = false;
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Error adding employee:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء إضافة الموظف'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.employeeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى ملء جميع الحقول المطلوبة'
      });
    }
  }

  private formatEmployeeData(formData: any): any {
    return {
      fingerprint_id: formData.fingerprint_id,
      full_name: formData.full_name,
      position: formData.position,
      salary: Number(formData.salary),
      advancePercentage: formData.advancePercentage,  // إضافة نسبة السلفة
      work_system: formData.work_system,
      shift_id: formData.shift_id || null,
      certificates: formData.certificates || '',
      birth_date: formData.birth_date ? this.formatDate(formData.birth_date) : null,
      birth_place: formData.birth_place || '',
      id_number: formData.id_number || '',
      national_id: formData.national_id,
      residence: formData.residence || '',
      phone1: formData.phone1 || '',
      phone2: formData.phone2 || '',
      phone3: formData.phone3 || '',
      agreement: formData.agreement || 'Standard',
      notes: formData.notes || ''
    };
  }
  

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  onCancel() {
    this.resetForm();
    this.messageService.add({
      severity: 'info',
      summary: 'إلغاء',
      detail: 'تم إلغاء العملية'
    });
  }

  private resetForm() {
    this.employeeForm.reset({
      work_system: '',
      agreement: 'Standard'
    });
  }
}