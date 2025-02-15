import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListJobTitlesComponent } from './list-job-titles/list-job-titles.component';

const routes: Routes = [

    { path: 'list', component: ListJobTitlesComponent },
      
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobTitlesRoutingModule { }
