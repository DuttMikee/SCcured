import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { AppHeader, AppFooter } from '../shared/layout';
import { AuthService, Role } from '../auth.service';

@Component({
  selector: 'app-login', standalone: true,
  imports: [IonicModule, FormsModule, AppHeader, AppFooter],
  template: `
  <app-header title="Log-in"></app-header>
  <ion-content><section class="page login-page">
    <p class="eyebrow">LIBRARY ADMINISTRATION</p><h1>Library access</h1>
    <div class="card">
      <h2>{{ role === 'admin' ? 'Admin' : role === 'officer' ? 'Officer in Charge' : 'Student' }} access</h2>
      <label for="role">Role</label>
      <select id="role" class="field" [(ngModel)]="role">
        <option value="admin">Admin</option><option value="student">Student</option><option value="officer">Officer in Charge</option>
      </select>
      <label for="identity">{{ role === 'admin' ? 'Username' : role === 'officer' ? 'Staff ID' : 'Student number' }}</label>
      <input id="identity" class="field" [(ngModel)]="identity" placeholder="Enter your ID" />
      @if (role === 'admin') { <label for="password">Password</label><input id="password" class="field" type="password" [(ngModel)]="password" autocomplete="current-password" /> }
      @if (error) { <p role="alert">{{ error }}</p> }
      <p class="muted">{{ role === 'officer' ? 'Review library duty schedules and record student attendance.' : 'Reserve library duty and browse student research.' }}</p>
      <ion-button [disabled]="!identity.trim()" (click)="signIn()">Continue as {{ role === 'admin' ? 'Admin' : role === 'officer' ? 'Officer in Charge' : 'Student' }}</ion-button>
      <div class="note">Demo access: students and officers can use any ID. Admin: admin / admin123. These are local demo credentials. A server login is required before using real student records.</div>
    </div>
  </section><app-footer></app-footer></ion-content>`,
})
export class LoginPage {
  router = inject(Router); auth = inject(AuthService);
  requestedRole = inject(ActivatedRoute).snapshot.queryParamMap.get('role');
  role: Role = this.requestedRole === 'admin' || this.requestedRole === 'officer' ? this.requestedRole : 'student';
  password = ''; error = '';
  identity = '';
  signIn() {
    if (!this.identity.trim()) return;
    this.error = '';
    if (this.role === 'admin') {
      if (!this.auth.loginAdmin(this.identity, this.password)) { this.error = 'Invalid admin credentials.'; return; }
    } else this.auth.signInDemo(this.identity, this.role);
    this.router.navigateByUrl(this.role === 'admin' ? '/admin/students' : this.role === 'officer' ? '/officer/dashboard' : '/home');
  }
}
