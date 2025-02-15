import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';


type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined;


@Component({
  selector: 'app-production-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    ChartModule,
    ProgressBarModule,
    AvatarModule,
    TagModule,
    ToastModule,
    RippleModule
  ],
  providers: [MessageService],
  templateUrl: './production-reports.component.html',
  styleUrl: './production-reports.component.scss'
})
export class ProductionReportsComponent implements OnInit {
  dateRange: Date[] = [];
  employees = signal<any[]>([]);
  selectedEmployees: any[] = [];
  selectedPieces: any[] = [];
  loading = signal<boolean>(false);

  statistics = signal<any>({
    totalProduction: 1500,
    averageQuality: 'A',
    totalAmount: 25000,
    bestEmployee: 'أحمد محمد'
  });

  // Chart Data
  productivityChart: any;
  qualityChart: any;
  employeePerformanceChart: any;
  chartOptions: any;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.initializeChartData();
    this.initializeChartOptions();
    this.loadMockData();
  }

  initializeChartData() {
    // بيانات الإنتاج الشهري
    this.productivityChart = {
      labels: ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو'],
      datasets: [{
        label: 'معدل الإنتاج',
        data: [650, 590, 800, 810, 560, 550],
        fill: true,
        borderColor: '#2196F3',
        tension: 0.4,
        backgroundColor: 'rgba(33, 150, 243, 0.1)'
      }]
    };

    // بيانات توزيع الجودة
    this.qualityChart = {
      labels: ['ممتاز (A)', 'جيد جداً (B)', 'جيد (C)', 'ضعيف (D)'],
      datasets: [{
        data: [300, 200, 150, 50],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFA726', '#F44336'],
      }]
    };

    // بيانات أداء الموظفين
    this.employeePerformanceChart = {
      labels: ['أحمد', 'محمد', 'علي', 'عمر', 'خالد'],
      datasets: [{
        label: 'عدد القطع المنتجة',
        data: [300, 280, 250, 260, 240],
        backgroundColor: '#2196F3',
      }]
    };
  }

  initializeChartOptions() {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
            font: {
              family: 'Cairo'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#ebedef'
          },
          ticks: {
            color: '#495057',
            font: {
              family: 'Cairo'
            }
          }
        },
        x: {
          grid: {
            color: '#ebedef'
          },
          ticks: {
            color: '#495057',
            font: {
              family: 'Cairo'
            }
          }
        }
      }
    };
  }

  loadMockData() {
    this.loading.set(true);
    setTimeout(() => {
      this.employees.set([
        {
          name: 'أحمد محمد',
          totalPieces: 500,
          averageQuality: 'A',
          totalAmount: 5000,
          progress: 95,
          bestDay: '2024-02-01'
        },
        {
          name: 'محمد علي',
          totalPieces: 450,
          averageQuality: 'B',
          totalAmount: 4500,
          progress: 85,
          bestDay: '2024-02-03'
        },
        {
          name: 'علي أحمد',
          totalPieces: 400,
          averageQuality: 'A',
          totalAmount: 4000,
          progress: 90,
          bestDay: '2024-02-02'
        },
        {
          name: 'عمر خالد',
          totalPieces: 350,
          averageQuality: 'C',
          totalAmount: 3500,
          progress: 70,
          bestDay: '2024-02-04'
        }
      ]);
      this.loading.set(false);
    }, 1000);
  }

  getQualitySeverity(quality: string): TagSeverity  {
    const severityMap: { [key: string]: TagSeverity  } = {
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'danger'
    };
    return severityMap[quality] || 'info';
  }

  applyFilters() {
    if (!this.dateRange[0] || !this.dateRange[1]) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى تحديد نطاق تاريخي'
      });
      return;
    }

    this.loading.set(true);
    // هنا يمكنك إضافة منطق تطبيق الفلاتر
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'تم',
        detail: 'تم تحديث البيانات'
      });
      this.loading.set(false);
    }, 1000);
  }

  exportExcel() {
    this.messageService.add({
      severity: 'success',
      summary: 'تصدير',
      detail: 'جاري تصدير التقرير إلى Excel'
    });
    // إضافة منطق التصدير إلى Excel
  }

  exportPdf() {
    this.messageService.add({
      severity: 'success',
      summary: 'تصدير',
      detail: 'جاري تصدير التقرير إلى PDF'
    });
    // إضافة منطق التصدير إلى PDF
  }

  // Helper method for chart colors
  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}