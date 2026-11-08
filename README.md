# SCcured — unified Ionic system

One Ionic application for students, administrators, and officers in charge. The source projects are unchanged; this directory is the merged application.

## Run

Open a terminal in this directory and run:

```powershell
npm ci
npm start
```

Open http://localhost:4200. Dependencies are already present in this delivered working copy, so `npm start` can be used directly here.

```powershell
npm run build
npm test -- --watch=false
```

The production web application is generated in `www`. For an Android build, run `npm run build`, `npx cap sync android`, then `npx cap open android` with Android Studio installed. Native APK compilation has not been verified.

## Roles

| Role | Demo login | Screens |
| --- | --- | --- |
| Student | Select Student and enter any ID | Home, capstone catalog, duty reservation |
| Admin | Select Admin; username `admin`, password `admin123` | Manage students, manage schedule, service records and PDF export |
| Officer in Charge | Select Officer in Charge and enter any staff ID | Dashboard, duty schedule, photo check-in/check-out |

Use the menu to switch roles or sign out. Reservations retain the original public name-and-section workflow. Admin and officer routes require the corresponding demo session. Reloading the application clears the login session; saved library data remains.

## Shared data and behavior

- All roles use the same `LibraryDataService`. The student/officer `DataService` is a facade over that store.
- Student reservations create or reuse a student by matching name and section, and appear in the admin and officer schedules.
- Admin edits and cancellations update the same records viewed by officers. Deleting a student also removes that student's bookings.
- Capacity is five students per weekday, with no duplicate student/date reservations and no past or weekend bookings.
- Officer attendance requires a photo for each event. Check-out requires check-in. Completed hours use elapsed check-in/check-out time, with no automatic lunch deduction.
- Admin records and PDFs count only checked-out sessions. Existing sample reservations do not count as completed work merely because their dates have passed.
- The calendar uses the current local date instead of the original admin mock date.

## Prototype boundary

Authentication remains a local demonstration. Role guards control navigation, not server security. Data is stored in this browser's localStorage under `plv-library-data-v1`, with an in-memory fallback when storage is unavailable. It is shared when switching roles within this app, not synchronized across devices, origins, or already-open tabs. Existing admin data on the same origin can be read; data from another origin must be migrated separately. The original student app's memory-only records cannot be recovered after its session ends.

A real deployment needs backend authentication, server-side role authorization, a shared database, and protected photo storage. No backend or database was present in the supplied Ionic projects.

## Validation

Production Angular build and automated tests cover role isolation, logout, shared booking/attendance data, capacity, duplicate rejection, date validation, persistence, student edits/deletions, and completed hours. Build warnings from inherited browser targets and jsPDF's CommonJS dependencies remain. Browser visual testing was attempted but the local headless browser could not launch in this environment.
