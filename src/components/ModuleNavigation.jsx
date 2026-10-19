import SearchMenu from './SearchMenu'

function AcademicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="module-icon">
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 11v5c3.7 2.7 8.3 2.7 12 0v-5M22 9v6" />
    </svg>
  )
}

function HmcIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="module-icon">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5v1H3zM15 14c3.6-.4 6 1.4 6 4v1h-4" />
    </svg>
  )
}

export default function ModuleNavigation({ activePage, onNavigate, onSelectResult }) {
  return (
    <nav className="module-navigation" aria-label="ERP modules">
      <div className="module-links">
        <button
          type="button"
          className={`module-link${activePage === 'Academic' ? ' active' : ''}`}
          aria-current={activePage === 'Academic' ? 'page' : undefined}
          onClick={() => onNavigate('Academic')}
        >
          <AcademicIcon />
          <span>Academic</span>
        </button>
        <button
          type="button"
          className={`module-link${activePage === 'HMC' ? ' active' : ''}`}
          aria-current={activePage === 'HMC' ? 'page' : undefined}
          onClick={() => onNavigate('HMC')}
        >
          <HmcIcon />
          <span>HMC</span>
        </button>
      </div>
      <SearchMenu onSelectResult={onSelectResult} />
    </nav>
  )
}
