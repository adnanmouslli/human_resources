import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HoursProfessionsComponent } from './hours-professions/hours-professions.component';

const routes: Routes = [

    { path: 'professions', component: HoursProfessionsComponent },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HoursRoutingModule { }
