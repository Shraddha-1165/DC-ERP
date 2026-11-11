import HMCInformationSection from '../components/HMCInformationSection'
import { demoMessInformation, messMenuDocuments } from '../data/messInformation'

function PdfPlaceholder({ label, path, selected, available }) {
  return (
    <div className={`mess-document${selected ? ' selected' : ''}`}>
      <strong>{label}</strong>
      {selected ? <span className="mess-document-selected">Selected mess</span> : null}
      {available ? (
        <a className="document-file-button" href={path} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <>
          <span className="mess-document-unavailable">PDF not provided. Add the file at:</span>
          <code>{`public${path}`}</code>
        </>
      )}
    </div>
  )
}

function MessMenu({ mess }) {
  if (mess === 'No Mess') {
    return (
      <section className="hmc-information-section">
        <h2>Mess Menu</h2>
        <p className="mess-nil">NIL</p>
      </section>
    )
  }

  return (
    <section className="hmc-information-section">
      <h2>Mess Menu</h2>
      <div className="mess-document-list">
        {messMenuDocuments.map((document) => (
          <PdfPlaceholder
            key={document.mess}
            label={document.label}
            path={document.path}
            selected={document.mess === mess}
            available={document.available}
          />
        ))}
      </div>
    </section>
  )
}

function MessBill({ information }) {
  if (information.mess === 'No Mess') {
    return (
      <section className="hmc-information-section">
        <h2>Mess Bill</h2>
        <p className="mess-nil">NIL</p>
      </section>
    )
  }

  return (
    <section className="hmc-information-section">
      <h2>Mess Bill</h2>
      {information.billPdfAvailable && information.billPdfPath ? (
        <a className="document-file-button" href={information.billPdfPath} target="_blank" rel="noopener noreferrer">
          Mess Bill (PDF)
        </a>
      ) : (
        <div className="mess-document">
          <strong>Mess Bill (PDF)</strong>
          <span className="mess-document-unavailable">
            {information.billPdfPath
              ? 'PDF not provided. Add the file at:'
              : 'No mess bill PDF is available for this demo account.'}
          </span>
          {information.billPdfPath ? <code>{`public${information.billPdfPath}`}</code> : null}
        </div>
      )}
    </section>
  )
}

export default function MessInformationPage({ user, onHome, onHMC, onApplyForChange }) {
  const information = demoMessInformation[user?.studentId] ?? null
  const mess = information?.mess ?? 'Unknown / Unassigned'

  return (
    <section className="erp-detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onHome}>Home</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onHMC}>HMC</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onHMC}>HMC Information</button><span aria-hidden="true">›</span>
        <span aria-current="page">Mess Information</span>
      </nav>
      <div className="detail-page-heading">
        <h1>Mess Information</h1>
        <p>Sample demo data</p>
      </div>
      <div className="hmc-information">
        <HMCInformationSection title="Mess" fields={[[ 'Mess', mess ]]} />
        <MessMenu mess={mess} />
        {information ? (
          <MessBill information={information} />
        ) : (
          <section className="hmc-information-section">
            <h2>Mess Bill</h2>
            <p className="hmc-information-unavailable">Mess bill information is not available for this demo account.</p>
          </section>
        )}
      </div>
      <div className="panel-actions">
        <button type="button" className="document-file-button" onClick={onApplyForChange}>
          Apply for Mess Change
        </button>
      </div>
    </section>
  )
}
