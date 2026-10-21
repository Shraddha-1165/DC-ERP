create extension if not exists pgcrypto;

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.academic_programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  code text not null unique,
  name text not null,
  level text not null check (level in ('Undergraduate', 'Postgraduate', 'Doctoral', 'Other')),
  created_at timestamptz not null default now(),
  unique (department_id, name),
  unique (id, department_id)
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  student_id text not null unique,
  full_name text not null,
  email text,
  department_id uuid references public.departments(id) on delete restrict,
  program_id uuid,
  academic_year integer check (academic_year between 1 and 10),
  current_semester integer check (current_semester between 1 and 20),
  status text not null default 'Active' check (status in ('Active', 'Graduated', 'On leave', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (program_id, department_id) references public.academic_programs(id, department_id) on delete restrict,
  check (program_id is null or department_id is not null)
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'administrator')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  department_id uuid references public.departments(id) on delete restrict,
  credits numeric(4,1) not null check (credits > 0),
  semester integer not null check (semester between 1 and 20),
  instructor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  academic_year integer not null check (academic_year between 1 and 10),
  semester integer not null check (semester between 1 and 20),
  status text not null default 'Enrolled' check (status in ('Enrolled', 'Completed', 'Withdrawn')),
  created_at timestamptz not null default now(),
  unique (student_id, subject_id, academic_year, semester)
);

create table public.student_course_registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  academic_year integer not null check (academic_year between 1 and 10),
  semester integer not null check (semester between 1 and 20),
  created_at timestamptz not null default now(),
  unique (student_id, subject_id, academic_year, semester)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete cascade,
  class_date date not null,
  attended boolean not null,
  created_at timestamptz not null default now(),
  unique (enrollment_id, class_date)
);

create table public.grade_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.course_enrollments(id) on delete cascade,
  grade text not null check (grade in ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F', 'I', 'W')),
  grade_points numeric(3,1) not null check (grade_points between 0 and 10),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (grade_points = case grade
    when 'A' then 10
    when 'A-' then 9
    when 'B' then 8
    when 'B-' then 7
    when 'C' then 6
    when 'C-' then 5
    when 'D' then 4
    when 'F' then 0
    when 'I' then 0
    when 'W' then 0
  end)
);

create table public.feedback_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  opens_at timestamptz,
  closes_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (title),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.feedback_forms(id) on delete restrict,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comments text not null,
  submitted_at timestamptz not null default now(),
  unique (form_id, student_id)
);

create table public.fee_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  academic_period text not null,
  fee_type text not null,
  amount numeric(12,2) not null check (amount >= 0),
  due_date date,
  status text not null default 'Due' check (status in ('Due', 'Paid', 'Overdue', 'Waived')),
  created_at timestamptz not null default now()
);

create table public.fee_transactions (
  id uuid primary key default gen_random_uuid(),
  fee_record_id uuid not null references public.fee_records(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  transaction_reference text not null unique,
  transaction_date timestamptz not null default now(),
  status text not null check (status in ('Successful', 'Pending', 'Failed'))
);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  eligibility text not null,
  opens_at date,
  closes_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name),
  check (closes_at is null or opens_at is null or closes_at >= opens_at)
);

create table public.scholarship_applications (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references public.scholarships(id) on delete restrict,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  status text not null default 'Submitted' check (status in ('Submitted', 'Under review', 'Approved', 'Rejected')),
  submitted_at timestamptz not null default now(),
  unique (scholarship_id, student_id)
);

create table public.hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  room_number text not null,
  capacity smallint not null check (capacity > 0),
  created_at timestamptz not null default now(),
  unique (hostel_id, room_number)
);

create table public.room_allocations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  allocated_from date not null default current_date,
  allocated_until date,
  created_at timestamptz not null default now(),
  check (allocated_until is null or allocated_until >= allocated_from)
);

create unique index one_active_room_per_student
  on public.room_allocations(student_id) where allocated_until is null;

