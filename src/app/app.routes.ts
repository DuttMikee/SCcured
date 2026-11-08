import { Routes } from '@angular/router';
import { officerGuard, adminGuard } from './auth.service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./pages/home.page').then(m => m.HomePage) },
  { path: 'capstones', loadComponent: () => import('./pages/catalog.page').then(m => m.CatalogPage) },
  { path: 'reserve', loadComponent: () => import('./pages/reserve.page').then(m => m.ReservePage) },
  { path: 'officer/dashboard', canActivate: [officerGuard], loadComponent: () => import('./pages/officer-dashboard.page').then(m => m.OfficerDashboardPage) },
  { path: 'officer/schedule', canActivate: [officerGuard], loadComponent: () => import('./pages/officer-schedule.page').then(m => m.OfficerSchedulePage) },
  { path: 'attendance', canActivate: [officerGuard], loadComponent: () => import('./pages/attendance.page').then(m => m.AttendancePage) },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'admin', pathMatch: 'full', redirectTo: 'admin/students' },
  ...(['students', 'schedule', 'records'] as const).map(path => ({
    path, pathMatch: 'full' as const, redirectTo: 'admin/' + path,
  })),
  { path: 'admin-login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'admin/students', canActivate: [adminGuard], loadChildren: () => import('./admin/pages/students/students.module').then(m => m.StudentsPageModule) },
  { path: 'admin/schedule', canActivate: [adminGuard], loadChildren: () => import('./admin/pages/schedule/schedule.module').then(m => m.SchedulePageModule) },
  { path: 'admin/records', canActivate: [adminGuard], loadChildren: () => import('./admin/pages/records/records.module').then(m => m.RecordsPageModule) },
  { path: '**', redirectTo: 'home' },
];
