-- =============================================================================
-- KOMS: Karate Organization Management System — Supabase Seed Data
-- =============================================================================

-- 1. Insert Masters
-- Password is 'master123' for all demo accounts
INSERT INTO public.masters (name, email, password_hash, dojo_name, role)
VALUES 
    ('Grand Master / Chief Sensei', 'grandmaster@koms.dojo', '$2b$10$G1kmwfF5KEWqyNFA6DnMjOD6OIIbkmI11ajxx9unUiwZAJwhyoP9O', 'KOMS Headquarters', 'grand_master'),
    ('Sensei Rubeshwaren', 'rubeshwaren@koms.dojo', '$2b$10$G1kmwfF5KEWqyNFA6DnMjOD6OIIbkmI11ajxx9unUiwZAJwhyoP9O', 'Ranga Nagar', 'master'),
    ('Sensei Janathanan', 'janathanan@koms.dojo', '$2b$10$G1kmwfF5KEWqyNFA6DnMjOD6OIIbkmI11ajxx9unUiwZAJwhyoP9O', 'Ranga Nagar', 'master')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Master Profiles
INSERT INTO public.master_profiles (master_id, phone, bio, address, dojo_info, notification_email, notification_sms, fee_reminder_day, default_monthly_fee)
SELECT id, '+91 98401 23456', '5th Dan Black Belt • Chief Instructor at Ranga Nagar Dojo', 'Mudichur Road, Chennai, Tamil Nadu', 'MASS DRAGON DOJO — Ranga Nagar Branch', 1, 1, 5, 1000
FROM public.masters WHERE email = 'rubeshwaren@koms.dojo'
ON CONFLICT (master_id) DO NOTHING;

-- 3. Insert Students for Sensei Rubeshwaren (master_id lookup)
WITH m AS (SELECT id FROM public.masters WHERE email = 'rubeshwaren@koms.dojo' LIMIT 1)
INSERT INTO public.students (master_id, student_name, student_code, joining_date, status, rank, dob, phone, email, guardian_name, guardian_phone, address, monthly_fee, profile_image)
SELECT 
    m.id, s.name, s.code, s.join_date::date, s.status, s.rank, s.dob::date, s.phone, s.email, s.gname, s.gphone, s.addr, s.fee, s.img
