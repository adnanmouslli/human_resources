import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollsComponent } from './payrolls.component';

const routes: Routes = [
        { path: 'setup', component: PayrollsComponent  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollsRoutingModule { }