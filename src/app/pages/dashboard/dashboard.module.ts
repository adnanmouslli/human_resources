import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../core/services/toast.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ToastModule
  ],
  providers: [
    ToastService
  ]
})
export class DashboardModule { }