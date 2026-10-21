import { demoHmcInformation } from '../data/hmcInformation'
import HMCInformationSection from '../components/HMCInformationSection'

function HMCInformation({ information }) {
  if (!information) {
    return <p className="hmc-information-unavailable">HMC information is not available for this demo account.</p>
  }

  return (
    <div className="hmc-information">
      <p className="hmc-demo-label">Sample demo data</p>
      <HMCInformationSection
        title="Hostel Information"
        fields={[
          ['Hostel code', information.hostel],
          ['Hostel name', information.hostelName],
        ]}
      />
      <HMCInformationSection
        title="Room Information"
        fields={[
          ['Permanent room number', information.permanentRoomNo],
          ['Temporary room number', information.temporaryRoomNo || 'Not Assigned'],
          ['Occupancy', information.occupancy],
        ]}
      />
      <section className="hmc-information-section">
        <h2>Roommate Information</h2>
        {information.occupancy === 'Single' ? (
          <dl className="hmc-information-grid">
            <div className="hmc-information-field">
              <dt>Roommate</dt>
              <dd>NIL</dd>
            </div>
          </dl>
        ) : information.roommate ? (
          <>
            <p className="hmc-demo-label">Sample roommate details (demo data)</p>
            <dl className="hmc-information-grid">
              {[
                ['Name', information.roommate.name],
                ['Branch', information.roommate.branch],
                ['Roll number', information.roommate.rollNo],
                ['Contact number', information.roommate.contactNo],
              ].map(([label, value]) => (
                <div className="hmc-information-field" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="hmc-information-unavailable">Roommate information not available</p>
        )}
      </section>
    </div>
  )
}

export default function HMCInformationPage({ user, onHome, onHMC }) {
  const information = demoHmcInformation[user?.studentId]

  return (
    <section className="erp-detail-page">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onHome}>Home</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onHMC}>HMC</button><span aria-hidden="true">›</span>
        <button type="button" onClick={onHMC}>HMC Information</button><span aria-hidden="true">›</span>
        <span aria-current="page">Hostel and Room Information</span>
      </nav>
      <div className="detail-page-heading">
        <h1>Hostel and Room Information</h1>
      </div>
      <HMCInformation information={information} />
    </section>
  )
}