FROM m, (VALUES
    ('Kenjiro Takahashi', 'KOMS-STU-001', '2026-01-10', 'active', 'Black Belt (1st Dan)', '2008-05-14', '+91 98401 11001', 'kenjiro@koms.dojo', 'Kenichi Takahashi', '+91 98401 99001', '12 Sakura Street, Chennai', 1000, '/assets/students/KOMS-2026-001.jpeg'),
    ('Aoi Nakamura', 'KOMS-STU-002', '2026-02-15', 'active', 'Brown Belt (1st Kyu)', '2009-08-22', '+91 98401 11002', 'aoi@koms.dojo', 'Hiroshi Nakamura', '+91 98401 99002', '45 Lotus Road, Chennai', 1000, '/assets/students/KOMS-2026-002.jpeg'),
    ('Daiki Sato', 'KOMS-STU-003', '2026-03-01', 'active', 'Brown Belt (2nd Kyu)', '2010-01-11', '+91 98401 11003', 'daiki@koms.dojo', 'Takeshi Sato', '+91 98401 99003', '77 Bamboo Ave, Chennai', 1000, '/assets/students/KOMS-2026-003.jpeg'),
    ('Haruto Ito', 'KOMS-STU-004', '2026-03-20', 'active', 'Green Belt (3rd Kyu)', '2011-04-30', '+91 98401 11004', 'haruto@koms.dojo', 'Yoshi Ito', '+91 98401 99004', '89 Palm Grove, Chennai', 1000, '/assets/students/KOMS-2026-004.jpeg'),
    ('Yuna Watanabe', 'KOMS-STU-005', '2026-04-05', 'active', 'Green Belt (4th Kyu)', '2012-07-19', '+91 98401 11005', 'yuna@koms.dojo', 'Kenji Watanabe', '+91 98401 99005', '101 Pine St, Chennai', 1000, '/assets/students/KOMS-2026-005.jpeg'),
    ('Ren Kobayashi', 'KOMS-STU-006', '2026-05-12', 'active', 'Yellow Belt (5th Kyu)', '2011-12-03', '+91 98401 11006', 'ren@koms.dojo', 'Shin Kobayashi', '+91 98401 99006', '14 Cedar Lane, Chennai', 1000, '/assets/students/KOMS-2026-006.jpeg'),
    ('Sakura Yamamoto', 'KOMS-STU-007', '2026-06-01', 'active', 'Yellow Belt (6th Kyu)', '2013-03-15', '+91 98401 11007', 'sakura@koms.dojo', 'Koji Yamamoto', '+91 98401 99007', '23 Elm Court, Chennai', 1000, '/assets/students/KOMS-2026-007.jpeg'),
    ('Sota Saito', 'KOMS-STU-008', '2026-06-25', 'active', 'Yellow Belt (6th Kyu)', '2012-09-08', '+91 98401 11008', 'sota@koms.dojo', 'Taro Saito', '+91 98401 99008', '56 Birch Way, Chennai', 1000, '/assets/students/KOMS-2026-008.jpeg'),
    ('Riko Kato', 'KOMS-STU-009', '2026-07-10', 'active', 'White Belt (Beginner)', '2014-06-18', '+91 98401 11009', 'riko@koms.dojo', 'Makoto Kato', '+91 98401 99009', '78 Maple Dr, Chennai', 1000, '/assets/students/KOMS-2026-009.jpeg'),
    ('Kaito Yoshida', 'KOMS-STU-010', '2026-08-01', 'active', 'White Belt (Beginner)', '2013-11-25', '+91 98401 11010', 'kaito@koms.dojo', 'Nobu Yoshida', '+91 98401 99010', '90 Oak Blvd, Chennai', 1000, '/assets/students/KOMS-2026-010.jpeg'),
    ('Mei Yamada', 'KOMS-STU-011', '2026-08-15', 'active', 'White Belt (Beginner)', '2014-02-14', '+91 98401 11011', 'mei@koms.dojo', 'Kazuo Yamada', '+91 98401 99011', '102 Willow St, Chennai', 1000, '/assets/students/KOMS-2026-011.jpeg'),
    ('Hayato Sasaki', 'KOMS-STU-012', '2026-09-01', 'active', 'White Belt (Beginner)', '2013-05-09', '+91 98401 11012', 'hayato@koms.dojo', 'Ryota Sasaki', '+91 98401 99012', '114 Ash Rd, Chennai', 1000, '/assets/students/KOMS-2026-012.jpeg'),
    ('Hinata Yamaguchi', 'KOMS-STU-013', '2026-09-20', 'active', 'White Belt (Beginner)', '2014-09-30', '+91 98401 11013', 'hinata@koms.dojo', 'Daichi Yamaguchi', '+91 98401 99013', '126 Cherry Ln, Chennai', 1000, '/assets/students/KOMS-2026-013.jpeg'),
    ('Asahi Matsumoto', 'KOMS-STU-014', '2026-10-05', 'active', 'White Belt (Beginner)', '2015-01-17', '+91 98401 11014', 'asahi@koms.dojo', 'Kenta Matsumoto', '+91 98401 99014', '138 Walnut St, Chennai', 1000, '/assets/students/KOMS-2026-014.jpeg'),
    ('Koki Inoue', 'KOMS-STU-015', '2026-02-01', 'inactive', 'Yellow Belt (5th Kyu)', '2011-08-12', '+91 98401 11015', 'koki@koms.dojo', 'Tatsuo Inoue', '+91 98401 99015', '150 Chestnut Ave, Chennai', 1000, '/assets/students/KOMS-2026-015.jpeg'),
    ('Arjun R', 'KOMS-STU-016', '2026-01-05', 'active', 'Green Belt (3rd Kyu)', '2010-01-12', '+91 98765 43210', 'arjun.r@koms.dojo', 'Ramesh Kumar', '+91 98765 43219', 'Flat 4B, Shanthi Apts, Mudichur Road, Chennai', 1200, '/assets/students/KOMS-2026-016.png')
) AS s(name, code, join_date, status, rank, dob, phone, email, gname, gphone, addr, fee, img)
ON CONFLICT (master_id, student_code) DO NOTHING;

-- 4. Insert Weekly Schedule (Saturday & Sunday, 18:30 - 20:30)
WITH m AS (SELECT id FROM public.masters WHERE email = 'rubeshwaren@koms.dojo' LIMIT 1)
INSERT INTO public.weekly_schedules (master_id, effective_from, start_time, end_time, is_active)
SELECT m.id, '2026-11-01'::date, '18:30', '20:30', 1
FROM m
WHERE NOT EXISTS (SELECT 1 FROM public.weekly_schedules WHERE master_id = m.id);

