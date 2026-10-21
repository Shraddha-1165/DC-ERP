import { useState } from 'react'

const messOptions = ['Veg', 'Non-Veg', 'No Mess']

function createMonthOptions() {
  const currentMonth = new Date()
  currentMonth.setDate(1)

  return Array.from({ length: 12 }, (_, index) => {
    const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + index, 1)
    return {
      value: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
      label: month.toLocaleString('en', { month: 'long', year: 'numeric' }),
    }
  })
}

export default function ApplyMessChangePage({ onHome, onMessInformation, onHMC }) {
  const [mess, setMess] = useState('')
  const [month, setMonth] = useState('')
  const [status, setStatus] = useState(null)
  const months = createMonthOptions()

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!mess || !month) {
      setStatus({ type: 'error', message: 'Select a mess option and month before submitting.' })
      return
    }

    const monthLabel = months.find((option) => option.value === month)?.label
    setStatus({
      type: 'success',
      message: `Demo application prepared for ${monthLabel}. It has not been sent or saved.`,
    })
  }

  return (
    <section className="erp-detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onHome}>Home</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onHMC}>HMC</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onMessInformation}>Mess Information</button><span aria-hidden="true">›</span>
        <span aria-current="page">Apply for Mess Change</span>
      </nav>
      <div className="detail-page-heading">
        <h1>Mess Change Application</h1>
        <p>Frontend demonstration only. This application will not be sent or saved.</p>
      </div>
      <form className="mess-change-form" onSubmit={handleSubmit} noValidate>
        <div className="erp-field">
          <label htmlFor="mess-change-option">Mess Options</label>
          <select
            id="mess-change-option"
            value={mess}
            onChange={(event) => setMess(event.target.value)}
            aria-required="true"
          >
            <option value="">Select mess option</option>
            {messOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="erp-field">
          <label htmlFor="mess-change-month">Change For</label>
          <select
            id="mess-change-month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            aria-required="true"
          >
            <option value="">Select month and year</option>
            {months.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {status ? (
          <p className={`mess-change-status ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
            {status.message}
          </p>
        ) : null}
        <div className="panel-actions">
          <button type="submit" className="document-file-button">Submit Application</button>
          <button type="button" className="document-file-button" onClick={onMessInformation}>
            Back to Mess Information
          </button>
        </div>
      </form>
    </section>
  )
}
