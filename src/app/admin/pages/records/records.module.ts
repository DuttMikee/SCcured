import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';

import { RecordsPageRoutingModule } from './records-routing.module';
import { RecordsPage } from './records.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, RecordsPageRoutingModule],
  declarations: [RecordsPage],
})
export class RecordsPageModule {}

