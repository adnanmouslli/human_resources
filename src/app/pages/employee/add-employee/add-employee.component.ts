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
import { ProfessionsService } from '../../../core/services/professions/professions.service';
import { SelectButtonModule } from 'primeng/selectbutton';

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
    ToastModule,
    SelectButtonModule,

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
  private professionService = inject(ProfessionsService); // إضافة خدمة المهن

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  // أضف هذه الدالة في الكلاس
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }
  
  private readonly WORK_SYSTEM_MAPPINGS: { [key: string]: any } = {
    'Production System': { label: 'نظام انتاجية', value: 'productivity', icon: 'pi pi-chart-line' },
    'Shift System': { label: 'نظام وردية', value: 'shift', icon: 'pi pi-clock' },
    'Month System': { label: 'النظام الشهري', value: 'months', icon: 'pi pi-calendar' },
    'Custom System': { label: 'نظام مخصص', value: 'custom', icon: 'pi pi-cog' }
  };

  private readonly TEMPORARY_WORK_SYSTEMS = [
    { label: 'نظام الساعات', value: 'hours', icon: 'pi pi-calendar' },
    { label: 'النظام الشهري', value: 'monthly', icon: 'pi pi-calendar-plus' }
  ];

  // تعريف أنواع الموظفين
  employeeTypes = [
    { label: 'موظف دائم', value: 'permanent' },
    { label: 'موظف مؤقت', value: 'temporary' }
  ];

  // تعريف أنظمة العمل للموظف المؤقت
  temporaryWorkSystems = [
    { label: 'نظام الساعات', value: 'hours', icon: 'pi pi-calendar' },
    { label: 'النظام الشهري', value: 'monthly', icon: 'pi pi-calendar-plus' }
  ];

  jobTitles: JobTitle[] = [];
  workSystemOptions: any[] = [];
  shifts: any[] = [];
  professions: any[] = []; 


  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit() {
    this.loadJobTitles();
    this.loadProfessions(); 
    this.setupFormSubscriptions();
  }

  getWorkSystemOptions(): any[] {
    const employeeType = this.employeeForm.get('employee_type')?.value;
    
    if (employeeType === 'temporary') {
      return this.TEMPORARY_WORK_SYSTEMS;
    } else if (employeeType === 'permanent') {
      return this.workSystemOptions; 
    }
    return [];
  }

  private setupFormSubscriptions() {

     // مراقبة تغييرات نوع الموظف
     this.employeeForm.get('employee_type')?.valueChanges.subscribe(type => {
      // Reset related fields
      this.employeeForm.patchValue({
        position: '',
        profession: '',
        work_system: '',
        shift_id: ''
      });

      if (type === 'temporary') {
        this.employeeForm.get('profession')?.setValidators([Validators.required]);
        this.employeeForm.get('position')?.clearValidators();
      } else {
        this.employeeForm.get('position')?.setValidators([Validators.required]);
        this.employeeForm.get('profession')?.clearValidators();
      }

      this.employeeForm.get('profession')?.updateValueAndValidity();
      this.employeeForm.get('position')?.updateValueAndValidity();
    });

    // مراقبة تغييرات المسمى الوظيفي (للموظف الدائم فقط)
    this.employeeForm.get('position')?.valueChanges.subscribe(positionId => {
      if (positionId && this.employeeForm.get('employee_type')?.value === 'permanent') {
        this.loadWorkSystems(positionId);
      }
    });


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

  private loadProfessions() {
    this.professionService.getAllProfessions().subscribe({
      next: (response) => {
        this.professions = response;
      },
      error: (error) => {
        console.error('Error loading professions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء تحميل المهن'
        });
      }
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
      employee_type: ['', Validators.required],
      fingerprint_id: ['', [Validators.required]],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      position: [''],  // سنضيف الvalidators حسب نوع الموظف
      profession: [''], // سنضيف الvalidators حسب نوع الموظف
      salary: [null],  // سنضيف الvalidators حسب نوع الموظف
      advancePercentage: [null], // سنضيف الvalidators حسب نوع الموظف
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
      notes: [''],
      shift_id: [''],

      allowances: [0],
      insurance_deduction: [0],
      insurance_start_date: [null],
      insurance_end_date: [null],
    });

    // مراقبة تغييرات نوع الموظف
    this.employeeForm.get('employee_type')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }

  private updateValidators(employeeType: string) {
    const salaryControl = this.employeeForm.get('salary');
    const positionControl = this.employeeForm.get('position');
    const professionControl = this.employeeForm.get('profession');
    const advancePercentageControl = this.employeeForm.get('advancePercentage');
    const allowancesControl = this.employeeForm.get('allowances');
    const insuranceDeductionControl = this.employeeForm.get('insurance_deduction');
    const insuranceStartDateControl = this.employeeForm.get('insurance_start_date');
    const insuranceEndDateControl = this.employeeForm.get('insurance_end_date');

    // إعادة تعيين كل الvalidators
    salaryControl?.clearValidators();
    positionControl?.clearValidators();
    professionControl?.clearValidators();
    advancePercentageControl?.clearValidators();
    allowancesControl?.clearValidators();
    insuranceDeductionControl?.clearValidators();
    insuranceStartDateControl?.clearValidators();
    insuranceEndDateControl?.clearValidators();
    

    if (employeeType === 'permanent') {
      // الحقول المطلوبة للموظف الدائم
      salaryControl?.setValidators([Validators.required, Validators.min(0)]);
      positionControl?.setValidators([Validators.required]);
      advancePercentageControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]);

      // في حالة إضافة تأمينات، تصبح تواريخ الصلاحية مطلوبة
    insuranceDeductionControl?.valueChanges.subscribe(value => {
      if (value && value > 0) {
        insuranceStartDateControl?.setValidators([Validators.required]);
        insuranceEndDateControl?.setValidators([Validators.required]);
      } else {
        insuranceStartDateControl?.clearValidators();
        insuranceEndDateControl?.clearValidators();
      }
      insuranceStartDateControl?.updateValueAndValidity();
      insuranceEndDateControl?.updateValueAndValidity();
    });
      
      // إفراغ حقل المهنة
      professionControl?.setValue('');
    } else if (employeeType === 'temporary') {
      // الحقول المطلوبة للموظف المؤقت
      professionControl?.setValidators([Validators.required]);
      
      // إفراغ الحقول غير المطلوبة
      positionControl?.setValue('');
      advancePercentageControl?.setValue(null);
    }

    // تحديث حالة الvalidation
    salaryControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();
    professionControl?.updateValueAndValidity();
    advancePercentageControl?.updateValueAndValidity();
    allowancesControl?.updateValueAndValidity();
    insuranceDeductionControl?.updateValueAndValidity();
    insuranceStartDateControl?.updateValueAndValidity();
    insuranceEndDateControl?.updateValueAndValidity();

    // إعادة تعيين قيم أخرى عند تغيير نوع الموظف
    this.employeeForm.patchValue({
      work_system: '',
      shift_id: ''
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    if (!field) return false;

    // التحقق من وجود validators للحقل
    const hasValidators = field.validator !== null;
    
    // إذا لم يكن هناك validators، فالحقل صحيح دائماً
    if (!hasValidators) return false;

    // التحقق من صحة الحقل فقط إذا كان له validators
    return field.invalid && field.touched;
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      this.loading = true;
      // إنشاء FormData لإرسال البيانات والملف
      const formData = new FormData();
      const employeeData = this.formatEmployeeData(this.employeeForm.value);
      
      // إضافة جميع حقول البيانات إلى FormData
      Object.keys(employeeData).forEach(key => {
        // تتجاهل القيم الفارغة للتواريخ
        if (employeeData[key] !== null && key !== 'certificates') {
          formData.append(key, employeeData[key]);
        }
      });
      
      // إضافة ملف الشهادة إذا تم اختياره
      if (this.selectedFile) {
        formData.append('certificates', this.selectedFile);
      }
  

      this.employeeService.addEmployee(formData).subscribe({
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
      employee_type: formData.employee_type,
  
      ...(formData.employee_type === 'permanent' 
        ? { position: formData.position }
        : { profession: formData.profession }
      ),
  
      fingerprint_id: formData.fingerprint_id,
      full_name: formData.full_name,
      salary: Number(formData.salary),

      // إضافة البدلات
      allowances: Number(formData.allowances || 0),
      // إضافة التأمينات
      insurance_deduction: Number(formData.insurance_deduction || 0),
      // تواريخ صلاحية التأمينات
      insurance_start_date: formData.insurance_start_date ? this.formatDate(formData.insurance_start_date) : null,
      insurance_end_date: formData.insurance_end_date ? this.formatDate(formData.insurance_end_date) : null,
    

      advancePercentage: formData.advancePercentage,
      work_system: formData.work_system,
      shift_id: formData.shift_id || null,
      // لن نضيف الشهادة هنا لأننا سنضيفها كملف منفصل في FormData
      // birth_date نرسلها كتاريخ صحيح أو كقيمة null
      date_of_birth: formData.birth_date ? this.formatDate(formData.birth_date) : null,
      place_of_birth: formData.birth_place || '',
      id_number: formData.id_number || '',
      national_id: formData.national_id,
      residence: formData.residence || '',
      mobile_1: formData.phone1 || '',  
      mobile_2: formData.phone2 || '',  
      mobile_3: formData.phone3 || '',  
      agreement: formData.agreement || 'Standard',
      notes: formData.notes || '',
      date_of_joining: formData.date_of_joining ? this.formatDate(formData.date_of_joining) : null
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
    
    // إعادة تعيين ملف الشهادة
    this.selectedFile = null;
    this.selectedFileName = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}