import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';

import { StudentsPageRoutingModule } from './students-routing.module';
import { StudentsPage } from './students.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, StudentsPageRoutingModule],
  declarations: [StudentsPage],
})
export class StudentsPageModule {}

