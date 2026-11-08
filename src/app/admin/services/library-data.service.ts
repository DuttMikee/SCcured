import { Injectable, signal } from '@angular/core';

export interface Student {
  id: number;
  name: string;
  section: string;
}

/** One booked duty day. Completion requires officer check-in and check-out. */
export interface Duty {
  id: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  hours: number;
  in?: string | null; out?: string | null; inPhoto?: string; outPhoto?: string;
  photo?: string; // data URL
}

export const SEATS_PER_SLOT = 5;
export const GOAL_HOURS = 40;
export const SLOT_LABEL = '08:00–17:00';
export const SLOT_RANGE = '08:00 – 5:00 PM';
export const DEFAULT_SLOT_HOURS = 8;

/**
 * The mockups are set in October 2026 with the 21st as "today".
 * Set to false to use the real current date.
 */
const USE_DEMO_DATE = false;
const STORAGE_KEY = 'plv-library-data-v1';

export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

@Injectable({ providedIn: 'root' })
export class LibraryDataService {
  readonly revision = signal(0);
  students: Student[] = [];
  duties: Duty[] = [];
  private nextStudentId = 1;
  private nextDutyId = 1;

  constructor() {
    if (!this.load()) {
      this.seed();
      this.save();
    }
  }

  // ---------- dates ----------
  today(): Date {
    if (USE_DEMO_DATE) return new Date(2026, 9, 21);
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  isWeekend(d: Date): boolean {
    return d.getDay() === 0 || d.getDay() === 6;
  }

  isPast(d: Date): boolean {
    return d.getTime() < this.today().getTime();
  }

  // ---------- students ----------
  addStudent(name: string, section: string) {
    this.students.push({ id: this.nextStudentId++, name: name.trim(), section: section.trim() });
    this.save();
  }

  updateStudent(id: number, name: string, section: string) {
    const s = this.students.find((x) => x.id === id);
    if (s) {
      s.name = name.trim();
      s.section = section.trim();
      this.save();
    }
  }

  removeStudent(id: number) {
    this.students = this.students.filter((s) => s.id !== id);
    this.duties = this.duties.filter((d) => d.studentId !== id);
    this.save();
  }

  studentById(id: number): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  // ---------- schedule ----------
  dutiesOn(key: string): { duty: Duty; student: Student }[] {
    return this.duties
      .filter((d) => d.date === key)
      .map((duty) => ({ duty, student: this.studentById(duty.studentId)! }))
      .filter((x) => !!x.student);
  }

  seatsBooked(key: string): number {
    return this.dutiesOn(key).length;
  }

  isBooked(key: string, studentId: number): boolean {
    return this.duties.some((d) => d.date === key && d.studentId === studentId);
  }

  addBooking(key: string, studentId: number): boolean {
    const date = fromKey(key);
    if (!Number.isFinite(date.getTime()) || toKey(date) !== key || this.isPast(date) || this.isWeekend(date) || !this.studentById(studentId)) return false;
    if (this.seatsBooked(key) >= SEATS_PER_SLOT) return false;
    if (this.isBooked(key, studentId)) return false;
    this.duties.push({
      id: this.nextDutyId++,
      studentId,
      date: key,
      hours: DEFAULT_SLOT_HOURS,
    });
    this.save();
    return true;
  }

  removeBooking(dutyId: number) {
    this.duties = this.duties.filter((d) => d.id !== dutyId);
    this.save();
  }

  // ---------- records ----------
  completedDuties(studentId: number): Duty[] {
    const todayKey = toKey(this.today());
    return this.duties
      .filter((d) => d.studentId === studentId && d.date <= todayKey && !!d.in && !!d.out)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  hoursFor(studentId: number): number {
    return this.completedDuties(studentId).reduce((sum, d) => sum + d.hours, 0);
  }

  setPhoto(dutyId: number, dataUrl: string) {
    const d = this.duties.find((x) => x.id === dutyId);
    if (d) {
      d.photo = dataUrl;
      this.save();
    }
  }

  // ---------- persistence ----------
  save() {
    this.revision.update(n => n + 1);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          students: this.students,
          duties: this.duties,
          nextStudentId: this.nextStudentId,
          nextDutyId: this.nextDutyId,
        })
      );
    } catch {
      // storage full or unavailable: keep working in memory
    }
  }

  private load(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const p = JSON.parse(raw);
      this.students = p.students;
      this.duties = p.duties;
      this.nextStudentId = p.nextStudentId;
      this.nextDutyId = p.nextDutyId;
      return true;
    } catch {
      return false;
    }
  }

  private seed() {
    const people: [string, string][] = [
      ['NJ Rodrigo', 'BSIT 2-1'],
      ['Peter Amisola', 'BSIT 2-1'],
      ['Mhika Cahambing', 'BSIT 2-1'],
      ['Francesca Guial', 'BSIT 2-5'],
      ['Kurt Delaminez', 'BSIT 4-4'],
      ['Hannah Manlanat', 'BSIT 3-1'],
      ['Augustine Simpao', 'BSIT 3-9'],
      ['DJ Montano', 'BSIT 2-9'],
      ['John Michael Romanillos', 'BSIT 2-9'],
      ['Mark Reyes', 'BSIT 2-9'],
      ['Ana Dizon', 'BSIT 2-9'],
    ];
    people.forEach(([n, s]) => this.addStudentSilently(n, s));

    const id = (name: string) => this.students.find((s) => s.name === name)!.id;
    const duty = (name: string, date: string, hours = 8) =>
      this.duties.push({ id: this.nextDutyId++, studentId: id(name), date, hours });

    // completed (on or before the demo "today", 21 Oct 2026)
    duty('NJ Rodrigo', '2026-10-12');
    duty('NJ Rodrigo', '2026-10-14');
    duty('Peter Amisola', '2026-10-19');
    duty('Mhika Cahambing', '2026-10-19');
    duty('Francesca Guial', '2026-10-14');
    duty('Hannah Manlanat', '2026-10-16');
    duty('Augustine Simpao', '2026-10-16', 9);
    duty('Augustine Simpao', '2026-10-21', 9);

    // 21 Oct is fully booked (5/5)
    duty('DJ Montano', '2026-10-21');
    duty('John Michael Romanillos', '2026-10-21');
    duty('Mark Reyes', '2026-10-21');
    duty('Ana Dizon', '2026-10-21');

    // upcoming
    duty('Peter Amisola', '2026-10-22');
    duty('Mhika Cahambing', '2026-10-22');
    duty('Francesca Guial', '2026-10-23');
    duty('Hannah Manlanat', '2026-10-23');
    duty('NJ Rodrigo', '2026-10-26');
    duty('Kurt Delaminez', '2026-10-26');
    duty('Ana Dizon', '2026-10-29');
    duty('Mark Reyes', '2026-10-30');
  }

  private addStudentSilently(name: string, section: string) {
    this.students.push({ id: this.nextStudentId++, name, section });
  }
}
