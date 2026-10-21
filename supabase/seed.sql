insert into public.departments (code, name)
values
  ('CSE', 'Computer Science and Engineering'),
  ('ME', 'Mechanical Engineering'),
  ('EE', 'Electrical Engineering')
on conflict (code) do nothing;

insert into public.academic_programs (department_id, code, name, level)
select d.id, seed.code, seed.name, seed.level
from (values
  ('CSE', 'BTECH-CSE', 'B.Tech. Computer Science and Engineering', 'Undergraduate'),
  ('ME', 'BTECH-ME', 'B.Tech. Mechanical Engineering', 'Undergraduate'),
  ('EE', 'MTECH-EE', 'M.Tech. Electrical Engineering', 'Postgraduate')
) as seed(department_code, code, name, level)
join public.departments d on d.code = seed.department_code
on conflict (code) do nothing;

insert into public.student_profiles (student_id, full_name, department_id, program_id, academic_year, current_semester)
select 'DEMO1001', 'Aarav Sharma', d.id, p.id, 2, 3
from public.departments d
join public.academic_programs p on p.code = 'BTECH-CSE'
where d.code = 'CSE'
on conflict (student_id) do nothing;

insert into public.subjects (code, name, department_id, credits, semester, instructor)
select seed.code, seed.name, d.id, seed.credits, seed.semester, seed.instructor
from (values
  ('CS201', 'Data Structures and Algorithms', 'CSE', 4.0, 3, 'Dr. A. Mehta'),
  ('CS203', 'Database Systems', 'CSE', 3.0, 3, 'Dr. P. Rao'),
  ('MA202', 'Probability and Statistics', 'CSE', 3.0, 3, 'Dr. S. Iyer'),
  ('CS205', 'Computer Organization', 'CSE', 4.0, 3, 'Dr. R. Kumar'),
  ('CS301', 'Operating Systems', 'CSE', 4.0, 4, 'Dr. K. Das')
) as seed(code, name, department_code, credits, semester, instructor)
join public.departments d on d.code = seed.department_code
on conflict (code) do nothing;

insert into public.course_enrollments (student_id, subject_id, academic_year, semester)
select s.id, course.id, 2, course.semester
from public.student_profiles s
join public.subjects course on course.code in ('CS201', 'CS203', 'MA202', 'CS205')
where s.student_id = 'DEMO1001'
on conflict (student_id, subject_id, academic_year, semester) do nothing;

insert into public.student_course_registrations (student_id, subject_id, academic_year, semester)
select enrollment.student_id, enrollment.subject_id, enrollment.academic_year, enrollment.semester
from public.course_enrollments enrollment
where enrollment.academic_year = 2 and enrollment.semester = 3
on conflict (student_id, subject_id, academic_year, semester) do nothing;

insert into public.attendance_records (enrollment_id, class_date, attended)
select e.id, date '2026-09-01' + seed.class_index::integer, seed.class_index % 4 <> 0
from public.course_enrollments e
join public.subjects course on course.id = e.subject_id
cross join generate_series(0, 9) as seed(class_index)
where e.academic_year = 2
  and e.semester = 3
  and course.code in ('CS201', 'CS203', 'MA202', 'CS205')
  and not exists (
    select 1 from public.attendance_records a
    where a.enrollment_id = e.id and a.class_date = date '2026-09-01' + seed.class_index::integer
  );

insert into public.grade_records (enrollment_id, grade, grade_points)
select e.id, seed.grade, seed.grade_points
from public.course_enrollments e
join public.subjects course on course.id = e.subject_id
join (values
  ('CS201', 'A-', 9.0),
  ('CS203', 'B', 8.0),
  ('MA202', 'B-', 7.0),
  ('CS205', 'A', 10.0)
) as seed(code, grade, grade_points) on seed.code = course.code
where e.academic_year = 2 and e.semester = 3
on conflict (enrollment_id) do nothing;

insert into public.feedback_forms (title, description, is_active)
values
  ('Semester 3 course feedback', 'Share feedback on the current semester courses.', true),
  ('Campus services feedback', 'Share feedback about student campus services.', true)
on conflict (title) do nothing;

insert into public.fee_records (student_id, academic_period, fee_type, amount, due_date, status)
select s.id, seed.academic_period, seed.fee_type, seed.amount, seed.due_date, seed.status
from public.student_profiles s
cross join (values
  ('2026-27 Semester 1', 'Tuition fee', 45000.00, date '2026-08-15', 'Paid'),
  ('2026-27 Semester 1', 'Hostel fee', 18000.00, date '2026-08-15', 'Paid'),
  ('2026-27 Semester 2', 'Tuition fee', 45000.00, date '2027-01-15', 'Due')
) as seed(academic_period, fee_type, amount, due_date, status)
where s.student_id = 'DEMO1001'
  and not exists (
    select 1 from public.fee_records f
    where f.student_id = s.id and f.academic_period = seed.academic_period and f.fee_type = seed.fee_type
  );

insert into public.fee_transactions (fee_record_id, amount, transaction_reference, transaction_date, status)
select fee.id, fee.amount, 'DEMO-' || fee.id::text, timestamptz '2026-08-10 10:00:00+00', 'Successful'
from public.fee_records fee
where fee.academic_period = '2026-27 Semester 1'
  and fee.status = 'Paid'
  and not exists (select 1 from public.fee_transactions transaction where transaction.fee_record_id = fee.id);

insert into public.scholarships (name, description, eligibility, opens_at, closes_at)
values
  ('Merit Scholarship (Demo)', 'A fictional scholarship record for demonstrating applications.', 'Undergraduate students with a semester GPA of 8.0 or above.', date '2026-08-01', date '2026-11-30'),
  ('Student Support Grant (Demo)', 'A fictional need-based support grant for demonstration.', 'Enrolled students who meet the stated financial-need criteria.', date '2026-09-01', date '2026-12-15')
on conflict (name) do nothing;

insert into public.hostels (name, description)
values ('Demo Hostel', 'Fictional hostel record for application demonstrations.')
on conflict (name) do nothing;

insert into public.rooms (hostel_id, room_number, capacity)
select h.id, seed.room_number, seed.capacity
from public.hostels h
cross join (values ('A-101', 2), ('A-102', 2), ('B-201', 1)) as seed(room_number, capacity)
where h.name = 'Demo Hostel'
on conflict (hostel_id, room_number) do nothing;

insert into public.room_allocations (student_id, room_id, allocated_from)
select student.id, room.id, date '2026-08-01'
from public.student_profiles student
join public.rooms room on room.room_number = 'A-101'
join public.hostels hostel on hostel.id = room.hostel_id and hostel.name = 'Demo Hostel'
where student.student_id = 'DEMO1001'
  and not exists (
    select 1 from public.room_allocations allocation
    where allocation.student_id = student.id and allocation.allocated_until is null
  );

insert into public.mess_menus (hostel_id, menu_date, meal, items)
select h.id, date '2026-10-19', seed.meal, seed.items
from public.hostels h
cross join (values
  ('Breakfast', 'Poha, fruit, and tea (fictional demo menu)'),
  ('Lunch', 'Rice, dal, seasonal vegetables, and curd (fictional demo menu)'),
  ('Dinner', 'Roti, paneer curry, and salad (fictional demo menu)')
) as seed(meal, items)
where h.name = 'Demo Hostel'
on conflict (hostel_id, menu_date, meal) do nothing;

insert into public.announcements (title, body, audience, expires_at)
values
  ('Welcome to the ERP demo', 'This portal uses fictional data for demonstration only.', 'All', null)
on conflict (title) do nothing;
