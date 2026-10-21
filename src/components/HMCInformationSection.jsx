export default function HMCInformationSection({ title, fields }) {
  return (
    <section className="hmc-information-section">
      <h2>{title}</h2>
      <dl className="hmc-information-grid">
        {fields.map(([label, value]) => (
          <div className="hmc-information-field" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
