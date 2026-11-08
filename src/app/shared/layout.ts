import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule],
  template: `
  <ion-header class="plv-header">
    <ion-toolbar>
      <ion-menu-button slot="start"></ion-menu-button>
      <ion-title>{{ title }}</ion-title>
      <div slot="end" class="logos">
        <img src="assets/logo.png" alt="" onerror="this.style.display='none'" />
        <span class="seal">PLV seal</span>
      </div>
    </ion-toolbar>
    <div class="sub">PLV • Student Library Duty Social Contract</div>
  </ion-header>`,
})
export class AppHeader { @Input() title = ''; }

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="plv-footer">
    <div class="row"><span class="seal">PLV seal</span><strong>Pamantasan ng Lungsod ng Valenzuela</strong></div>
    <p>PLV • Student Library Duty Social Contract</p>
    <a routerLink="/login">Student services</a>
  </footer>`,
})
export class AppFooter {}
