# KOMS – DOJO MASTER ATTENDANCE TRACKING SYSTEM

A complete, production-grade Attendance Tracking System engineered for the KOMS Dojo Master Panel.

The system allows a Dojo Master to configure weekly training days and timings once. Based on this configuration, KOMS automatically generates and maintains class sessions every week across months and years. Masters record student attendance for every scheduled class and access real-time daily, monthly, and historical attendance records with full audit trail capabilities.

---

## 🥋 Core Principles & Design

1. **Set Once, Maintained Automatically:**
   The Master configures their schedule (e.g. Saturday & Sunday from 6:30 PM to 8:30 PM). KOMS automatically generates and maintains the weekly recurring class sessions indefinitely without manual monthly generation.

2. **Database Integrity & Idempotency:**
   - Single-session-per-day schedule constraint: `UNIQUE (weekly_schedule_id, class_date)`
   - Single attendance record constraint: `UNIQUE (class_session_id, student_id)`
   - Idempotent upsert logic protects against double-saving, retries, and race conditions.

3. **Schedule-Based Monthly Percentage Calculation:**
   $$\text{Monthly Attendance \%} = \frac{\text{Classes Attended in Month}}{\text{Total Scheduled Classes in Month}} \times 100$$
   - Calculated directly against the total scheduled classes in that month (e.g. 4 attended out of 8 scheduled = 50.0%, 6 attended out of 8 scheduled = 75.0%).
   - Displayed with transparent fractions (e.g. `6 / 8 Classes`) and progress bars.

4. **Previous Students & Historical Record Entry:**
   - Add previous / former students with custom past joining dates and inactive status.
   - Maintain chronological attendance history month-wise and date-of-the-month.
   - Enter past attendance records for any previous date or month directly via the interactive Monthly Register Sheet.

3. **Master Isolation (Multi-Tenant Security):**
   - Each Master only accesses their own students, schedules, sessions, and attendance records.
   - Cross-tenant requests are denied with `403 Forbidden` at the database and API levels.
   - Includes live Master Switcher in the UI header to demonstrate data isolation between Sensei Hiroshi Tanaka and Sensei Kenji Sato.

4. **Section 11 Schedule Modification Rules:**
   - Setting a new schedule requires an **Effective Date**.
   - Historical sessions, completed attendance records, and audit logs are strictly preserved.
   - Future uncompleted sessions are cleanly replaced from the effective date onward.

5. **Section 10 Finalized Attendance Audit Trail:**
   - Modifying a saved attendance record requires an explicit correction reason.
   - Preserves original status, new status, modification timestamp, and Master ID in `attendance_audit_logs`.

6. **Section 9 Formula-Verified Percentage:**
   $$\text{Attendance Percentage} = \frac{\text{Present}}{\text{Present} + \text{Absent} + \text{Leave}} \times 100$$
   - Configurable policy options: Standard, Excused (including leave in numerator), and Deducted (deducting leave from denominator).
   - Cancelled and future classes are excluded from calculations.

---

## 🏛️ Database Architecture

Implemented with SQLite (via Node.js native `DatabaseSync` in WAL mode with active foreign key constraints).

```
masters
├── id (PK)
├── name
├── email (UNIQUE)
├── password_hash
└── dojo_name

students
├── id (PK)
├── master_id (FK -> masters.id)
├── student_name
├── student_code (UNIQUE per master)
├── joining_date
├── status ('active', 'inactive')
└── rank

weekly_schedules
├── id (PK)
├── master_id (FK -> masters.id)
├── effective_from
├── effective_until
├── start_time
├── end_time
└── is_active

schedule_days
├── id (PK)
├── weekly_schedule_id (FK -> weekly_schedules.id)
└── weekday (0 = Sunday ... 6 = Saturday)

class_sessions
├── id (PK)
├── master_id (FK -> masters.id)
├── weekly_schedule_id (FK -> weekly_schedules.id)
├── class_date (YYYY-MM-DD)
├── start_time
├── end_time
└── status ('scheduled', 'completed', 'cancelled')
[CONSTRAINT: UNIQUE (weekly_schedule_id, class_date)]

attendance_records
├── id (PK)
├── master_id (FK -> masters.id)
├── class_session_id (FK -> class_sessions.id)
├── student_id (FK -> students.id)
├── attendance_status ('PRESENT', 'ABSENT', 'LEAVE', 'NOT MARKED')
├── marked_at
└── updated_at
[CONSTRAINT: UNIQUE (class_session_id, student_id)]

attendance_audit_logs
├── id (PK)
├── attendance_record_id (FK -> attendance_records.id)
├── old_status
├── new_status
├── reason
├── modified_by (FK -> masters.id)
└── modified_at
```

