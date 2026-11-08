import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { IonicModule } from '@ionic/angular/lazy';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterLink],
  template: `
  <ion-app>
    <ion-menu contentId="main">
      <ion-content>
        <ion-list lines="none">
          @if (auth.session(); as session) {
            <ion-item><ion-label>{{ auth.isAdmin() ? 'Admin' : auth.isOfficer() ? 'Officer in Charge' : 'Student' }} · {{ session.id }}</ion-label></ion-item>
          }
          @for (l of links; track l.url) {
            <ion-menu-toggle auto-hide="false">
              <ion-item [routerLink]="l.url" routerDirection="root" detail="false">
                <ion-label>{{ l.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          }
          @if (auth.session()) {
            <ion-menu-toggle><ion-item button (click)="signOut()"><ion-label>Sign out</ion-label></ion-item></ion-menu-toggle>
          }
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main"></ion-router-outlet>
  </ion-app>`,
})
export class AppComponent {
  auth = inject(AuthService);
  router = inject(Router);
  signOut() { this.auth.signOut(); this.router.navigateByUrl('/login'); }
  get links() { return [
    { title: 'Home', url: '/home' },
    { title: 'Reserve duty', url: '/reserve' },
    { title: 'Capstone catalog', url: '/capstones' },
    ...(this.auth.isAdmin() ? [
      { title: 'Manage students', url: '/admin/students' },
      { title: 'Manage schedule', url: '/admin/schedule' },
      { title: 'Service records', url: '/admin/records' },
    ] : []),
    ...(this.auth.isOfficer() ? [
      { title: 'Officer dashboard', url: '/officer/dashboard' },
      { title: 'Manage attendance', url: '/attendance' },
      { title: 'Duty schedule', url: '/officer/schedule' },
    ] : []),
    { title: 'Log-in / Switch role', url: '/login' },
  ]; }
}