create table public.mess_menus (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid references public.hostels(id) on delete cascade,
  menu_date date not null,
  meal text not null check (meal in ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
  items text not null,
  created_at timestamptz not null default now(),
  unique (hostel_id, menu_date, meal)
);

create table public.hmc_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  category text not null check (category in ('Maintenance', 'Room', 'Mess', 'Other')),
  subject text not null,
  description text not null,
  status text not null default 'Submitted' check (status in ('Submitted', 'In progress', 'Resolved', 'Rejected')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'All' check (audience in ('All', 'Students', 'HMC')),
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (title)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger student_profiles_set_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

create trigger subjects_set_updated_at
before update on public.subjects
for each row execute function public.set_updated_at();

create trigger hmc_requests_set_updated_at
before update on public.hmc_requests
for each row execute function public.set_updated_at();

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = required_role
  );
$$;

create or replace function public.is_student_owner(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.student_profiles
    where id = target_student_id and auth_user_id = (select auth.uid())
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.enforce_room_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  room_capacity integer;
  occupied_rooms integer;
  occupied_student_rooms integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.student_id::text, 0));

  select capacity into room_capacity
  from public.rooms
  where id = new.room_id
  for update;

  if room_capacity is null then
    raise exception 'Room does not exist';
  end if;

  select count(*) into occupied_rooms
  from public.room_allocations allocation
  where allocation.room_id = new.room_id
    and allocation.id is distinct from new.id
    and allocation.allocated_from <= coalesce(new.allocated_until, 'infinity'::date)
    and coalesce(allocation.allocated_until, 'infinity'::date) >= new.allocated_from;

  if occupied_rooms >= room_capacity then
    raise exception 'Room capacity has been reached for the requested dates';
  end if;

  select count(*) into occupied_student_rooms
  from public.room_allocations allocation
  where allocation.student_id = new.student_id
    and allocation.id is distinct from new.id
    and allocation.allocated_from <= coalesce(new.allocated_until, 'infinity'::date)
    and coalesce(allocation.allocated_until, 'infinity'::date) >= new.allocated_from;

  if occupied_student_rooms > 0 then
    raise exception 'Student already has a room allocation for the requested dates';
  end if;

  return new;
end;
$$;

create trigger room_allocations_enforce_capacity
before insert or update of room_id, allocated_from, allocated_until on public.room_allocations
for each row execute function public.enforce_room_capacity();

grant usage on schema public to authenticated;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.is_student_owner(uuid) to authenticated;
revoke execute on function public.has_role(text) from public, anon;
revoke execute on function public.is_student_owner(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.enforce_room_capacity() from public, anon, authenticated;

alter table public.departments enable row level security;
alter table public.academic_programs enable row level security;
alter table public.student_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.subjects enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.student_course_registrations enable row level security;
alter table public.attendance_records enable row level security;
alter table public.grade_records enable row level security;
alter table public.feedback_forms enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.fee_records enable row level security;
alter table public.fee_transactions enable row level security;
alter table public.scholarships enable row level security;
alter table public.scholarship_applications enable row level security;
alter table public.hostels enable row level security;
alter table public.rooms enable row level security;
alter table public.room_allocations enable row level security;
alter table public.mess_menus enable row level security;
alter table public.hmc_requests enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;

create policy "Signed-in users can read departments" on public.departments
for select to authenticated using (true);
create policy "Administrators manage departments" on public.departments
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Signed-in users can read programs" on public.academic_programs
for select to authenticated using (true);
create policy "Administrators manage programs" on public.academic_programs
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own student profile" on public.student_profiles
for select to authenticated using (auth_user_id = (select auth.uid()) or public.has_role('administrator'));
create policy "Administrators manage student profiles" on public.student_profiles
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own role" on public.user_roles
for select to authenticated using (user_id = (select auth.uid()) or public.has_role('administrator'));
create policy "Administrators manage roles" on public.user_roles
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Signed-in users can read subjects" on public.subjects
for select to authenticated using (true);
create policy "Administrators manage subjects" on public.subjects
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own enrollments" on public.course_enrollments
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Administrators manage enrollments" on public.course_enrollments
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own course registrations" on public.student_course_registrations
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Administrators manage course registrations" on public.student_course_registrations
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));
create policy "Students register own courses" on public.student_course_registrations
for insert to authenticated with check (
  public.is_student_owner(student_id)
  and exists (
    select 1 from public.subjects subject
    where subject.id = student_course_registrations.subject_id
      and subject.semester = student_course_registrations.semester
  )
);

