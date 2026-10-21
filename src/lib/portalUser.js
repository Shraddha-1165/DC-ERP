import { supabase } from './supabase'

export async function loadPortalUser(authUser) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Copy .env.example to .env and add your project URL and public key.')
  }

  const [{ data: roles, error: rolesError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', authUser.id),
    supabase
      .from('student_profiles')
      .select('id, student_id, full_name, email, department_id, program_id, academic_year, current_semester, departments(name), academic_programs(name)')
      .eq('auth_user_id', authUser.id)
      .maybeSingle(),
  ])

  if (rolesError) throw rolesError
  if (profileError) throw profileError
  if (!roles?.length) {
    throw new Error('Your account has no ERP role. Ask an administrator to provision it.')
  }

  const role = roles.some(({ role: userRole }) => userRole === 'administrator')
    ? 'administrator'
    : 'student'

  return {
    id: authUser.id,
    name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email || 'ERP User',
    demoId: profile?.student_id || authUser.email || 'ERP User',
    email: profile?.email || authUser.email || '',
    type: role === 'administrator' ? 'Administrator' : 'Student',
    role,
    studentProfileId: profile?.id || null,
    profile,
  }
}