---

## 📦 Main Attendance Modules

1. **Attendance Dashboard:**
   - 8 live metrics calculated from the database: Total Active Students, Today's Scheduled Classes, Completed Classes This Month, Pending Attendance Sessions, Total Present Records This Month, Total Absent Records This Month, Total Leave Records This Month, Overall Attendance Percentage.
   - Today's Classes panel with quick action to mark attendance.
   - Upcoming Classes schedule.
   - Recent Attendance Activity stream.

2. **Weekly Class Schedule:**
   - Day-by-day table (Monday to Sunday) indicating active class days and timings.
   - Active schedule information and schedule change history.

3. **Daily Attendance Tracking:**
   - Available class session dropdown selector.
   - Active student roster with individual 4-state buttons: `PRESENT`, `ABSENT`, `LEAVE`, `NOT MARKED`.
   - Real-time counters: Present, Absent, Leave, Unmarked.
   - Bulk actions: "Mark All Present" and "Reset".
   - Search student by name or code.
   - Finalized attendance edit modal prompting for required reason and logging to audit trail.

4. **Monthly Attendance Calendar:**
   - Calendar grid highlighting scheduled training days (Saturday & Sunday).
   - Badges for Scheduled, Completed, Pending, and Cancelled classes.
   - Direct click-to-open session dialog with session cancellation/restoration actions.

5. **Student Attendance History:**
   - Student roster selector with Active/Inactive filters (preserves history even for inactive students).
   - Chronological date-wise attendance table.
   - Summary statistics and attendance percentages with formula policy switcher.

6. **Attendance Reports:**
   - Monthly Attendance Summary report with student breakdown and standing badges.
   - Export CSV capability (`/api/reports/export-csv`).
   - Printable formatted view.

7. **Schedule Settings:**
   - Interactive weekday picker pills (Mon through Sun).
   - Time pickers for start and end timings.
   - Effective date selector and confirmation modal.
   - One-click presets: Saturday & Sunday (Initial), Friday/Saturday/Sunday (Section 11), and Tuesday/Thursday.

---

## 🚀 Getting Started

### 1. Run Automated Test Suite (All 14 Scenarios)
```bash
npm test
```

### 2. Start the Production Server
```bash
npm start
```
The server will start at `http://localhost:5000` serving both the REST API and the dark-themed Dojo Master UI.

### 3. Development Mode
To run Vite dev server with proxy:
```bash
npm run dev:client
```
or to build the client:
```bash
npm run build
```

---

## 🧪 Verified Test Scenarios (Section 16)

The test suite in `tests/attendance.test.js` tests all 14 scenarios:

- **Scenario 1:** Master configures Saturday and Sunday classes.
- **Scenario 2:** System generates all weekly sessions for the month (9 sessions in Nov 2026).
- **Scenario 3:** The same schedule automatically continues into following months (8 sessions in Dec 2026).
- **Scenario 4:** Master marks attendance on Saturday.
- **Scenario 5:** Master marks attendance on Sunday.
- **Scenario 6:** Master saves attendance twice with modifications.
- **Scenario 7:** Student attendance records are updated idempotently without duplication.
- **Scenario 8:** Master updates schedule from Sat/Sun to Fri/Sat/Sun effective from Nov 20.
- **Scenario 9:** Past sessions and attendance prior to Nov 20 remain strictly unchanged.
- **Scenario 10:** Student-wise history displays accurate results.
- **Scenario 11:** Monthly attendance percentage follows the mathematical formula.
- **Scenario 12:** Cancelled classes are excluded from student absence calculations.
- **Scenario 13:** Another Master (Master 2) cannot access Master 1's students or records (403 Forbidden).
- **Scenario 14:** Retrying attendance requests never creates duplicate rows.

