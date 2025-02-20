import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { Column } from '../../../type/ui/data-table';
import { DatatableComponent } from '../../../components/datatable/datatable.component';
import { Employee } from '../../../type/employee';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { EmployeeService } from '../../../core/services/employee/employee.service';

@Component({
  selector: 'app-list-employees',
  standalone: true,
  imports: [CommonModule, DatatableComponent, LoadingComponent],
  template: `
    <app-loading [show]="loading" type="circle" message="جاري المعالجة..."></app-loading> 
    
    <app-data-table
      [data]="employees"
      [columns]="columns"
      [title]="'قائمة الموظفين'"
      >
      
      <ng-template #workSystemTpl let-data>
        <span [class]="'work-system-' + data.work_system">
          {{getWorkSystemLabel(data.work_system)}}
        </span>
      </ng-template>

      <ng-template #phoneTpl let-data>
        <span class="mobile-column">
          {{formatPhoneNumber(data.mobile_1)}}
        </span>
      </ng-template>
    </app-data-table>

    <style>
      ::ng-deep {
        .work-system-shift {
          background-color: var(--primary-100);
          color: var(--primary-700);
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-weight: 500;
          display: inline-block;
        }

        .work-system-hours {
          background-color: var(--indigo-100);
          color: var(--indigo-700);
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-weight: 500;
          display: inline-block;
        }

        .mobile-column {
          direction: ltr !important;
          text-align: right !important;
          display: inline-block;
          font-family: var(--font-family-monospace);
          background-color: var(--surface-ground);
          padding: 0.3rem 0.6rem;
          border-radius: 0.375rem;
          color: var(--text-color-secondary);
        }
      }
    </style>
  `
})
export class ListEmployeesComponent implements OnInit, AfterViewInit {
  @ViewChild('workSystemTpl') workSystemTpl!: TemplateRef<any>;
  @ViewChild('phoneTpl') phoneTpl!: TemplateRef<any>;
  
  private employeeService = inject(EmployeeService);
  
  employees: Employee[] = [];
  columns: Column[] = [];
  loading: boolean = false;

  ngOnInit() {
    this.loading = true;
    this.initializeColumns();
    this.loadEmployees();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateColumnsWithTemplates();
    });
  }

  private initializeColumns() {
    this.columns = [
      {
        field: 'fingerprint_id',
        header: 'رقم البصمة',
        type: 'text',
        filterType: 'text',
        minWidth: '120px',
        sortable: true,
        filterable: true
      },
      {
        field: 'full_name',
        header: 'الاسم',
        type: 'text',
        filterType: 'text',
        minWidth: '180px',
        sortable: true,
        filterable: true
      },
      {
        field: 'position',
        header: 'الوظيفة',
        type: 'text',
        filterType: 'text',
        minWidth: '150px',
        sortable: true,
        filterable: true
      },
      {
        field: 'mobile_1',
        header: 'رقم الجوال',
        type: 'custom',
        filterType: 'text',
        minWidth: '130px',
        sortable: true,
        filterable: true,
        bodyTemplate: null
      },
      {
        field: 'salary',
        header: 'الراتب الأساسي',
        type: 'currency',
        filterType: 'numeric',
        minWidth: '130px',
        sortable: true,
        filterable: true
      },
      {
        field: 'allowances',
        header: 'البدلات',
        type: 'currency',
        filterType: 'numeric',
        minWidth: '130px',
        sortable: true,
        filterable: true
      },
      {
        field: 'advancePercentage',
        header: 'نسبة السلفة',
        type: 'number',
        filterType: 'numeric',
        minWidth: '130px',
        sortable: true,
        filterable: true
      },
      {
        field: 'date_of_joining',
        header: 'تاريخ التعيين',
        type: 'date',
        filterType: 'date',
        minWidth: '130px',
        format: 'dd/MM/yyyy',
        sortable: true,
        filterable: true
      },
      {
        field: 'national_id',
        header: 'رقم الهوية',
        type: 'text',
        filterType: 'text',
        minWidth: '130px',
        sortable: true,
        filterable: true
      },
      {
        field: 'work_system',
        header: 'نظام العمل',
        type: 'custom',
        filterType: 'dropdown',
        minWidth: '140px',
        sortable: true,
        filterable: true,
        bodyTemplate: null,
        statusOptions: [
          { label: 'نظام الورديات', value: 'shift' },
          { label: 'نظام الساعات', value: 'hours' },
          { label: 'نظام الشهري', value: 'months' },
          { label: 'نظام الانتاج', value: 'productivity' },
        ]
      }
    ];
  }
  

  private updateColumnsWithTemplates() {
    this.columns = this.columns.map(col => {
      if (col.field === 'mobile_1') {
        return { ...col, bodyTemplate: this.phoneTpl };
      }
      if (col.field === 'work_system') {
        return { ...col, bodyTemplate: this.workSystemTpl };
      }
      return col;
    });
  }

  private loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  // getWorkSystemLabel(value: string): string {
  //   return value === 'shift' ? 'نظام الورديات' : 'نظام الساعات';
  // }

  getWorkSystemLabel(workSystem: string): string {
    const labels:any = {
      'shift': 'نظام ورديات',
      'hours': 'نظام ساعات',
      'productivity': 'نظام إنتاجية',
      'months': 'نظام شهري'
    };
    return labels[workSystem] || workSystem;
  }

  formatPhoneNumber(phone: string | null): string {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1-$2-$3');
  }
}