import { useState } from 'react'
import Breadcrumb from './Breadcrumb'
import ModuleNavigation from './ModuleNavigation'
import TopNavbar from './TopNavbar'
import AcademicPage from '../pages/AcademicPage'
import AttendancePage from '../pages/AttendancePage'
import ApplyMessChangePage from '../pages/ApplyMessChangePage'
import HMCPage from '../pages/HMCPage'
import HMCInformationPage from '../pages/HMCInformationPage'
import HomeDashboard from '../pages/HomeDashboard'
import MessInformationPage from '../pages/MessInformationPage'
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
    if (label === 'Hostel and Room Information') {
      setPage('Hostel and Room Information')
      setExpandedItem('HMC Information')
      return
    }
    if (label === 'Mess Information') {
      setPage('Mess Information')
      setExpandedItem('HMC Information')
      return
    }
    if (label === 'Apply for Mess Change') {
      setPage('Apply for Mess Change')
      setExpandedItem('HMC Information')
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

  const returnToHMC = () => {
    setPage('HMC')
    setExpandedItem('HMC Information')
  }

  const returnToMessInformation = () => {
    setPage('Mess Information')
    setExpandedItem('HMC Information')
  }

  return (
    <div className="erp-dashboard">
      <TopNavbar user={user} onHome={() => navigate('Home')} onLogout={onLogout} />
      <ModuleNavigation
        activePage={['Hostel and Room Information', 'Mess Information', 'Apply for Mess Change'].includes(page) ? 'HMC' : page}
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
        {page === 'HMC' ? (
          <HMCPage
            expandedItem={expandedItem}
            onToggle={toggleAccordion}
            onSelectItem={(label) => openMenuItem(label, 'HMC', expandedItem)}
          />
        ) : null}
        {page === 'Hostel and Room Information' ? (
          <HMCInformationPage user={user} onHome={() => navigate('Home')} onHMC={returnToHMC} />
        ) : null}
        {page === 'Mess Information' ? (
          <MessInformationPage
            user={user}
            onHome={() => navigate('Home')}
            onHMC={returnToHMC}
            onApplyForChange={() => setPage('Apply for Mess Change')}
          />
        ) : null}
        {page === 'Apply for Mess Change' ? (
          <ApplyMessChangePage
            onHome={() => navigate('Home')}
            onMessInformation={returnToMessInformation}
            onHMC={returnToHMC}
          />
        ) : null}
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
