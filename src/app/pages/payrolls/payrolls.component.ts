import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { KnobModule } from 'primeng/knob';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PayrollService } from '../../core/services/payroll/payroll.service';
import { TagModule } from 'primeng/tag';




interface Statistics {
  totalEmployees: number;
  totalSalaries: number;
  totalHours: number;
  totalDeductions: number;
  financialMetrics: {
    totalAdvances: number;
    totalRewards: number;
    totalPenalties: number;
    averageSalary: number;
    highestSalary: number;
    lowestSalary: number;
  };
  systemCosts: {
    monthlySystem: number;
    productionSystem: number;
    shiftSystem: number;
  };
  performanceMetrics: {
    overtimeHours: number;
    absentHours: number;
    averageProductivity: number;
    costPerEmployee: number;
  };
}

interface Employee {
  name: string;
  system: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  performance: number;
  attendance: number;
}
type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';


@Component({
  standalone: true,
  selector: 'app-payroll',
  templateUrl: './payrolls.component.html',
  styleUrls: ['./payrolls.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    CardModule,
    ProgressBarModule,
    InputTextModule,
    TooltipModule,
    ChartModule,
    KnobModule,
    DividerModule,
    BadgeModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,  

  ]
})
export class PayrollsComponent implements OnInit {
  private payrollService = inject(PayrollService);

  // Dropdown options
  months = [
    { name: 'يناير', code: '1' },
    { name: 'فبراير', code: '2' },
    { name: 'مارس', code: '3' },
    { name: 'ابريل', code: '4' },
    { name: 'مايو', code: '5' },
    { name: 'يونيو', code: '6' },
    { name: 'يوليو', code: '7' },
    { name: 'اغسطس', code: '8' },
    { name: 'سبتمبر', code: '9' },
    { name: 'اكتوبر', code: '10' },
    { name: 'نوفمبر', code: '11' },
    { name: 'ديسمبر', code: '12' }
  ];

  years = [
    { name: '2024', code: '2024' },
    { name: '2025', code: '2025' }
  ];

  // Form controls
  selectedMonth: { name: string; code: string } = { name: 'فبراير', code: '2' };
  selectedYear: { name: string; code: string } = { name: '2025', code: '2025' };

  // Service data
  payrollData = this.payrollService.payrollData;
  loading = this.payrollService.loading;
  error = this.payrollService.error;

  // Component properties
  statistics: Statistics = {
    totalEmployees: 156,
    totalSalaries: 45250,
    totalHours: 2450,
    totalDeductions: 3200,
    financialMetrics: {
      totalAdvances: 12500,
      totalRewards: 8750,
      totalPenalties: 2300,
      averageSalary: 1250,
      highestSalary: 3500,
      lowestSalary: 800
    },
    systemCosts: {
      monthlySystem: 28500,
      productionSystem: 12300,
      shiftSystem: 4450
    },
    performanceMetrics: {
      overtimeHours: 450,
      absentHours: 120,
      averageProductivity: 85,
      costPerEmployee: 1200
    }
  };

  performanceMetrics = {
    overtimeHours: 450,
    absentHours: 120,
    averageProductivity: 85,
    costPerEmployee: 1200
  };

  // Charts data
  payrollChartData: any;
  payrollChartOptions: any;
  costTrendData: any;

  ngOnInit() {
    this.calculatePayroll();
    this.initializeCharts();
  }

  calculatePayroll() {
    const month = parseInt(this.selectedMonth.code);
    const year = parseInt(this.selectedYear.code);

    this.payrollService.calculatePayroll({ month, year }).subscribe({
      next: (data) => {
        this.updateCharts(data);
      },
      error: (error) => {
        console.error('Error calculating payroll:', error);
      }
    });
  }

  // Get all employees across systems
  get allEmployees() {
    const data = this.payrollData();
    if (!data) return [];

    return [
      ...this.payrollService.getEmployeesBySystem('monthly'),
      ...this.payrollService.getEmployeesBySystem('production'),
      ...this.payrollService.getEmployeesBySystem('shift'),
      ...this.payrollService.getEmployeesBySystem('hourly')
    ].map(emp => ({
      name: emp.employee_name,
      system: this.payrollService.getSystemLabel(emp.system_type),
      basicSalary: parseFloat(emp.basic_salary),
      allowances: parseFloat(emp.allowances),
      additions: parseFloat(emp.additions),
      deductions: parseFloat(emp.deductions),
      netSalary: parseFloat(emp.net_salary),
      performance: this.calculatePerformance(emp),
      attendance: this.calculateAttendance(emp)
    }));
  }

