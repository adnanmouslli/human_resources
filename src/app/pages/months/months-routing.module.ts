import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthlyAttendanceComponent } from './monthly-attendance/monthly-attendance.component';

const routes: Routes = [

      { path: 'attendance-log', component: MonthlyAttendanceComponent  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonthsRoutingModule { }
