import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { AppHeader, AppFooter } from '../shared/layout';

@Component({
  selector: 'app-officer-schedule',
  standalone: true,
  imports: [FormsModule, IonicModule, RouterLink, AppHeader, AppFooter],
  template: ` <app-header title="Duty schedule"></app-header
    ><ion-content>
      <section class="page officer-page">
        <p class="eyebrow">OFFICER IN CHARGE</p>
        <h1>Duty schedule</h1>
        <a routerLink="/officer/dashboard">Back to dashboard</a>
        <div class="card">
          <label for="schedule-date">Duty date</label
          ><input
            id="schedule-date"
            class="field"
            type="date"
            [(ngModel)]="date"
          />
          <p class="muted">
            {{ ds.slotLabel }} · {{ booked }} / {{ ds.seats }} seats booked
          </p>
          <div class="table-scroll">
            <table class="duty-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Section</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (r of records; track r.id) {
                  <tr>
                    <td>{{ r.name }}</td>
                    <td>{{ r.section }}</td>
                    <td>{{ ds.status(r) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3">No student reservations for this date.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <app-footer></app-footer
    ></ion-content>`,
})
export class OfficerSchedulePage {
  ds = inject(DataService);
  date = this.ds.key(new Date());
  get records() {
    return this.ds.records().filter((r) => r.date === this.date);
  }
  get booked() {
    return this.date ? this.ds.bookedOn(new Date(this.date + 'T00:00:00')) : 0;
  }
}
