import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { AppHeader, AppFooter } from '../shared/layout';
import { DataService } from '../data.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, IonicModule, AppHeader, AppFooter],
  template: ` <app-header title="Dashboard · Officer in Charge"></app-header>
    <ion-content
      ><section class="page officer-page">
        <p class="eyebrow">LIBRARY ADMINISTRATION</p>
        <h1>Dashboard</h1>
        <p class="muted">
          {{ today | date: 'EEEE, d MMMM y' }} · Today's library duty at a
          glance.
        </p>
        <p class="demo-label">
          Demo records · Changes are shared across roles and saved in this browser when storage is available.
        </p>
        <div class="officer-stats">
          <div class="card">
            <span class="muted">Scheduled today</span
            ><strong class="metric">{{ scheduled }}</strong
            ><small class="muted">{{ onDuty }} / {{ scheduled }} on duty</small>
          </div>
          <div class="card">
            <span class="muted">Checked in</span
            ><strong class="metric">{{ checkedIn }}</strong
            ><small class="muted">{{ onDuty }} currently on duty</small>
          </div>
          <div class="card">
            <span class="muted">Available slots</span
            ><strong class="metric">{{ available }}</strong
            ><small class="muted"
              >{{ scheduled }} of {{ ds.seats }} booked</small
            >
          </div>
        </div>
        <div class="officer-grid">
          <div class="card">
            <h2>Today's attendance</h2>
            <div class="table-scroll">
              <table class="duty-table">
                <thead>
                  <tr>
                    <th>Student / Section</th>
                    <th>Time in</th>
                    <th>Time out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of ds.recordsOn(today); track r.id) {
                    <tr>
                      <td>
                        <b>{{ r.name }}</b
                        ><small class="student-section">{{ r.section }}</small>
                      </td>
                      <td>{{ r.in ?? '—' }}</td>
                      <td>{{ r.out ?? '—' }}</td>
                      <td>
                        <span class="chip" [class.gray]="!r.in">{{
                          ds.status(r)
                        }}</span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4">No students scheduled today.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <ion-button class="fit-button" routerLink="/attendance"
              >Manage attendance</ion-button
            >
          </div>
          <div class="card capacity">
            <h2>
              Slot capacity
              <span class="chip" [class.gray]="available > 0">{{
                available === 0 ? 'Full' : 'Available'
              }}</span>
            </h2>
            <small class="muted"
              >{{ today | date: 'd MMMM y' }} · Booked / seats</small
            >
            <div class="capacity-label">
              <b>{{ ds.slotLabel }}</b
              ><span>{{ scheduled }} / {{ ds.seats }}</span>
            </div>
            <progress
              [value]="scheduled"
              [max]="ds.seats"
              aria-label="Booked seats"
            ></progress>
          </div>
          <div class="card">
            <h2>Next on the schedule</h2>
            @if (next; as duty) {
              <p class="muted">
                {{ duty.date | date: 'EEEE, d MMMM y' }} · {{ ds.slotLabel }}
              </p>
              <p class="muted">{{ countOn(duty.date) }} reservations</p>
            } @else {
              <p class="muted">No upcoming reservations.</p>
            }
            <ion-button
              class="fit-button"
              fill="outline"
              routerLink="/officer/schedule"
              >View schedule</ion-button
            >
          </div>
        </div>
      </section>
      <app-footer></app-footer
    ></ion-content>`,
})
export class OfficerDashboardPage {
  ds = inject(DataService);
  get today() {
    return new Date();
  }
  get scheduled() {
    return this.ds.bookedOn(this.today);
  }
  get checkedIn() {
    return this.ds.recordsOn(this.today).filter((r) => r.in).length;
  }
  get onDuty() {
    return this.ds.recordsOn(this.today).filter((r) => r.in && !r.out).length;
  }
  get available() {
    return Math.max(0, this.ds.seats - this.scheduled);
  }
  get next() {
    return this.ds
      .records()
      .filter((r) => r.date > this.ds.key(this.today))
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }
  countOn(date: string) {
    return this.ds.records().filter((r) => r.date === date).length;
  }
}
