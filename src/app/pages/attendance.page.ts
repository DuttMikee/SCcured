import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { AppHeader, AppFooter } from '../shared/layout';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-attendance', standalone: true,
  imports: [IonicModule, FormsModule, DatePipe, RouterLink, AppHeader, AppFooter],
  template: `
  <app-header title="Student’s Attendance"></app-header><ion-content>
  <section class="page officer-page"><p class="eyebrow">OFFICER IN CHARGE</p><h1>Attendance</h1>
    <p class="muted">Record library duty time and attach a duty photo for the selected student.</p>
    <a routerLink="/officer/dashboard">Back to dashboard</a>
    <div class="attendance-grid">
      <div class="card"><h2>STUDENT</h2>
        <label for="student">Select student</label>
        <select id="student" class="field" [(ngModel)]="selectedId" (ngModelChange)="resetPhoto()">
          @for (r of records; track r.id) { <option [ngValue]="r.id">{{ r.name }} · {{ r.section }}</option> }
        </select>
        @if (current; as r) { <small class="muted">{{ ds.status(r) }} · {{ r.section }}</small> }
        <div class="drop duty-photo">
          @if (photo()) { <img [src]="photo()" alt="Selected duty documentation" /> }
          @else { <div><ion-icon name="camera-outline"></ion-icon><p class="muted">Documentation required</p></div> }
        </div>
        <input #cam type="file" accept="image/png,image/jpeg" capture="environment" hidden (change)="onFile($event)" />
        <input #upload type="file" accept="image/png,image/jpeg" hidden (change)="onFile($event)" />
        <div class="photo-actions">
          <ion-button fill="outline" (click)="upload.click()">Upload photo</ion-button>
          <ion-button fill="outline" (click)="cam.click()">Open camera</ion-button><small class="muted">JPG or PNG, up to 5 MB.</small>
        </div>
        <div class="attendance-actions">
          <ion-button [disabled]="!photo() || !current || !current.in || !!current.out" (click)="record('out')">Time out</ion-button>
          <ion-button fill="outline" [disabled]="!photo() || !current || !!current.in" (click)="record('in')">Time in</ion-button>
        </div>
        <p role="status" aria-live="polite" class="muted">{{ message() }}</p>
      </div>
      <div class="clock"><div class="time">{{ now() | date:'HH:mm:ss' }}</div><span>{{ now() | date:'EEEE, d MMMM y' }}</span></div>
    </div>
    <div class="card"><h2>Daily log · {{ now() | date:'d MMMM y' }}</h2>
      <div class="table-scroll"><table class="duty-table"><thead><tr><th>Student</th><th>Time in</th><th>Time out</th><th>Status</th><th>Documentation</th></tr></thead><tbody>
      @for (r of records; track r.id) {
        <tr><td><b>{{ r.name }}</b><small class="student-section">{{ r.section }}</small></td><td>{{ r.in ?? '—' }}</td><td>{{ r.out ?? '—' }}</td><td><span class="chip" [class.gray]="!r.in">{{ ds.status(r) }}</span></td>
        <td><div class="evidence">@if (r.inPhoto) { <a [href]="r.inPhoto" [download]="'time-in-' + r.id + '.jpg'"><img [src]="r.inPhoto" alt="Time in photo" /></a> } @if (r.outPhoto) { <a [href]="r.outPhoto" [download]="'time-out-' + r.id + '.jpg'"><img [src]="r.outPhoto" alt="Time out photo" /></a> } @if (!r.inPhoto && !r.outPhoto) { <span>—</span> }</div></td></tr>
      } @empty { <tr><td colspan="5">No students scheduled today.</td></tr> }
      </tbody></table></div>
      <small class="muted">Library duty · {{ checkedIn }} checked in, {{ records.length - checkedIn }} expected.</small>
    </div>
  </section><app-footer></app-footer></ion-content>`,
})
export class AttendancePage implements OnDestroy {
  ds = inject(DataService); auth = inject(AuthService);
  now = signal(new Date());
  private timer = setInterval(() => this.now.set(new Date()), 1000);
  selectedId = this.ds.recordsOn(new Date())[1]?.id ?? this.ds.recordsOn(new Date())[0]?.id ?? 0;
  photo = signal<string | null>(null); message = signal('');
  private fileVersion = 0;
  get records() { return this.ds.recordsOn(this.now()); }
  get current() { return this.records.find(r => r.id === this.selectedId); }
  get checkedIn() { return this.records.filter(r => r.in).length; }
  ngOnDestroy() { clearInterval(this.timer); this.fileVersion++; }
  resetPhoto() { this.fileVersion++; this.photo.set(null); this.message.set(''); }
  record(kind: 'in' | 'out') {
    if (!this.auth.isOfficer() || !this.photo()) return;
    if (this.ds.recordTime(this.selectedId, kind, this.photo()!, new Date())) {
      this.resetPhoto(); this.message.set(kind === 'in' ? 'Time in recorded with duty photo.' : 'Time out recorded with duty photo.');
    } else this.message.set('Unable to record attendance. Check the student and current status.');
  }
  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (!file) return;
    this.resetPhoto();
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.message.set('Choose a JPG or PNG image up to 5 MB.'); return;
    }
    const version = this.fileVersion;
    const reader = new FileReader();
    reader.onerror = () => { if (version === this.fileVersion) this.message.set('Could not read the photo. Try another file.'); };
    reader.onload = () => {
      const image = new Image();
      image.onload = () => { if (version === this.fileVersion) this.photo.set(reader.result as string); };
      image.onerror = () => { if (version === this.fileVersion) this.message.set('This file is not a readable image.'); };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
