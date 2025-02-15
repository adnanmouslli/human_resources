import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListEmployeesComponent } from './list-employees/list-employees.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { AttendanceEmployeesComponent } from './attendance-employees/attendance-employees.component';
import { EmployeeAdvancesComponent } from './employee-advances/employee-advances.component';
import { EmployeeRewardsComponent } from './employee-rewards/employee-rewards.component';
import { EmployeePenaltiesComponent } from './employee-penalties/employee-penalties.component';

const routes: Routes = [

  { path: 'list', component: ListEmployeesComponent },
  { path: 'add', component: AddEmployeeComponent },
  { path: 'attendance', component: AttendanceEmployeesComponent },
  { path: 'advances', component: EmployeeAdvancesComponent },
  { path: 'rewards', component: EmployeeRewardsComponent },
  { path: 'penalties', component: EmployeePenaltiesComponent },


  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
