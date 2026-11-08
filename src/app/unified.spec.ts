import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, adminGuard, officerGuard } from './auth.service';
import { DataService } from './data.service';
import { LibraryDataService, toKey } from './admin/services/library-data.service';

describe('Unified roles and library workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  it('isolates admin and officer routes and clears access on logout', () => {
    const auth = TestBed.inject(AuthService);
    const check = (guard: typeof adminGuard) => TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    expect(check(adminGuard)).not.toBe(true);
    auth.signInDemo('student', 'student');
    expect(check(adminGuard)).not.toBe(true);
    expect(check(officerGuard)).not.toBe(true);
    auth.signInDemo('officer', 'officer');
    expect(check(officerGuard)).toBe(true);
    expect(check(adminGuard)).not.toBe(true);
    expect(auth.loginAdmin('admin', 'wrong')).toBe(false);
    expect(auth.loginAdmin('admin', 'admin123')).toBe(true);
    expect(check(adminGuard)).toBe(true);
    expect(check(officerGuard)).not.toBe(true);
    auth.signOut();
    expect(check(adminGuard)).not.toBe(true);
  });
  it('shares bookings, capacity, edits, attendance, hours and deletion across roles', () => {
    const ds = TestBed.inject(DataService);
    const admin = TestBed.inject(LibraryDataService);
    const day = new Date(); day.setDate(day.getDate() + 7); day.setHours(8, 0, 0, 0);
    while (day.getDay() === 0 || day.getDay() === 6) day.setDate(day.getDate() + 1);
    expect(ds.reserve(day, 'Merge Student', 'BSIT')).toBe(true);
    expect(ds.reserve(day, 'Merge Student', 'BSIT')).toBe(false);
    const student = admin.students.find(s => s.name === 'Merge Student')!;
    const duty = admin.dutiesOn(toKey(day))[0].duty;
    expect(admin.hoursFor(student.id)).toBe(0);
    admin.updateStudent(student.id, 'Updated Student', 'BSIT 2');
    expect(ds.recordsOn(day)[0].name).toBe('Updated Student');
    for (let i = 0; i < 4; i++) expect(ds.reserve(day, 'Other '+i, 'BSIT')).toBe(true);
    expect(ds.reserve(day, 'Overflow', 'BSIT')).toBe(false);
    expect(ds.recordTime(duty.id, 'out', 'photo', day)).toBe(false);
    expect(ds.recordTime(duty.id, 'in', '', day)).toBe(false);
    expect(ds.recordTime(duty.id, 'in', 'in-photo', day)).toBe(true);
    expect(ds.recordTime(duty.id, 'in', 'again', day)).toBe(false);
    day.setHours(17);
    expect(ds.recordTime(duty.id, 'out', 'out-photo', day)).toBe(true);
    expect(duty.hours).toBe(9);
    expect(ds.recordsOn(day)[0].outPhoto).toBe('out-photo');
    // Use the attendance day as today when inspecting completed service totals.
    admin.today = () => new Date(day.getFullYear(), day.getMonth(), day.getDate());
    expect(admin.hoursFor(student.id)).toBe(9);
    const restored = new LibraryDataService();
    expect(restored.duties.find(d => d.id === duty.id)?.outPhoto).toBe('out-photo');
    admin.removeBooking(duty.id);
    expect(ds.bookedOn(day)).toBe(4);
    expect(ds.reserve(day, 'Updated Student', 'BSIT 2')).toBe(true);
    admin.removeStudent(student.id);
    expect(ds.recordsOn(day).some(r => r.name === 'Updated Student')).toBe(false);
  });
  it('rejects past dates, weekends and missing students from both booking entry points', () => {
    const ds = TestBed.inject(DataService);
    const admin = TestBed.inject(LibraryDataService);
    expect(ds.reserve(new Date(2020,0,1), 'Past', 'BSIT')).toBe(false);
    expect(admin.addBooking('2020-01-01', admin.students[0].id)).toBe(false);
    expect(admin.addBooking('2099-02-31', admin.students[0].id)).toBe(false);
    expect(admin.addBooking('2099-01-05', -1)).toBe(false);
    const weekend = new Date(2099,0,1);
    while (weekend.getDay() !== 0) weekend.setDate(weekend.getDate()+1);
    expect(ds.reserve(weekend, 'Weekend', 'BSIT')).toBe(false);
  });
});
