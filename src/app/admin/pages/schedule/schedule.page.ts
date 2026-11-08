import { Component, OnInit } from '@angular/core';
import {
  LibraryDataService,
  SEATS_PER_SLOT,
  SLOT_LABEL,
  Student,
  fromKey,
  toKey,
} from '../../services/library-data.service';

interface DayCell {
  date: Date;
  key: string;
  day: number;
  off: boolean;
  past: boolean;
  booked: number;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: false,
})
export class SchedulePage implements OnInit {
  readonly seats = SEATS_PER_SLOT;
  readonly slot = SLOT_LABEL;
  readonly weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  month!: Date; // first day of the visible month
  selectedKey = '';
  blanks: number[] = [];
  cells: DayCell[] = [];
  pickedStudentId: number | null = null;

  constructor(public data: LibraryDataService) {}

  ngOnInit() {
    let start = this.data.today();
    // if today is a weekend, start on the next weekday
    while (this.data.isWeekend(start)) {
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    }
    this.selectedKey = toKey(start);
    this.month = new Date(start.getFullYear(), start.getMonth(), 1);
    this.build();
  }

  ionViewWillEnter() { if (this.month) this.build(); }

  // ----- calendar -----
  build() {
    const y = this.month.getFullYear();
    const m = this.month.getMonth();
    const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
    const count = new Date(y, m + 1, 0).getDate();

    this.blanks = Array.from({ length: firstWeekday }, (_, i) => i);
    this.cells = Array.from({ length: count }, (_, i) => {
      const date = new Date(y, m, i + 1);
      const key = toKey(date);
      return {
        date,
        key,
        day: i + 1,
        off: this.data.isWeekend(date),
        past: this.data.isPast(date),
        booked: this.data.seatsBooked(key),
      };
    });
  }

  changeMonth(delta: number) {
    this.month = new Date(this.month.getFullYear(), this.month.getMonth() + delta, 1);
    this.build();
  }

  select(c: DayCell) {
    if (c.off || c.past) return;
    this.selectedKey = c.key;
    this.pickedStudentId = null;
  }

  // ----- selected day panel -----
  get selectedDate(): Date {
    return fromKey(this.selectedKey);
  }

  get booked() {
    return this.data.dutiesOn(this.selectedKey);
  }

  get bookedCount(): number {
    return this.booked.length;
  }

  get free(): number {
    return this.seats - this.bookedCount;
  }

  get available(): Student[] {
    return this.data.students.filter((s) => !this.data.isBooked(this.selectedKey, s.id));
  }

  addStudent() {
    if (this.pickedStudentId == null) return;
    if (this.data.addBooking(this.selectedKey, this.pickedStudentId)) {
      this.pickedStudentId = null;
      this.build();
    }
  }

  removeBooking(dutyId: number) {
    this.data.removeBooking(dutyId);
    this.build();
  }

  trackByKey(_: number, c: DayCell) {
    return c.key;
  }
}