  // Get system summary data
  get systemSummary() {
    const data = this.payrollData();
    if (!data) return [];

    const systems = [
      {
        type: 'monthly',
        name: 'نظام شهري',
        color: 'var(--primary-color)',
        stats: data.systems_statistics.monthly_system
      },
      {
        type: 'production',
        name: 'نظام الإنتاج',
        color: 'var(--green-500)',
        stats: data.systems_statistics.production_system
      },
      {
        type: 'shift',
        name: 'نظام الورديات',
        color: 'var(--purple-500)',
        stats: data.systems_statistics.shift_system
      }
    ];

    return systems.map(system => ({
      name: system.name,
      color: system.color,
      employees: system.stats.employee_count,
      percentage: (system.stats.employee_count / data.general_statistics.total_employees) * 100,
      totalCost: parseFloat(system.stats.total_salaries),
      averageSalary: system.stats.employee_count ? 
        parseFloat(system.stats.total_salaries) / system.stats.employee_count : 0,
      efficiency: this.calculateSystemEfficiency(system.type, system.stats)
    }));
  }

  private calculateSystemEfficiency(type: string, stats: any): number {
    switch (type) {
      case 'monthly':
        return this.calculateMonthlyEfficiency(stats);
      case 'production':
        return this.calculateProductionEfficiency(stats);
      case 'shift':
        return this.calculateShiftEfficiency(stats);
      default:
        return 0;
    }
  }

  private calculateMonthlyEfficiency(stats: any): number {
    const attendance = stats.attendance_summary;
    const totalDays = attendance.full_days + (attendance.half_days / 2) + 
                     attendance.online_days + attendance.excused_absences + 
                     attendance.unexcused_absences;
    return totalDays ? 
      ((attendance.full_days + (attendance.half_days / 2) + attendance.online_days) / totalDays) * 100 : 0;
  }

  private calculateProductionEfficiency(stats: any): number {
    const qualityScores = {
      'A': 1, 'B': 0.8, 'C': 0.6, 'D': 0.4, 'E': 0.2
    };
    
    let totalScore = 0;
    let totalPieces = 0;
    
    Object.entries(stats.quality_summary).forEach(([grade, data]: [string, any]) => {
      totalScore += data.count * (qualityScores[grade as keyof typeof qualityScores] || 0);
      totalPieces += data.count;
    });

    return totalPieces ? (totalScore / totalPieces) * 100 : 0;
  }

  private calculateShiftEfficiency(stats: any): number {
    const totalHours = stats.total_working_hours || 0;
    const overtimeHours = stats.total_overtime_hours || 0;
    const expectedHours = totalHours - overtimeHours;
    
    return expectedHours ? (totalHours / expectedHours) * 100 : 0;
  }

  private calculatePerformance(employee: any): number {
    return 85; // Default value until we implement actual performance calculation
  }

  private calculateAttendance(employee: any): number {
    if (employee.system_details && employee.system_type === 'monthly') {
      const attendance = employee.system_details;
      const totalDays = attendance.full_days + (attendance.half_days / 2) + 
                       attendance.online_days + attendance.excused_absences + 
                       attendance.unexcused_absences;
      return totalDays ? 
        ((attendance.full_days + (attendance.half_days / 2) + attendance.online_days) / totalDays) * 100 : 0;
    }
    return 90; // Default value for other systems
  }

  private updateCharts(data: any) {
    const generalStats = data.general_statistics;
    
    this.payrollChartData = {
      labels: ['رواتب أساسية', 'بدلات', 'إضافات', 'خصومات'],
      datasets: [{
        data: [
          parseFloat(generalStats.total_basic_salaries),
          parseFloat(generalStats.total_allowances),
          parseFloat(generalStats.total_additions),
          parseFloat(generalStats.total_deductions)
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ]
      }]
    };
  }

  private initializeCharts() {
    this.payrollChartData = {
      labels: ['رواتب أساسية', 'بدلات', 'إضافات', 'خصومات'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ]
      }]
    };

    this.costTrendData = {
      labels: ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو'],
      datasets: [
        {
          label: 'إجمالي التكلفة',
          data: [42000, 43500, 45250, 44800, 46200, 45250],
          borderColor: 'rgba(54, 162, 235)',
          tension: 0.4
        },
        {
          label: 'متوسط التكلفة للموظف',
          data: [1200, 1250, 1280, 1275, 1290, 1285],
          borderColor: 'rgba(75, 192, 192)',
          tension: 0.4
        }
      ]
    };
  }


  getSystemSeverity(system: string): TagSeverity {
  const severityMap: { [key: string]: TagSeverity } = {
    'نظام شهري': 'info',
    'نظام إنتاج': 'success',
    'نظام ورديات': 'warning',
    'نظام ساعات': 'secondary'
  };
  return severityMap[system] || 'info';
}

getPerformanceSeverity(value: number): TagSeverity {
  if (value >= 80) return 'success';
  if (value >= 60) return 'warning';
  return 'danger';
}

getAttendanceSeverity(value: number): TagSeverity {
  if (value >= 90) return 'success';
  if (value >= 75) return 'warning';
  return 'danger';
}

getPerformanceColor(value: number): string {
  if (value >= 80) return '#22C55E';
  if (value >= 60) return '#F59E0B';
  return '#EF4444';
}

getAttendanceColor(value: number): string {
  if (value >= 90) return '#22C55E';
  return '#F59E0B';
}

showEmployeeDetails(employee: any) {
  // Implement employee details dialog
  console.log('Show details for:', employee);
}

printPayslip(employee: any) {
  // Implement payslip printing
  console.log('Print payslip for:', employee);
}

}