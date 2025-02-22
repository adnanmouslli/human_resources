import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { DevMonitorComponent } from './pages/setting/dev-monitor/dev-monitor.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo: 'auth/login',
        pathMatch:'full'
    },
    {
        path:'auth',
        loadChildren: () =>
          import('./pages/auth/auth.module').then((m) => m.AuthModule),
    },
    {
      path: '',
      component: AppLayoutComponent,
      children: [
          {
              path: 'dashboard',
              loadChildren: () =>
                  import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
          },
          {
            path: 'employees',
            loadChildren: () =>
                  import('./pages/employee/employee.module').then((m) => m.EmployeeModule)
          },
          {
            path: 'job-titles',
            loadChildren: () =>
                  import('./pages/job-titles/job-titles.module').then((m) => m.JobTitlesModule)
          },
          {
            path: 'shifts',
            loadChildren: () =>
                  import('./pages/shift/shift.module').then((m) => m.ShiftModule)
          },
          {
            path: 'production',
            loadChildren: () =>
                  import('./pages/production/production.module').then((m) => m.ProductionModule)
          },
          {
            path: 'hours',
            loadChildren: () =>
                  import('./pages/hours/hours.module').then((m) => m.HoursModule)
          },
          {
            path: 'monthly',
            loadChildren: () =>
                  import('./pages/months/months.module').then((m) => m.MonthsModule)
          },
          // {
          //   path: 'settings/dev-monitor',
          //   component: DevMonitorComponent
          // },
          {
            path: 'payroll',
            loadChildren: () =>
              import('./pages/payrolls/payrolls.module').then((m) => m.PayrollsModule)
            
          }
      ],
    },
    { path: 'notfound', component: NotfoundComponent },
    { path: '**', redirectTo: '/notfound' },

];
