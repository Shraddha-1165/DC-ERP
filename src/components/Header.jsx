export default function Header() {
  return (
    <header className="top-header">
      <div className="brand-block">
        <img
          className="brand-logo"
          src="/assets/iit-jodhpur-logo.png"
          alt="Indian Institute of Technology Jodhpur logo"
        />
        <div className="brand-copy">
          <h1>ERP Portal</h1>
          <p className="header-subtitle">Indian Institute of Technology Jodhpur</p>
          <span className="beta-pill">Beta Version</span>
        </div>
      </div>
      <p className="demo-banner">Demo / Educational Mockup</p>
    </header>
  )
}