WITH ws AS (
    SELECT id FROM public.weekly_schedules 
    WHERE master_id = (SELECT id FROM public.masters WHERE email = 'rubeshwaren@koms.dojo')
    LIMIT 1
)
INSERT INTO public.schedule_days (weekly_schedule_id, weekday)
SELECT ws.id, d.w
FROM ws, (VALUES (0), (6)) AS d(w)
ON CONFLICT (weekly_schedule_id, weekday) DO NOTHING;

-- 5. Insert Sample Class Sessions (Nov 2026)
WITH m AS (SELECT id FROM public.masters WHERE email = 'rubeshwaren@koms.dojo' LIMIT 1),
     ws AS (SELECT id FROM public.weekly_schedules WHERE master_id = (SELECT id FROM m) LIMIT 1)
INSERT INTO public.class_sessions (master_id, weekly_schedule_id, class_date, start_time, end_time, status, session_type, title, notes)
SELECT 
    m.id, ws.id, cs.cdate::date, '18:30', '20:30', cs.status, 'Regular Training', cs.title, cs.notes
FROM m, ws, (VALUES
    ('2026-11-01', 'completed', 'Dojo Session #1 - Basics & Kihon', 'Focus on stance transitions and front kicks'),
    ('2026-11-07', 'completed', 'Dojo Session #2 - Kata Focus', 'Heian Shodan & Heian Nidan review'),
    ('2026-11-08', 'completed', 'Dojo Session #3 - Kumite Tactics', 'Distance control and counter strikes'),
    ('2026-11-14', 'scheduled', 'Dojo Session #4 - Belt Preparation', 'Pre-evaluation drills for upcoming grading'),
    ('2026-11-15', 'scheduled', 'Dojo Session #5 - Advanced Kata', 'Bassai Dai and Empi fundamentals')
) AS cs(cdate, status, title, notes)
ON CONFLICT (weekly_schedule_id, class_date) DO NOTHING;

-- 6. Insert Announcements
WITH m AS (SELECT id FROM public.masters WHERE email = 'rubeshwaren@koms.dojo' LIMIT 1)
INSERT INTO public.announcements (master_id, title, message, category, priority, target_audience, status)
SELECT m.id, a.title, a.msg, a.cat, a.pri, 'all', 'PUBLISHED'
FROM m, (VALUES
    ('Annual Belt Grading Ceremony 2026', 'The All-Dojo Winter Belt Grading evaluation will be held on December 14th. All eligible yellow belts and above must submit their registration forms before Dec 1st.', 'Grading', 'High'),
    ('Monthly Fee Notice — November 2026', 'Dear parents and students, kindly settle the November 2026 training fees by November 10th. UPI and Cash accepted at the dojo desk.', 'Fees', 'Medium'),
    ('Special Weekend Kumite Seminar', 'International guest instructor Grand Master Kanazawa will conduct a 2-day kumite clinic at the central dojo on Nov 28-29.', 'Seminar', 'Urgent')
) AS a(title, msg, cat, pri);

-- 7. Insert Sample Fee Payments for Nov 2026
WITH m AS (SELECT id FROM public.masters WHERE email = 'rubeshwaren@koms.dojo' LIMIT 1)
INSERT INTO public.fee_payments (master_id, student_id, receipt_number, billing_month, amount_due, amount_paid, payment_method, transaction_ref, payment_date, remarks, status)
SELECT 
    m.id, s.id, f.receipt, '2026-11', s.monthly_fee, f.paid, f.method, f.txref, f.pdate::date, f.rem, f.stat
FROM m
JOIN public.students s ON s.master_id = m.id
JOIN (VALUES
    ('KOMS-STU-001', 'RCP-202611-0001', 1000, 'UPI', 'UPI-9840182819', '2026-11-02', 'Annual advance discount applied', 'PAID'),
    ('KOMS-STU-002', 'RCP-202611-0002', 1000, 'CASH', NULL, '2026-11-03', 'Handed over at dojo', 'PAID'),
    ('KOMS-STU-003', 'RCP-202611-0003', 500, 'UPI', 'UPI-4491028312', '2026-11-04', 'First installment', 'PARTIAL'),
    ('KOMS-STU-004', 'RCP-202611-0004', 1000, 'BANK_TRANSFER', 'NEFT-88391029', '2026-11-05', 'Paid via NetBanking', 'PAID'),
    ('KOMS-STU-016', 'RCP-202611-0005', 1200, 'UPI', 'UPI-2991048123', '2026-11-01', 'Full fee settled', 'PAID')
) AS f(scode, receipt, paid, method, txref, pdate, rem, stat) ON s.student_code = f.scode
ON CONFLICT (receipt_number) DO NOTHING;