create policy "Users read own attendance" on public.attendance_records
for select to authenticated using (public.has_role('administrator') or exists (
  select 1 from public.course_enrollments e
  where e.id = enrollment_id and public.is_student_owner(e.student_id)
));
create policy "Administrators manage attendance" on public.attendance_records
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own grades" on public.grade_records
for select to authenticated using (
  public.has_role('administrator') or exists (
    select 1 from public.course_enrollments e
    where e.id = enrollment_id and public.is_student_owner(e.student_id)
  )
);
create policy "Administrators manage grades" on public.grade_records
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read active feedback forms" on public.feedback_forms
for select to authenticated using (is_active or public.has_role('administrator'));
create policy "Administrators manage feedback forms" on public.feedback_forms
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own feedback submissions" on public.feedback_submissions
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Students submit own feedback" on public.feedback_submissions
for insert to authenticated with check (
  public.is_student_owner(student_id)
  and exists (
    select 1 from public.feedback_forms form
    where form.id = form_id
      and form.is_active
      and (form.opens_at is null or form.opens_at <= now())
      and (form.closes_at is null or form.closes_at >= now())
  )
);
create policy "Administrators manage feedback submissions" on public.feedback_submissions
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own fee records" on public.fee_records
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Administrators manage fee records" on public.fee_records
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own fee transactions" on public.fee_transactions
for select to authenticated using (public.has_role('administrator') or exists (
  select 1 from public.fee_records f
  where f.id = fee_record_id and public.is_student_owner(f.student_id)
));
create policy "Administrators manage fee transactions" on public.fee_transactions
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Signed-in users can read active scholarships" on public.scholarships
for select to authenticated using (is_active or public.has_role('administrator'));
create policy "Administrators manage scholarships" on public.scholarships
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own scholarship applications" on public.scholarship_applications
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Students apply for scholarships" on public.scholarship_applications
for insert to authenticated with check (
  public.is_student_owner(student_id)
  and exists (
    select 1 from public.scholarships scholarship
    where scholarship.id = scholarship_id
      and scholarship.is_active
      and (scholarship.opens_at is null or scholarship.opens_at <= current_date)
      and (scholarship.closes_at is null or scholarship.closes_at >= current_date)
  )
);
create policy "Administrators manage scholarship applications" on public.scholarship_applications
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Signed-in users can read hostels" on public.hostels
for select to authenticated using (true);
create policy "Administrators manage hostels" on public.hostels
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Signed-in users can read rooms" on public.rooms
for select to authenticated using (true);
create policy "Administrators manage rooms" on public.rooms
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own room allocations" on public.room_allocations
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Administrators manage room allocations" on public.room_allocations
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Signed-in users can read mess menus" on public.mess_menus
for select to authenticated using (true);
create policy "Administrators manage mess menus" on public.mess_menus
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own HMC requests" on public.hmc_requests
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Students create own HMC requests" on public.hmc_requests
for insert to authenticated with check (public.is_student_owner(student_id));
create policy "Administrators manage HMC requests" on public.hmc_requests
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read current announcements" on public.announcements
for select to authenticated using (expires_at is null or expires_at >= current_date);
create policy "Administrators manage announcements" on public.announcements
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

create policy "Users read own notifications" on public.notifications
for select to authenticated using (public.is_student_owner(student_id) or public.has_role('administrator'));
create policy "Users mark own notifications read" on public.notifications
for update to authenticated using (public.is_student_owner(student_id)) with check (public.is_student_owner(student_id));
create policy "Administrators manage notifications" on public.notifications
for all to authenticated using (public.has_role('administrator')) with check (public.has_role('administrator'));

grant select on public.departments, public.academic_programs, public.subjects,
  public.feedback_forms, public.scholarships, public.hostels, public.rooms,
  public.mess_menus, public.announcements to authenticated;
grant select, insert, update, delete on
  public.departments,
  public.academic_programs,
  public.student_profiles,
  public.user_roles,
  public.subjects,
  public.course_enrollments,
  public.student_course_registrations,
  public.attendance_records,
  public.grade_records,
  public.feedback_forms,
  public.feedback_submissions,
  public.fee_records,
  public.fee_transactions,
  public.scholarships,
  public.scholarship_applications,
  public.hostels,
  public.rooms,
  public.room_allocations,
  public.mess_menus,
  public.hmc_requests,
  public.announcements,
  public.notifications to authenticated;
revoke insert on public.feedback_submissions, public.scholarship_applications,
  public.hmc_requests, public.course_enrollments, public.student_course_registrations from authenticated;
grant insert (form_id, student_id, rating, comments)
  on public.feedback_submissions to authenticated;
grant insert (scholarship_id, student_id)
  on public.scholarship_applications to authenticated;
grant insert (student_id, category, subject, description)
  on public.hmc_requests to authenticated;
grant insert (student_id, subject_id, academic_year, semester)
  on public.student_course_registrations to authenticated;
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
