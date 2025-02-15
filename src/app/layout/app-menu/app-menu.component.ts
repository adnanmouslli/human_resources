import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../service/layout-service.service';
import { CommonModule } from '@angular/common';
import { AppMenuitemComponent } from './app.menuitem.component';


@Component({
  selector: 'app-app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitemComponent],
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit {
  model: any[] = [];

  constructor(public layoutService: LayoutService) { }

  ngOnInit() {
    this.model = [
      {
        label: 'الرئيسية',
        items: [
          { label: 'لوحة التحكم', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
        ]
      },
      {
        label: 'إدارة الوارديات',
        items: [
            { label: 'عرض الوارديات', icon: 'pi pi-fw pi-list', routerLink: ['/shifts/list'] },
            // { label: 'إضافة واردية', icon: 'pi pi-fw pi-plus', routerLink: ['/shifts/add'] },
        ]
      },
      {
        label: 'إدارة الإنتاج',
        items: [
          { label: 'إدارة القطع', icon: 'pi pi-fw pi-box', routerLink: ['/production/pieces'] },
          { label: 'مراقبة الإنتاج', icon: 'pi pi-fw pi-eye', routerLink: ['/production/monitor'] },
          { label: 'تقارير الإنتاج', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/production/reports'] },
        ]
      },
      {
        label: 'إدارة الموظفين',
        items: [
          { label: 'إضافة موظف جديد', icon: 'pi pi-fw pi-user-plus', routerLink: ['/employees/add'] },
          { label: 'عرض الموظفين', icon: 'pi pi-fw pi-users', routerLink: ['/employees/list'] },
          { label: 'السلف والمسحوبات', icon: 'pi pi-fw pi-wallet', routerLink: ['/employees/advances'] },
          { label: 'المكافآت', icon: 'pi pi-fw pi-gift', routerLink: ['/employees/rewards'] },
          { label: 'الجزاءات', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/employees/penalties'] },
          { label: 'المسميات الوظيفية', icon: 'pi pi-fw pi-briefcase', routerLink: ['/job-titles/list'] },
        ]
      },
      {
        label: 'الحضور والانصراف',
        items: [
          { label: 'سجل الحضور', icon: 'pi pi-fw pi-calendar', routerLink: ['/employees/attendance'] },
          // { label: 'تقارير الحضور', icon: 'pi pi-fw pi-file', routerLink: ['/attendance/reports'] },
        ]
      },
      {
        label: 'إدارة الرواتب',
        items: [
          { label: 'قائمة الرواتب', icon: 'pi pi-fw pi-money-bill', routerLink: ['/payroll/list'] },
          { label: 'إعداد الرواتب', icon: 'pi pi-fw pi-cog', routerLink: ['/payroll/setup'] },
        ]
      },
      {
        label: 'الإجازات',
        items: [
          { label: 'طلبات الإجازة', icon: 'pi pi-fw pi-envelope', routerLink: ['/leaves/requests'] },
          { label: 'سجل الإجازات', icon: 'pi pi-fw pi-file', routerLink: ['/leaves/log'] },
        ]
      },
      // {
      //   label: 'التقييمات',
      //   items: [
      //     { label: 'تقييم الأداء', icon: 'pi pi-fw pi-star', routerLink: ['/reviews/performance'] },
      //     { label: 'التقارير', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reviews/reports'] },
      //   ]
      // },
      // {
      //   label: 'التقارير',
      //   items: [
      //     { label: 'تقارير عامة', icon: 'pi pi-fw pi-chart-line', routerLink: ['/reports/general'] },
      //     { label: 'تقارير مخصصة', icon: 'pi pi-fw pi-file-export', routerLink: ['/reports/custom'] },
      //   ]
      // },
      {
        label: 'الإعدادات',
        items: [
          { label: 'إعدادات النظام', icon: 'pi pi-fw pi-cog', routerLink: ['/settings/general'] },
          { label: 'إدارة المستخدمين', icon: 'pi pi-fw pi-users', routerLink: ['/settings/users'] },
          { label: 'بيانات التطوير', icon: 'pi pi-fw pi-code', routerLink: ['/settings/dev-monitor'] } // New item

        ]
      }
    ];
}

}
