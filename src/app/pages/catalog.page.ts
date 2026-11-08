import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { AppHeader, AppFooter } from '../shared/layout';
import { DataService } from '../data.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [IonicModule, FormsModule, AppHeader, AppFooter],
  template: `
  <app-header title="Capstone Catalog"></app-header>
  <ion-content>
    <section class="page">
      <p class="eyebrow">PAMANTASAN NG LUNGSOD NG VALENZUELA</p>
      <h1>Capstone Catalog</h1>
      <p class="muted">Explore student research. All titles and abstracts shown here are sample content.</p>

      <div class="card">
        <label>Search research</label>
        <ion-input class="field" placeholder="Search by title or keyword" [(ngModel)]="q"></ion-input>
        <label>Program</label>
        <ion-select class="field" [(ngModel)]="program" interface="popover" placeholder="All programs">
          <ion-select-option value="">All programs</ion-select-option>
          <ion-select-option value="BSIT">BSIT</ion-select-option>
        </ion-select>
        <label>Year</label>
        <ion-select class="field" [(ngModel)]="year" interface="popover" placeholder="All years">
          <ion-select-option value="">All years</ion-select-option>
          <ion-select-option value="2026">2026</ion-select-option>
          <ion-select-option value="2025">2025</ion-select-option>
        </ion-select>
      </div>

      <b>{{ list.length }} sample capstone{{ list.length === 1 ? '' : 's' }}</b>
      <p class="muted">Sorted by year, newest first</p>

      @for (c of list; track c.id) {
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
export class CatalogPage {
  ds = inject(DataService);
  q = ''; program = ''; year = '';
  get list() {
    const q = (this.q ?? '').toLowerCase();
    return this.ds.capstones
      .filter(c => (!q || (c.title + c.blurb).toLowerCase().includes(q))
        && (!this.program || c.program === this.program)
        && (!this.year || String(c.year) === this.year))
      .sort((a, b) => b.year - a.year);
  }
}
