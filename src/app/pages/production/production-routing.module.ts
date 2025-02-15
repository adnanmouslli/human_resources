import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductionPiecesComponent } from './production-pieces/production-pieces.component';
import { ProductionReportsComponent } from './production-reports/production-reports.component';
import { ProductionMonitorComponent } from './production-monitor/production-monitor.component';

const routes: Routes = [
  { path: 'pieces', component: ProductionPiecesComponent },
  { path: 'reports', component: ProductionReportsComponent },
  { path: 'monitor', component: ProductionMonitorComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductionRoutingModule { }
