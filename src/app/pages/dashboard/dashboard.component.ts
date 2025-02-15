import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { DatatableComponent } from "../../components/datatable/datatable.component";
import { Column } from '../../type/ui/data-table';
import { ToastService } from '../../core/services/toast.service';
import { ConfigService } from '../../core/services/config.service';
import { LoadingComponent } from "../../components/ui/loading/loading.component";

interface EmployeeMetrics {
  totalEmployees: number;
  newHires: number;
  turnoverRate: number;
  avgTenure: number;
}

interface DepartmentData {
  name: string;
  employees: number;
  budget: number;
  utilizationRate: number;
  lastHireDate: Date;
  headCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    RippleModule,
    DatatableComponent,
    LoadingComponent
],
  templateUrl: './dashboard.component.html',
 
})

export class DashboardComponent implements OnInit {
  metrics: EmployeeMetrics = {
    totalEmployees: 1250,
    newHires: 45,
    turnoverRate: 12.5,
    avgTenure: 3.2
  };

  departments: DepartmentData[] = [];
  tableLoading: boolean = false;

  columns: Column[] = [
    {
      field: 'name',
      header: 'القسم',
      type: 'text',
      filterType: 'text',
      width: '12rem',
      sortable: true,
      filterable: true
    },
    {
      field: 'employees',
      header: 'عدد الموظفين',
      type: 'number',
      filterType: 'numeric',
      width: '10rem',
      sortable: true,
      filterable: true
    },
    {
      field: 'budget',
      header: 'الميزانية',
      type: 'currency',
      filterType: 'numeric',
      width: '12rem',
      sortable: true,
      filterable: true
    },
    {
      field: 'utilizationRate',
      header: 'نسبة الاستغلال',
      type: 'custom',
      filterType: 'numeric',
      width: '10rem',
      sortable: true,
      filterable: true,
      // @ts-ignore
      customTemplate: this.utilizationTemplate
    },
    {
      field: 'lastHireDate',
      header: 'آخر تعيين',
      type: 'date',
      width: '10rem',
      format: 'dd/MM/yyyy',
      sortable: true,
      filterable: true
    },
    {
      field: 'isActive',
      header: 'الحالة',
      type: 'status',
      width: '8rem',
      sortable: true,
      filterable: true,
      statusOptions: [
        // @ts-ignore
        { label: 'نشط', value: true, styleClass: 'status-active' },
        // @ts-ignore
        { label: 'غير نشط', value: false, styleClass: 'status-inactive' }
      ]
    }
  ];

  constructor(
    private configService: ConfigService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadDepartmentData();
  }

  private loadDepartmentData() {
    this.tableLoading = true;
    // محاكاة استدعاء API
    setTimeout(() => {
      this.departments = Array(20).fill(null).map((_, index) => ({
        name: `قسم ${index + 1}`,
        employees: Math.floor(Math.random() * 200) + 50,
        budget: Math.floor(Math.random() * 2000000) + 500000,
        utilizationRate: Math.floor(Math.random() * 40) + 60,
        lastHireDate: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
        headCount: Math.floor(Math.random() * 50) + 100,
        isActive: Math.random() > 0.2
      }));
    }, 1000);
    
    this.tableLoading = false;
  }
  
  onFilterChange(event: any) {
    // this.toastService.info('تم تطبيق الفلتر', 'تم تحديث البيانات');
  }

  onSortChange(event: any) {
    // this.toastService.info('تم تغيير الترتيب', 'تم تحديث البيانات');
  }

  private utilizationTemplate(rowData: DepartmentData): string {
    let badgeClass = 'utilization-medium';
    if (rowData.utilizationRate >= 80) {
      badgeClass = 'utilization-high';
    } else if (rowData.utilizationRate < 60) {
      badgeClass = 'utilization-low';
    }

    return `
      <span class="utilization-badge ${badgeClass}">
        ${rowData.utilizationRate}%
      </span>
    `;
  }
}