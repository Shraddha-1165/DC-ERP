import { useMemo, useState } from 'react'
import { attendanceBySemester, semesterOptions } from '../data/attendance'

function getAttendanceStatus(percentage) {
  if (percentage >= 75) return { label: 'Satisfactory', level: 'good' }
  if (percentage >= 65) return { label: 'Needs attention', level: 'warning' }
  return { label: 'Low attendance', level: 'low' }
}

export default function AttendancePage({ onHome, onAcademic }) {
  const [semester, setSemester] = useState(semesterOptions[0])
  const [subject, setSubject] = useState('All subjects')

  const semesterRecords = attendanceBySemester[semester]
  const subjects = useMemo(
    () => ['All subjects', ...semesterRecords.map(({ subject: name }) => name)],
    [semesterRecords],
  )
  const records = semesterRecords.filter(
    (record) => subject === 'All subjects' || record.subject === subject,
  )
  const summary = records.reduce(
    (totals, record) => ({
      attended: totals.attended + record.attended,
      total: totals.total + record.total,
    }),
    { attended: 0, total: 0 },
  )
  const summaryPercentage = summary.total ? Math.round((summary.attended / summary.total) * 100) : 0

  return (
    <section className="erp-detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onHome}>Home</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onAcademic}>Academic</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onAcademic}>Subjects</button><span aria-hidden="true">›</span>
        <span aria-current="page">Attendance</span>
      </nav>
      <div className="detail-page-heading">
        <h1>Attendance</h1>
        <p>Review attendance for fictional demo subjects.</p>
      </div>

      <div className="attendance-filters">
        <div className="erp-field">
          <label htmlFor="attendance-subject">Subject</label>
          <select id="attendance-subject" value={subject} onChange={(event) => setSubject(event.target.value)}>
            {subjects.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div className="erp-field">
          <label htmlFor="attendance-semester">Semester</label>
          <select id="attendance-semester" value={semester} onChange={(event) => {
            setSemester(event.target.value)
            setSubject('All subjects')
          }}>
            {semesterOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      <section className="attendance-summary" aria-label="Attendance summary">
        <div>
          <span className="summary-label">Classes attended</span>
          <strong>{summary.attended}</strong>
        </div>
        <div>
          <span className="summary-label">Total classes held</span>
          <strong>{summary.total}</strong>
        </div>
        <div>
          <span className="summary-label">Overall attendance</span>
          <strong>{summaryPercentage}%</strong>
        </div>
      </section>

      <div className="attendance-table-wrap">
        <table className="attendance-table">
          <caption className="visually-hidden">Attendance by subject for {semester}</caption>
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Classes attended</th>
              <th scope="col">Total classes</th>
              <th scope="col">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const percentage = Math.round((record.attended / record.total) * 100)
              const status = getAttendanceStatus(percentage)
              return (
                <tr key={record.subject}>
                  <th scope="row">{record.subject}</th>
                  <td>{record.attended}</td>
                  <td>{record.total}</td>
                  <td>
                    <div className="attendance-result">
                      <progress className={`attendance-progress ${status.level}`} max="100" value={percentage}>
                        {percentage}%
                      </progress>
                      <span className={`attendance-status ${status.level}`}>
                        {percentage}% — {status.label}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="demo-notice">Attendance values are fictional and for demonstration purposes only.</p>
    </section>
  )
}
