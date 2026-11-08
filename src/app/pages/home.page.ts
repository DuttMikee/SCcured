import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { AppHeader, AppFooter } from '../shared/layout';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, RouterLink, DatePipe, UpperCasePipe, AppHeader, AppFooter],
  template: `
  <app-header title="Home"></app-header>
  <ion-content>
    <section class="page">
      <p class="eyebrow">PAMANTASAN NG LUNGSOD NG VALENZUELA</p>
      <h1>Home</h1>
      <p class="muted">Your library, your time, your contribution.</p>

      <div class="card">
        <span class="chip">PLV LIBRARY • STUDENT SERVICES</span>
        <h2 class="big">Student Library Duty Social Contract</h2>
        <p class="muted">Make time for the library. Reserve a duty slot with your section and name, or explore sample student research.</p>
        <ion-button expand="block" routerLink="/reserve">Reserve duty</ion-button>
        <ion-button expand="block" fill="outline" routerLink="/capstones">Browse capstones</ion-button>
        <small class="muted">Sign-in using your student number.</small>
      </div>

      <div class="card tint">
        <h2>A small commitment. A shared space.</h2>
        <p class="muted">Choose an available weekday and a time that works for you.</p>
        <div class="card inner">
          <small class="eyebrow">{{ today | date:'EEEE, d MMMM y' | uppercase }}</small>
          <h3>{{ left }} seat{{ left === 1 ? '' : 's' }} available</h3>
          <small>{{ ds.slotLabel }} · {{ booked }} of {{ ds.seats }} booked</small>
        </div>
      </div>

      <h2>Reserve in three simple steps</h2>
      @for (s of steps; track s.n) {
        <div class="card step"><b class="num">{{ s.n }}</b><div><h3>{{ s.t }}</h3><p class="muted">{{ s.d }}</p></div></div>
      }

      <h2>Featured capstones</h2>
      <ion-button expand="block" fill="outline" routerLink="/capstones">View catalog</ion-button>
      @for (c of ds.capstones.slice(0, 3); track c.id) {
        <div class="card">
          <span class="chip">{{ c.program }} · {{ c.year }}</span>
          <h3 class="big">{{ c.title }}</h3>
          <p class="muted">{{ c.blurb }}</p>
          <ion-button expand="block" fill="outline"><ion-icon name="arrow-up-outline" slot="start"></ion-icon>Read abstract</ion-button>
        </div>
      }
    </section>
    <app-footer></app-footer>
  </ion-content>`,
})
export class HomePage {
  ds = inject(DataService);
  today = new Date();
  get booked() { return this.ds.bookedOn(this.today); }
  get left() { return Math.max(0, this.ds.seats - this.booked); }
  steps = [
    { n: 1, t: 'Student Information', d: 'Enter your section and name.' },
    { n: 2, t: 'Choose your duty slot', d: 'Check seats on the calendar and select an available slot.' },
    { n: 3, t: 'Confirm your reservation', d: 'Review your details and keep your confirmation.' },
  ];
}
