const panelTitles = ['Notifications', 'Messages and Alerts', 'Other Actions']

export default function HomeDashboard() {
  return (
    <div className="home-panels" aria-label="Home dashboard panels">
      {panelTitles.map((title) => (
        <section className="home-panel" key={title}>
          <h2>{title}</h2>
          <div className="home-panel-content" />
        </section>
      ))}
    </div>
  )
}
