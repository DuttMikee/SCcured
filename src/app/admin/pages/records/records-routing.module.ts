import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecordsPage } from './records.page';

const routes: Routes = [{ path: '', component: RecordsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordsPageRoutingModule {}

