import { useState } from 'react'
import { documentCategories } from '../data/documentCategories'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png'])
const ACCEPTED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])

function getFileExtension(filename) {
  const dot = filename.lastIndexOf('.')
  return dot >= 0 ? filename.slice(dot).toLowerCase() : ''
}

export default function UploadSupportingDocumentsPage({ onHome, onAcademic }) {
  const [files, setFiles] = useState({})
  const [errors, setErrors] = useState({})

  const handleFileChange = (id, event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const extension = getFileExtension(file.name)
    if (!ACCEPTED_EXTENSIONS.has(extension) || (file.type && !ACCEPTED_MIME_TYPES.has(file.type))) {
      setErrors((current) => ({ ...current, [id]: 'Unsupported format. Choose a PDF, JPG, JPEG, or PNG file.' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((current) => ({ ...current, [id]: 'File exceeds the 5 MB per-file limit.' }))
      return
    }

    setFiles((current) => ({ ...current, [id]: file }))
    setErrors((current) => ({ ...current, [id]: '' }))
  }

  const removeFile = (id) => {
    setFiles((current) => ({ ...current, [id]: null }))
    setErrors((current) => ({ ...current, [id]: '' }))
  }

  return (
    <section className="erp-detail-page document-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onHome}>Home</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onAcademic}>Academic</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onAcademic}>Students</button><span aria-hidden="true">›</span>
        <span aria-current="page">Upload Supporting Documents</span>
      </nav>
      <div className="detail-page-heading">
        <h1>Upload Supporting Documents</h1>
        <p>New Admission</p>
      </div>

      <div className="document-instructions">
        <p>Select the documents required for your admission application. Requirements depend on your application and applicable categories.</p>
        <strong>Demo only: files are not submitted to any institution.</strong>
      </div>

      <div className="erp-field application-number">
        <label htmlFor="demo-application-number">Application number</label>
        <input id="demo-application-number" type="text" value="DEMO-APP-2026-001" readOnly />
        <small>Fictional demo application number</small>
      </div>

      <div className="document-checklist">
        {documentCategories.map(({ id, name, requirement }) => {
          const file = files[id]
          const error = errors[id]
          const inputId = `document-file-${id}`
          return (
            <section className="document-row" key={id}>
              <div className="document-row-heading">
                <h2>{name}</h2>
                <span className={`requirement-badge ${requirement === 'Required' ? 'required' : 'optional'}`}>
                  {requirement}
                </span>
              </div>
              <div className="document-file-controls">
                <input
                  id={inputId}
                  className="visually-hidden"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  aria-label={`Select ${name} file`}
                  aria-describedby={`${inputId}-help ${inputId}-error`}
                  onChange={(event) => handleFileChange(id, event)}
                />
                <label className="document-file-button" htmlFor={inputId}>
                  {file ? 'Replace file' : 'Select file'}
                </label>
                {file ? (
                  <>
                    <span className="document-filename" title={file.name}>{file.name}</span>
                    <button type="button" className="document-remove" onClick={() => removeFile(id)}>
                      Remove
                    </button>
                  </>
                ) : <span className="document-filename">No file selected</span>}
                <span className={`document-status ${file ? 'selected' : ''}`} role="status">
                  {file ? 'Selected locally — not submitted' : 'Not selected'}
                </span>
              </div>
              <small id={`${inputId}-help`} className="document-help">PDF, JPG, JPEG, or PNG. Maximum 5 MB per file.</small>
              <small id={`${inputId}-error`} className="document-error" role="alert">{error}</small>
            </section>
          )
        })}
      </div>
    </section>
  )
}
