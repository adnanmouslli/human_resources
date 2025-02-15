import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListShiftComponent } from './list-shift/list-shift.component';

const routes: Routes = [
    { path: 'list', component: ListShiftComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShiftRoutingModule { }
