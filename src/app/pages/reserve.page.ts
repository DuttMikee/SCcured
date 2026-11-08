import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { AppHeader, AppFooter } from '../shared/layout';
import { DataService, Cell } from '../data.service';

@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [IonicModule, FormsModule, DatePipe, AppHeader, AppFooter],
  template: `
  <app-header title="Reserve Social Contract Duty"></app-header>
  <ion-content>
    <section class="page">
      <p class="eyebrow">PAMANTASAN NG LUNGSOD NG VALENZUELA</p>
      <h1>Reserve duty</h1>
      <p class="muted">Reserve using only your section and name. No student account is needed.</p>

      @if (done()) {
        <div class="card success">
          <ion-icon name="checkmark-circle-outline" class="ok"></ion-icon>
          <h2 class="big">Your duty slot is reserved</h2>
          <p class="muted">Keep these details for your scheduled library duty.</p>
          <div class="card tint">
            <b>{{ name }} · {{ section }}</b>
            <p>{{ selected | date:'EEEE, d MMMM y' }}<br>{{ ds.slotLabel }}</p>
            <span class="chip ok">Confirmed · {{ ds.bookedOn(selected!) }} / {{ ds.seats }} seats now booked</span>
          </div>
          <ion-button expand="block" (click)="router.navigateByUrl('/home')">Back to home</ion-button>
        </div>
      }

      <div class="card">
        <h2>1. Your details</h2>
        <label>Section</label>
        <ion-input class="field" placeholder="e.g. BSIT 3-9" [(ngModel)]="section"></ion-input>
        <label>Name</label>
        <ion-input class="field" placeholder="Your full name" [(ngModel)]="name"></ion-input>
      </div>
      <div class="note"><ion-icon name="information-circle-outline"></ion-icon><div><b>Schedule</b><br>Weekdays only · {{ ds.seats }} seats per slot.</div></div>

      <div class="card">
        <h2>2. Choose a date</h2>
        <div class="monthbar">
          <b class="big">{{ monthDate | date:'MMMM y' }}</b>
          <span>
            <ion-button fill="clear" (click)="shift(-1)"><ion-icon name="chevron-back" slot="icon-only"></ion-icon></ion-button>
            <ion-button fill="clear" (click)="shift(1)"><ion-icon name="chevron-forward" slot="icon-only"></ion-icon></ion-button>
          </span>
        </div>
        <div class="cal">
          @for (h of ['M','T','W','TH','F','Sat','Sun']; track h) { <div class="dow">{{ h }}</div> }
          @for (c of cells; track $index) {
            @if (c) {
              <button class="day" [class.off]="c.off" [class.sel]="isSel(c)" [disabled]="c.off || c.past" (click)="pick(c)">
                {{ c.day }}<small>{{ c.off ? 'Off' : c.past ? '—' : c.booked + '/' + ds.seats }}</small>
              </button>
            } @else { <div></div> }
          }
        </div>
        <small class="muted">Booked / total seats · Weekends off • Past dates are unavailable.</small>
      </div>

      @if (error) { <p role="alert">{{ error }}</p> }
      <div class="card">
        <h2>3. Select a slot and confirm</h2>
        @if (selected) {
          <span class="chip">{{ selected | date:'EEEE, d MMMM y' }}</span>
          <label>Duty slot</label>
          <div class="field slot">{{ ds.slotLabel }} · {{ full ? 'slot unavailable' : 'slot available' }}</div>
          <p class="muted">Social contract duty · 9 hours · {{ ds.bookedOn(selected) }} of {{ ds.seats }} seats booked.</p>
          <div class="note"><ion-icon name="information-circle-outline"></ion-icon>
            <div><b>Review your reservation</b><br>{{ name || '—' }} · {{ section || '—' }} • {{ selected | date:'d MMMM y' }} · {{ ds.slotLabel }}</div></div>
          <ion-button expand="block" [disabled]="done() || !canConfirm" (click)="confirm()">Confirm reservation</ion-button>
        } @else {
          <p class="muted">Pick a weekday above to see its slot.</p>
        }
      </div>
    </section>
    <app-footer></app-footer>
  </ion-content>`,
})
export class ReservePage {
  ds = inject(DataService);
  router = inject(Router);
  section = ''; name = '';
  selected: Date | null = null;
  done = signal(false);
  error = '';
  monthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  get cells() { return this.ds.monthCells(this.monthDate.getFullYear(), this.monthDate.getMonth()); }
  get full() { return !!this.selected && this.ds.bookedOn(this.selected) >= this.ds.seats; }
  get canConfirm() { return !!this.selected && !this.full && !!this.section.trim() && !!this.name.trim(); }
  isSel(c: Cell) { return !!this.selected && this.ds.key(c.date) === this.ds.key(this.selected); }
  pick(c: Cell) { this.selected = c.date; this.done.set(false); }
  shift(n: number) { this.monthDate = new Date(this.monthDate.getFullYear(), this.monthDate.getMonth() + n, 1); }
  confirm() { if (this.done() || !this.canConfirm) return; this.error = ''; if (this.ds.reserve(this.selected!, this.name, this.section)) this.done.set(true); else this.error = 'Reservation unavailable. Check for an existing booking or choose another date.'; }
}
