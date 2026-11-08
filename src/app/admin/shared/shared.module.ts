import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

import { AppHeaderComponent } from './app-header/app-header.component';
import { AppFooterComponent } from './app-footer/app-footer.component';

@NgModule({
  declarations: [AppHeaderComponent, AppFooterComponent],
  imports: [CommonModule, IonicModule],
  exports: [AppHeaderComponent, AppFooterComponent],
})
export class SharedModule {}

