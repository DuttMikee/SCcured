import { Injectable, computed, inject } from '@angular/core';
import { LibraryDataService, toKey } from './admin/services/library-data.service';
export interface Capstone { id: number; program: string; year: number; title: string; blurb: string; }
export interface Cell { day: number; date: Date; off: boolean; past: boolean; booked: number; }
export interface DutyRecord { id: number; date: string; name: string; section: string; in: string | null; out: string | null; inPhoto?: string; outPhoto?: string; }
@Injectable({ providedIn: 'root' })
export class DataService {
  readonly store = inject(LibraryDataService);
  readonly seats = 5;
  readonly slotLabel = '08:00–17:00';
  capstones: Capstone[] = [
    { id: 1, program: 'BSIT', year: 2026, title: 'Library Seat Reservation System', blurb: 'A sample web-based approach to scheduling shared library spaces.' },
    { id: 2, program: 'BSIT', year: 2026, title: 'Community Resource Mapping Portal', blurb: 'A sample searchable directory for discovering local resources.' },
    { id: 3, program: 'BSIT', year: 2026, title: 'Learning Resource Inventory', blurb: 'A sample tool for tracking the availability of learning materials.' },
    { id: 4, program: 'BSIT', year: 2025, title: 'Student Project Archive', blurb: 'A sample digital archive that makes academic work easier to find.' },
    { id: 5, program: 'BSIT', year: 2025, title: 'Accessible Campus Wayfinding', blurb: 'A sample interface exploring clearer campus navigation.' },
    { id: 6, program: 'BSIT', year: 2025, title: 'Peer Study Scheduling Tool', blurb: 'A sample scheduling concept for collaborative student study.' },
  ];


  readonly records = computed<DutyRecord[]>(() => {
    this.store.revision();
    return this.store.duties.flatMap(d => {
      const s = this.store.studentById(d.studentId);
      return s ? [{ id: d.id, date: d.date, name: s.name, section: s.section, in: d.in ?? null, out: d.out ?? null, inPhoto: d.inPhoto, outPhoto: d.outPhoto }] : [];
    });
  });
  key(d: Date) { return toKey(d); }
  recordsOn(d: Date) { return this.records().filter(r => r.date === this.key(d)); }
  bookedOn(d: Date) { this.store.revision(); return this.store.seatsBooked(this.key(d)); }
  status(r: DutyRecord) { return r.out ? 'Done' : r.in ? 'On duty' : 'Absent'; }
  recordTime(id: number, kind: 'in' | 'out', photo: string, now = new Date()): boolean {
    const d = this.store.duties.find(d => d.id === id && d.date === this.key(now));
    if (!d || !photo || (kind === 'in' ? !!d.in : !d.in || !!d.out)) return false;
    const time = now.toTimeString().slice(0, 5);
    if (kind === 'out' && time < d.in!) return false;
    d[kind] = time;
    d[kind === 'in' ? 'inPhoto' : 'outPhoto'] = photo;
    if (kind === 'out') {
      const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
      d.hours = Math.round((minutes(time) - minutes(d.in!)) / 60 * 100) / 100;
      d.photo = photo;
    }
    this.store.save(); return true;
  }
  /** Monday-first grid; nulls are leading blanks */
  monthCells(year: number, month: number): (Cell | null)[] {
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cells: (Cell | null)[] = Array((first.getDay() + 6) % 7).fill(null);
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay();
      cells.push({ day, date, off: dow === 0 || dow === 6, past: date < today, booked: this.bookedOn(date) });
    }
    return cells;
  }


  reserve(date: Date, name = '', section = ''): boolean {
    if (!name.trim() || !section.trim() || !Number.isFinite(date.getTime()) || this.store.isPast(date) || this.store.isWeekend(date) || this.bookedOn(date) >= this.seats) return false;
    let student = this.store.students.find(s => s.name.toLowerCase() === name.trim().toLowerCase() && s.section.toLowerCase() === section.trim().toLowerCase());
    if (!student) { this.store.addStudent(name, section); student = this.store.students[this.store.students.length - 1]; }
    return this.store.addBooking(this.key(date), student.id);
  }
}
