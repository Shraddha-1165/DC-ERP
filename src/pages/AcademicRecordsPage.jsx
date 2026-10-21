import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyStudentForm = {
  student_id: '',
  full_name: '',
  email: '',
  department_id: '',
  program_id: '',
  academic_year: '',
  current_semester: '',
  status: 'Active',
}

const emptySubjectForm = {
  code: '',
  name: '',
  department_id: '',
  credits: '',
  semester: '',
  instructor: '',
}

function getSection(item) {
  if (/feedback/i.test(item)) return 'Feedback'
  if (/fee|payment/i.test(item)) return 'Fees'
  if (/result|grade card/i.test(item)) return 'Result'
  if (/scholarship|application status/i.test(item)) return 'Scholarship'
  if (/student|personal details|academic details/i.test(item)) return 'Students'
  return 'Subjects'
}

function EmptyState({ children }) {
  return <p className="record-empty">{children}</p>
}

function StatusMessage({ status }) {
  return status.message ? (
    <p className={`alert-box ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
      {status.message}
    </p>
  ) : null
}

export default function AcademicRecordsPage({ item, user }) {
  const section = getSection(item)
  const isAdministrator = user.role === 'administrator'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [data, setData] = useState([])
  const [forms, setForms] = useState([])
  const [submittedFormIds, setSubmittedFormIds] = useState([])
  const [transactions, setTransactions] = useState([])
  const [catalogSubjects, setCatalogSubjects] = useState([])
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [search, setSearch] = useState('')
  const [selectedForm, setSelectedForm] = useState('')
  const [rating, setRating] = useState('5')
  const [comments, setComments] = useState('')
  const [studentForm, setStudentForm] = useState(emptyStudentForm)
  const [editingStudentId, setEditingStudentId] = useState('')
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm)
  const [registrationSubjectId, setRegistrationSubjectId] = useState('')
  const [registrationYear, setRegistrationYear] = useState('1')
  const [registrationSemester, setRegistrationSemester] = useState('1')

  const loadData = useCallback(async () => {
    try {
      if (section === 'Feedback') {
        const [{ data: availableForms, error: formsError }, { data: submissions, error: submissionsError }] =
          await Promise.all([
            supabase.from('feedback_forms').select('id,title,description,opens_at,closes_at,is_active').eq('is_active', true).order('created_at'),
            user.studentProfileId
              ? supabase.from('feedback_submissions').select('id,form_id,rating,comments,submitted_at,feedback_forms(title)').eq('student_id', user.studentProfileId).order('submitted_at', { ascending: false })
              : Promise.resolve({ data: [], error: null }),
          ])
        if (formsError) throw formsError
        if (submissionsError) throw submissionsError
        setForms(availableForms || [])
        setSubmittedFormIds((submissions || []).map(({ form_id }) => form_id))
        setData(submissions || [])
      } else if (section === 'Fees') {
        if (user.studentProfileId || isAdministrator) {
          const { data: fees, error: feesError } = await supabase
            .from('fee_records')
            .select('id,academic_period,fee_type,amount,due_date,status,student_id,fee_transactions(id,amount,transaction_reference,transaction_date,status)')
            .order('due_date', { ascending: false })
          if (feesError) throw feesError
          const visibleFees = isAdministrator
            ? fees || []
            : (fees || []).filter(({ student_id }) => student_id === user.studentProfileId)
          setData(visibleFees)
          setTransactions(visibleFees.flatMap(({ fee_transactions: entries }) => entries || []))
        }
      } else if (section === 'Result') {
        if (user.studentProfileId || isAdministrator) {
          const query = supabase
            .from('course_enrollments')
            .select('id,student_id,academic_year,semester,status,subjects(code,name,credits),grade_records(grade,grade_points,published_at)')
            .order('academic_year', { ascending: false })
            .order('semester', { ascending: false })
          if (!isAdministrator) query.eq('student_id', user.studentProfileId)
          const { data: records, error: resultError } = await query
          if (resultError) throw resultError
          setData(records || [])
        }
      } else if (section === 'Scholarship') {
        const [{ data: scholarships, error: scholarshipsError }, { data: applications, error: applicationsError }] =
          await Promise.all([
            supabase.from('scholarships').select('id,name,description,eligibility,opens_at,closes_at,is_active').eq('is_active', true).order('closes_at'),
            user.studentProfileId
              ? supabase.from('scholarship_applications').select('id,scholarship_id,status,submitted_at').eq('student_id', user.studentProfileId)
              : Promise.resolve({ data: [], error: null }),
          ])
        if (scholarshipsError) throw scholarshipsError
        if (applicationsError) throw applicationsError
        setData(scholarships || [])
        setTransactions(applications || [])
      } else if (section === 'Students') {
        if (isAdministrator) {
          const [{ data: students, error: studentsError }, { data: deptRows, error: departmentsError }, { data: programRows, error: programsError }] =
            await Promise.all([
              supabase.from('student_profiles').select('id,student_id,full_name,email,department_id,program_id,academic_year,current_semester,status,departments(name),academic_programs(name)').order('student_id'),
              supabase.from('departments').select('id,name').order('name'),
              supabase.from('academic_programs').select('id,name,department_id').order('name'),
            ])
          if (studentsError) throw studentsError
          if (departmentsError) throw departmentsError
          if (programsError) throw programsError
          setData(students || [])
          setDepartments(deptRows || [])
          setPrograms(programRows || [])
        } else {
          setData(user.profile ? [user.profile] : [])
        }
      } else if (section === 'Subjects' && ['Registered Subjects', 'Course Registration'].includes(item)) {
        const registrationQuery = supabase
          .from('student_course_registrations')
          .select('id,student_id,academic_year,semester,subjects(id,code,name,credits,semester,departments(name))')
          .order('academic_year', { ascending: false })
          .order('semester', { ascending: false })
        if (!isAdministrator && user.studentProfileId) registrationQuery.eq('student_id', user.studentProfileId)
        const [{ data: registrations, error: registrationsError }, { data: catalog, error: catalogError }] = await Promise.all([
          user.studentProfileId || isAdministrator
            ? registrationQuery
            : Promise.resolve({ data: [], error: null }),
          supabase.from('subjects').select('id,code,name,semester,credits').order('code'),
        ])
        if (registrationsError) throw registrationsError
        if (catalogError) throw catalogError
        setData(registrations || [])
        setCatalogSubjects(catalog || [])
      } else {
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id,code,name,credits,semester,instructor,department_id,departments(name)')
          .order('code')
        if (subjectsError) throw subjectsError
        setData(subjects || [])
        if (isAdministrator) {
          const { data: deptRows, error: departmentsError } = await supabase.from('departments').select('id,name').order('name')
          if (departmentsError) throw departmentsError
          setDepartments(deptRows || [])
        }
      }
    } catch (loadError) {
      setError(loadError.message || `Unable to load ${section.toLowerCase()} records.`)
    } finally {
      setLoading(false)
    }
  }, [isAdministrator, item, section, user.profile, user.studentProfileId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data
    return data.filter((record) => JSON.stringify(record).toLowerCase().includes(term))
  }, [data, search])

  const submitRecord = async (operation, successMessage) => {
    try {
      await operation()
      setStatus({ type: 'success', message: successMessage })
      await loadData()
      return true
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to save the record.' })
      return false
    }
  }

  const submitFeedback = async (event) => {
    event.preventDefault()
    if (!user.studentProfileId) {
      setStatus({ type: 'error', message: 'Your student profile is not linked to this account. Ask an administrator to link it.' })
      return
    }
    if (!selectedForm || !comments.trim()) {
      setStatus({ type: 'error', message: 'Select a feedback form and enter comments before submitting.' })
      return
    }
    const saved = await submitRecord(async () => {
      const { error: insertError } = await supabase.from('feedback_submissions').insert({
        form_id: selectedForm,
        student_id: user.studentProfileId,
        rating: Number(rating),
        comments: comments.trim(),
      })
      if (insertError) throw new Error(insertError.code === '23505' ? 'You have already submitted this one-time form.' : insertError.message)
    }, 'Feedback submitted.')
    if (saved) setComments('')
  }

  const applyForScholarship = async (scholarshipId) => {
    if (!user.studentProfileId) {
      setStatus({ type: 'error', message: 'Your student profile is not linked to this account. Ask an administrator to link it.' })
      return
    }
    await submitRecord(async () => {
      const { error: insertError } = await supabase.from('scholarship_applications').insert({
        scholarship_id: scholarshipId,
        student_id: user.studentProfileId,
      })
      if (insertError) throw new Error(insertError.code === '23505' ? 'You already applied for this scholarship.' : insertError.message)
    }, 'Scholarship application submitted.')
  }

  const saveStudent = async (event) => {
    event.preventDefault()
    if (!studentForm.student_id.trim() || !studentForm.full_name.trim()) {
      setStatus({ type: 'error', message: 'Student ID and full name are required.' })
      return
    }
    const payload = {
      ...studentForm,
      student_id: studentForm.student_id.trim(),
      full_name: studentForm.full_name.trim(),
      email: studentForm.email.trim() || null,
      department_id: studentForm.department_id || null,
      program_id: studentForm.program_id || null,
      academic_year: studentForm.academic_year ? Number(studentForm.academic_year) : null,
      current_semester: studentForm.current_semester ? Number(studentForm.current_semester) : null,
    }
    const query = editingStudentId
      ? supabase.from('student_profiles').update(payload).eq('id', editingStudentId)
      : supabase.from('student_profiles').insert(payload)
    const saved = await submitRecord(async () => {
      const { error: saveError } = await query
      if (saveError) throw new Error(saveError.code === '23505' ? 'That student ID is already in use.' : saveError.message)
    }, editingStudentId ? 'Student record updated.' : 'Student record added.')
    if (saved) {
      setStudentForm(emptyStudentForm)
      setEditingStudentId('')
    }
  }

  const saveSubject = async (event) => {
    event.preventDefault()
    const payload = {
      ...subjectForm,
      code: subjectForm.code.trim(),
      name: subjectForm.name.trim(),
      department_id: subjectForm.department_id || null,
      credits: Number(subjectForm.credits),
      semester: Number(subjectForm.semester),
      instructor: subjectForm.instructor.trim() || null,
    }
    const saved = await submitRecord(async () => {
      const { error: saveError } = await supabase.from('subjects').insert(payload)
      if (saveError) throw new Error(saveError.code === '23505' ? 'That subject code is already in use.' : saveError.message)
    }, 'Subject added.')
    if (saved) setSubjectForm(emptySubjectForm)
  }

  const registerCourse = async (event) => {
    event.preventDefault()
    if (!user.studentProfileId) {
      setStatus({ type: 'error', message: 'Your student profile is not linked to this account.' })
      return
    }
    if (!registrationSubjectId) {
      setStatus({ type: 'error', message: 'Select a subject before registering.' })
      return
    }
    const saved = await submitRecord(async () => {
      const { error: insertError } = await supabase.from('student_course_registrations').insert({
        student_id: user.studentProfileId,
        subject_id: registrationSubjectId,
        academic_year: Number(registrationYear),
        semester: Number(registrationSemester),
      })
      if (insertError) throw new Error(insertError.code === '23505' ? 'You are already registered for this subject in that period.' : insertError.message)
    }, 'Course registration saved.')
    if (saved) setRegistrationSubjectId('')
  }

  const feeTotal = data.reduce((sum, fee) => sum + Number(fee.amount), 0)
  const gradeRows = data.flatMap((enrollment) =>
    enrollment.grade_records
      ?.filter(({ grade }) => !['I', 'W'].includes(grade))
      .map((grade) => ({ ...grade, enrollment })) || [],
  )
  const totalGradePoints = gradeRows.reduce(
    (sum, { grade_points, enrollment }) => sum + Number(grade_points) * Number(enrollment.subjects?.credits || 0),
    0,
  )
  const totalCredits = gradeRows.reduce((sum, { enrollment }) => sum + Number(enrollment.subjects?.credits || 0), 0)
  const cgpa = totalCredits ? (totalGradePoints / totalCredits).toFixed(2) : '—'
  const semesterResults = [...new Set(gradeRows.map(({ enrollment }) => `${enrollment.academic_year} / Semester ${enrollment.semester}`))]
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }))
    .map((period) => {
      const periodRows = gradeRows.filter(({ enrollment }) => `${enrollment.academic_year} / Semester ${enrollment.semester}` === period)
      const credits = periodRows.reduce((sum, { enrollment }) => sum + Number(enrollment.subjects?.credits || 0), 0)
      const points = periodRows.reduce((sum, { grade_points, enrollment }) => sum + Number(grade_points) * Number(enrollment.subjects?.credits || 0), 0)
      return { period, credits, sgpa: credits ? (points / credits).toFixed(2) : '—' }
    })

  const title = section === 'Students' && !isAdministrator ? 'Student Profile' : section

  return (
    <section className="erp-detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <span>Academic</span><span aria-hidden="true">›</span><span aria-current="page">{title}</span>
      </nav>
      <div className="detail-page-heading">
        <h1>{title}</h1>
        <p>{isAdministrator ? 'Administrator view' : 'Records are loaded from the configured ERP database.'}</p>
      </div>
      <StatusMessage status={status} />
      {error ? <p className="alert-box error" role="alert">{error}</p> : null}
      {loading ? <p role="status">Loading {title.toLowerCase()}…</p> : null}
      {!loading && !user.studentProfileId && !isAdministrator && ['Feedback', 'Fees', 'Result', 'Scholarship'].includes(section) ? (
        <p className="alert-box info" role="status">Your account is authenticated but no student profile is linked yet. Ask an administrator to link your fictional student record.</p>
      ) : null}

      {!loading && section === 'Feedback' ? (
        <>
          {forms.length === 0 ? <EmptyState>No active feedback forms are available.</EmptyState> : null}
          {user.studentProfileId ? (
            <form className="record-form" onSubmit={submitFeedback}>
              <div className="erp-field">
                <label htmlFor="feedback-form">Feedback form</label>
                <select id="feedback-form" value={selectedForm} onChange={(event) => setSelectedForm(event.target.value)} required>
                  <option value="">Select a form</option>
                  {forms.map((form) => <option key={form.id} value={form.id} disabled={submittedFormIds.includes(form.id)}>{form.title}{submittedFormIds.includes(form.id) ? ' (submitted)' : ''}</option>)}
                </select>
              </div>
              <div className="erp-field">
                <label htmlFor="feedback-rating">Rating</label>
                <select id="feedback-rating" value={rating} onChange={(event) => setRating(event.target.value)}>
                  {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} / 5</option>)}
                </select>
              </div>
              <div className="erp-field">
                <label htmlFor="feedback-comments">Comments</label>
                <textarea id="feedback-comments" value={comments} onChange={(event) => setComments(event.target.value)} rows="4" required maxLength="2000" />
              </div>
              <button className="record-button" type="submit" disabled={!selectedForm || submittedFormIds.includes(selectedForm)}>Submit feedback</button>
            </form>
          ) : null}
          {data.length ? <>
            <h2 className="record-subheading">Submitted feedback history</h2>
            <div className="attendance-table-wrap"><table className="attendance-table">
              <thead><tr><th>Form</th><th>Rating</th><th>Comments</th><th>Submitted</th></tr></thead>
              <tbody>{data.map((submission) => <tr key={submission.id}><td>{submission.feedback_forms?.title || 'Feedback form'}</td><td>{submission.rating} / 5</td><td>{submission.comments}</td><td>{submission.submitted_at.slice(0, 10)}</td></tr>)}</tbody>
            </table></div>
          </> : null}
        </>
      ) : null}

      {!loading && section === 'Fees' ? (
        <>
          <div className="attendance-summary">
            <div><span className="summary-label">Total listed fees</span><strong>₹{feeTotal.toLocaleString('en-IN')}</strong></div>
            <div><span className="summary-label">Fee records</span><strong>{data.length}</strong></div>
            <div><span className="summary-label">Payment transactions</span><strong>{transactions.length}</strong></div>
          </div>
          {data.length ? (
            <div className="attendance-table-wrap"><table className="attendance-table">
              <thead><tr><th>Academic period</th><th>Fee type</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead>
              <tbody>{data.map((fee) => <tr key={fee.id}><td>{fee.academic_period}</td><td>{fee.fee_type}</td><td>₹{Number(fee.amount).toLocaleString('en-IN')}</td><td>{fee.due_date || '—'}</td><td>{fee.status}</td></tr>)}</tbody>
            </table></div>
          ) : <EmptyState>No fee records are available.</EmptyState>}
          <h2 className="record-subheading">Transaction history</h2>
          {transactions.length ? <div className="attendance-table-wrap"><table className="attendance-table">
            <thead><tr><th>Reference</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>{transactions.map((transaction) => <tr key={transaction.id}><td>{transaction.transaction_reference}</td><td>₹{Number(transaction.amount).toLocaleString('en-IN')}</td><td>{new Date(transaction.transaction_date).toLocaleDateString()}</td><td>{transaction.status}</td></tr>)}</tbody>
          </table></div> : <EmptyState>No payment transactions are recorded. This demo does not process payments.</EmptyState>}
        </>
      ) : null}

      {!loading && section === 'Result' ? (
        <>
          <p className="demo-notice">Grade points: A=10, A−=9, B=8, B−=7, C=6, C−=5, D=4, F=0. GPA is credit-weighted; incomplete and withdrawn courses are excluded. Published grades are read-only.</p>
          <div className="attendance-summary"><div><span className="summary-label">CGPA</span><strong>{cgpa}</strong></div><div><span className="summary-label">Graded courses</span><strong>{gradeRows.length}</strong></div><div><span className="summary-label">Credits included</span><strong>{totalCredits}</strong></div></div>
          {semesterResults.length ? <div className="attendance-table-wrap"><table className="attendance-table">
            <thead><tr><th>Academic year / semester</th><th>Credits included</th><th>SGPA</th></tr></thead>
            <tbody>{semesterResults.map((result) => <tr key={result.period}><td>{result.period}</td><td>{result.credits}</td><td>{result.sgpa}</td></tr>)}</tbody>
          </table></div> : null}
          {gradeRows.length ? <div className="attendance-table-wrap"><table className="attendance-table">
            <thead><tr><th>Semester</th><th>Course</th><th>Credits</th><th>Grade</th><th>Grade points</th></tr></thead>
            <tbody>{gradeRows.map(({ enrollment, grade, grade_points }) => <tr key={enrollment.id}><td>{enrollment.academic_year} / {enrollment.semester}</td><td>{enrollment.subjects?.code} — {enrollment.subjects?.name}</td><td>{enrollment.subjects?.credits}</td><td>{grade}</td><td>{grade_points}</td></tr>)}</tbody>
          </table></div> : <EmptyState>No published results are available.</EmptyState>}
        </>
      ) : null}

      {!loading && section === 'Scholarship' ? (
        <div className="record-card-list">
          {data.map((scholarship) => {
            const application = transactions.find(({ scholarship_id }) => scholarship_id === scholarship.id)
            return <article className="record-card" key={scholarship.id}>
              <h2>{scholarship.name}</h2><p>{scholarship.description}</p><p><strong>Eligibility:</strong> {scholarship.eligibility}</p>
              <p><strong>Dates:</strong> {scholarship.opens_at || 'Open'} – {scholarship.closes_at || 'No closing date'}</p>
              <p><strong>Application:</strong> {application?.status || 'Not applied'}</p>
              {!isAdministrator && user.studentProfileId && !application ? <button type="button" className="record-button" onClick={() => applyForScholarship(scholarship.id)}>Apply</button> : null}
            </article>
          })}
          {!data.length ? <EmptyState>No active scholarships are available.</EmptyState> : null}
        </div>
      ) : null}

      {!loading && section === 'Students' ? (
        <>
          {isAdministrator ? (
            <>
              <div className="record-toolbar">
                <label className="visually-hidden" htmlFor="student-search">Search students</label>
                <input id="student-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by ID, name, email, department…" />
              </div>
              <form className="record-form" onSubmit={saveStudent}>
                <h2>{editingStudentId ? 'Edit student' : 'Add student'}</h2>
                <div className="record-form-grid">
                  <div className="erp-field"><label htmlFor="student-id">Student ID *</label><input id="student-id" value={studentForm.student_id} onChange={(event) => setStudentForm({ ...studentForm, student_id: event.target.value })} required /></div>
                  <div className="erp-field"><label htmlFor="student-name">Full name *</label><input id="student-name" value={studentForm.full_name} onChange={(event) => setStudentForm({ ...studentForm, full_name: event.target.value })} required /></div>
                  <div className="erp-field"><label htmlFor="student-email">Email</label><input id="student-email" type="email" value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} /></div>
                  <div className="erp-field"><label htmlFor="student-dept">Department</label><select id="student-dept" value={studentForm.department_id} onChange={(event) => setStudentForm({ ...studentForm, department_id: event.target.value, program_id: '' })}><option value="">Select department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></div>
                  <div className="erp-field"><label htmlFor="student-program">Program</label><select id="student-program" value={studentForm.program_id} disabled={!studentForm.department_id} onChange={(event) => setStudentForm({ ...studentForm, program_id: event.target.value })}><option value="">Select program</option>{programs.filter((program) => program.department_id === studentForm.department_id).map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div>
                  <div className="erp-field"><label htmlFor="student-year">Academic year</label><input id="student-year" type="number" min="1" max="10" value={studentForm.academic_year} onChange={(event) => setStudentForm({ ...studentForm, academic_year: event.target.value })} /></div>
                  <div className="erp-field"><label htmlFor="student-semester">Semester</label><input id="student-semester" type="number" min="1" max="20" value={studentForm.current_semester} onChange={(event) => setStudentForm({ ...studentForm, current_semester: event.target.value })} /></div>
                  <div className="erp-field"><label htmlFor="student-status">Status</label><select id="student-status" value={studentForm.status} onChange={(event) => setStudentForm({ ...studentForm, status: event.target.value })}>{['Active', 'Graduated', 'On leave', 'Inactive'].map((value) => <option key={value}>{value}</option>)}</select></div>
                </div>
                <div className="record-actions"><button className="record-button" type="submit">{editingStudentId ? 'Save changes' : 'Add student'}</button>{editingStudentId ? <button type="button" className="record-button secondary" onClick={() => { setEditingStudentId(''); setStudentForm(emptyStudentForm) }}>Cancel</button> : null}</div>
              </form>
              {filteredRecords.length ? <div className="attendance-table-wrap"><table className="attendance-table">
                <thead><tr><th>Student ID</th><th>Name</th><th>Department</th><th>Program</th><th>Year / semester</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{filteredRecords.map((student) => <tr key={student.id}><td>{student.student_id}</td><td>{student.full_name}</td><td>{student.departments?.name || '—'}</td><td>{student.academic_programs?.name || '—'}</td><td>{student.academic_year || '—'} / {student.current_semester || '—'}</td><td>{student.status}</td><td><button type="button" className="record-link" onClick={() => { setEditingStudentId(student.id); setStudentForm({ student_id: student.student_id, full_name: student.full_name, email: student.email || '', department_id: student.department_id || '', program_id: student.program_id || '', academic_year: student.academic_year || '', current_semester: student.current_semester || '', status: student.status }) }}>Edit</button></td></tr>)}</tbody>
              </table></div> : <EmptyState>No student records found.</EmptyState>}
            </>
          ) : data[0] ? (
            <div className="record-card"><h2>{data[0].full_name}</h2><p><strong>Student ID:</strong> {data[0].student_id}</p><p><strong>Department:</strong> {data[0].departments?.name || '—'}</p><p><strong>Program:</strong> {data[0].academic_programs?.name || '—'}</p><p><strong>Academic year / semester:</strong> {data[0].academic_year || '—'} / {data[0].current_semester || '—'}</p><p><strong>Status:</strong> {data[0].status}</p></div>
          ) : <EmptyState>Your student profile is not linked to this account.</EmptyState>}
        </>
      ) : null}

      {!loading && section === 'Subjects' && ['Course Registration', 'Registered Subjects'].includes(item) ? (
        <>
          {item === 'Course Registration' && !isAdministrator && user.studentProfileId ? (
            <form className="record-form" onSubmit={registerCourse}>
              <h2>Course registration</h2>
              <div className="record-form-grid">
                <div className="erp-field"><label htmlFor="registration-year">Academic year</label><input id="registration-year" type="number" min="1" max="10" value={registrationYear} onChange={(event) => setRegistrationYear(event.target.value)} required /></div>
                <div className="erp-field"><label htmlFor="registration-semester">Semester</label><select id="registration-semester" value={registrationSemester} onChange={(event) => { setRegistrationSemester(event.target.value); setRegistrationSubjectId('') }}>{[...new Set(catalogSubjects.map(({ semester }) => semester))].sort((a, b) => a - b).map((number) => <option key={number} value={number}>{number}</option>)}</select></div>
                <div className="erp-field"><label htmlFor="registration-subject">Subject</label><select id="registration-subject" value={registrationSubjectId} onChange={(event) => setRegistrationSubjectId(event.target.value)} required><option value="">Select a subject</option>{catalogSubjects.filter(({ semester }) => Number(semester) === Number(registrationSemester)).map((course) => <option key={course.id} value={course.id}>{course.code} — {course.name} ({course.credits} credits)</option>)}</select></div>
              </div>
              <button type="submit" className="record-button">Register</button>
            </form>
          ) : null}
          {item === 'Course Registration' && !user.studentProfileId && !isAdministrator ? <p className="alert-box info" role="status">Your account has no linked student profile. Ask an administrator to link it.</p> : null}
          {data.length ? <div className="attendance-table-wrap"><table className="attendance-table">
            <thead><tr><th>Course code</th><th>Subject</th><th>Credits</th><th>Academic year</th><th>Semester</th><th>Status</th></tr></thead>
            <tbody>{data.map((enrollment) => <tr key={enrollment.id}><td>{enrollment.subjects?.code}</td><td>{enrollment.subjects?.name}</td><td>{enrollment.subjects?.credits}</td><td>{enrollment.academic_year}</td><td>{enrollment.semester}</td><td>Registered</td></tr>)}</tbody>
          </table></div> : <EmptyState>No registered subjects are available.</EmptyState>}
        </>
      ) : null}

      {!loading && section === 'Subjects' && !['Course Registration', 'Registered Subjects'].includes(item) ? (
        <>
          <div className="record-toolbar">
            <label className="visually-hidden" htmlFor="subject-search">Search subjects</label>
            <input id="subject-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by code, subject, department, instructor…" />
          </div>
          {isAdministrator ? (
            <form className="record-form" onSubmit={saveSubject}>
              <h2>Add subject</h2><div className="record-form-grid">
                <div className="erp-field"><label htmlFor="subject-code">Course code *</label><input id="subject-code" value={subjectForm.code} onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })} required /></div>
                <div className="erp-field"><label htmlFor="subject-name">Subject name *</label><input id="subject-name" value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} required /></div>
                <div className="erp-field"><label htmlFor="subject-dept">Department</label><select id="subject-dept" value={subjectForm.department_id} onChange={(event) => setSubjectForm({ ...subjectForm, department_id: event.target.value })}><option value="">Select department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></div>
                <div className="erp-field"><label htmlFor="subject-credits">Credits *</label><input id="subject-credits" type="number" min="0.5" step="0.5" value={subjectForm.credits} onChange={(event) => setSubjectForm({ ...subjectForm, credits: event.target.value })} required /></div>
                <div className="erp-field"><label htmlFor="subject-semester">Semester *</label><input id="subject-semester" type="number" min="1" max="20" value={subjectForm.semester} onChange={(event) => setSubjectForm({ ...subjectForm, semester: event.target.value })} required /></div>
                <div className="erp-field"><label htmlFor="subject-instructor">Instructor</label><input id="subject-instructor" value={subjectForm.instructor} onChange={(event) => setSubjectForm({ ...subjectForm, instructor: event.target.value })} /></div>
              </div><button className="record-button" type="submit">Add subject</button>
            </form>
          ) : null}
          {filteredRecords.length ? <div className="attendance-table-wrap"><table className="attendance-table">
            <thead><tr><th>Course code</th><th>Subject</th><th>Department</th><th>Credits</th><th>Semester</th><th>Instructor</th></tr></thead>
            <tbody>{filteredRecords.map((subject) => <tr key={subject.id}><td>{subject.code}</td><td>{subject.name}</td><td>{subject.departments?.name || '—'}</td><td>{subject.credits}</td><td>{subject.semester}</td><td>{subject.instructor || '—'}</td></tr>)}</tbody>
          </table></div> : <EmptyState>No subjects found.</EmptyState>}
        </>
      ) : null}
    </section>
  )
}
