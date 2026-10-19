import { useState } from 'react'
import Breadcrumb from './Breadcrumb'
import ModuleNavigation from './ModuleNavigation'
import TopNavbar from './TopNavbar'
import AcademicPage from '../pages/AcademicPage'
import AttendancePage from '../pages/AttendancePage'
import HMCPage from '../pages/HMCPage'
import HomeDashboard from '../pages/HomeDashboard'
import UploadSupportingDocumentsPage from '../pages/UploadSupportingDocumentsPage'

export default function DemoDashboard({ user, onLogout }) {
  const [page, setPage] = useState('Home')
  const [expandedItem, setExpandedItem] = useState('')

  const navigate = (destination) => {
    setPage(destination)
    setExpandedItem('')
  }

  const openMenuItem = (label, module, section) => {
    if (label === 'Attendance') {
      setPage('Attendance')
      setExpandedItem('Subjects')
      return
    }
    if (label === 'Upload Supporting Documents (New Admission)') {
      setPage('Upload Documents')
      setExpandedItem('Students')
      return
    }
    setPage(module)
    setExpandedItem(section)
  }

  const selectSearchResult = ({ label, module, section }) => {
    openMenuItem(label, module, section)
  }

  const toggleAccordion = (title) => {
    setExpandedItem((current) => (current === title ? '' : title))
  }

  const returnToAcademic = (section) => {
    setPage('Academic')
    setExpandedItem(section)
  }

  return (
    <div className="erp-dashboard">
      <TopNavbar user={user} onHome={() => navigate('Home')} onLogout={onLogout} />
      <ModuleNavigation
        activePage={page}
        onNavigate={navigate}
        onSelectResult={selectSearchResult}
      />
      <main>
        <Breadcrumb page={page} />
        {page === 'Home' ? <HomeDashboard /> : null}
        {page === 'Academic' ? (
          <AcademicPage
            expandedItem={expandedItem}
            onToggle={toggleAccordion}
            onSelectItem={(label) => openMenuItem(label, 'Academic', expandedItem)}
          />
        ) : null}
        {page === 'HMC' ? <HMCPage expandedItem={expandedItem} onToggle={toggleAccordion} /> : null}
        {page === 'Attendance' ? (
          <AttendancePage onHome={() => navigate('Home')} onAcademic={() => returnToAcademic('Subjects')} />
        ) : null}
        {page === 'Upload Documents' ? (
          <UploadSupportingDocumentsPage
            onHome={() => navigate('Home')}
            onAcademic={() => returnToAcademic('Students')}
          />
        ) : null}
      </main>
      <div className="erp-demo-label">Demo / Educational Mockup</div>
    </div>
  )
}
