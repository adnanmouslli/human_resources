import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

import { EmployeeRoutingModule } from './employee-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    ToastModule
  ]
})
export class EmployeeModule { }
