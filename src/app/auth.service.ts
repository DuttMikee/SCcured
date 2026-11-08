import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export type Role = 'student' | 'officer' | 'admin';
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<{ id: string; role: Role } | null>(null);
  readonly isAdmin = () => this.session()?.role === 'admin';
  readonly isOfficer = () => this.session()?.role === 'officer';
  // Prototype only: replace with server authentication and server-side role checks.
  signInDemo(id: string, role: Exclude<Role, 'admin'>) { if (id.trim()) this.session.set({ id: id.trim(), role }); }
  loginAdmin(id: string, password: string): boolean {
    if (id.trim() !== 'admin' || password !== 'admin123') return false;
    this.session.set({ id: 'admin', role: 'admin' }); return true;
  }
  signOut() { this.session.set(null); }
}
export const officerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isOfficer() || inject(Router).createUrlTree(['/login'], { queryParams: { role: 'officer' } });
};

export const adminGuard: CanActivateFn = () => inject(AuthService).isAdmin() || inject(Router).createUrlTree(['/login'], { queryParams: { role: 'admin' } });
