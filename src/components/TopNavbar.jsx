function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="erp-icon erp-home-icon">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="erp-icon">
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
    </svg>
  )
}

export default function TopNavbar({ user, onHome, onLogout }) {
  const displayName = user?.name === 'Demo Student' ? 'Demo Student' : user?.name || 'Demo User'
  const demoId = user?.demoId || 'DEMO1001'

  return (
    <header className="erp-topbar">
      <div className="erp-brand">ERP System (Beta), IITJ</div>
      <nav className="topbar-home" aria-label="Main navigation">
        <button type="button" className="topbar-action" onClick={onHome}>
          <HomeIcon />
          <span>Home</span>
        </button>
      </nav>
      <div className="topbar-user">
        <strong>Welcome {displayName} ({demoId})</strong>
        <button type="button" className="topbar-action" onClick={onLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
