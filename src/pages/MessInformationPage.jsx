import HMCInformationSection from '../components/HMCInformationSection'
import { demoMessInformation, messMenuDocuments } from '../data/messInformation'

function PdfPlaceholder({ label, path, selected, available }) {
  return (
    <div className={`mess-document${selected ? ' selected' : ''}`}>
      <strong>{label}</strong>
      {selected ? <span className="mess-document-selected">Selected mess</span> : null}
      {available ? (
        <a className="document-file-button" href={path} target="_blank" rel="noreferrer">
          Open PDF
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
        <a className="document-file-button" href={information.billPdfPath} target="_blank" rel="noreferrer">
          Mess Bill (PDF)
        </a>
      ) : (
        <div className="mess-document">
          <strong>Mess Bill (PDF)</strong>
          <span className="mess-document-unavailable">PDF not provided. Add the file at:</span>
          <code>{`public${information.billPdfPath}`}</code>
        </div>
      )}
    </section>
  )
}

export default function MessInformationPage({ user, onHome, onHMC, onApplyForChange }) {
  const information = demoMessInformation[user?.studentId]

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
      {information ? (
        <div className="hmc-information">
          <HMCInformationSection title="Mess" fields={[[ 'Mess', information.mess ]]} />
          <MessMenu mess={information.mess} />
          <MessBill information={information} />
        </div>
      ) : (
        <p className="hmc-information-unavailable">Mess information is not available for this demo account.</p>
      )}
      <div className="panel-actions">
        <button type="button" className="document-file-button" onClick={onApplyForChange}>
          Apply for Mess Change
        </button>
      </div>
    </section>
  )
}
