export const academicMenuItems = [
  { title: 'Feedback', items: ['Submit Feedback', 'View Feedback'] },
  { title: 'Fees', items: ['Fee Details', 'Payment History'] },
  { title: 'Result', items: ['Semester Results', 'Grade Card'] },
  { title: 'Scholarship', items: ['Scholarship Information', 'Application Status'] },
  {
    title: 'Students',
    items: [
      'Student Profile',
      'Personal Details',
      'Academic Details',
      'Upload Supporting Documents (New Admission)',
    ],
  },
  { title: 'Subjects', items: ['Course Registration', 'Registered Subjects', 'Attendance'] },
]

export const hmcMenuItems = [
  {
    title: 'HMC Information',
    items: ['Hostel Information', 'Room Information', 'Mess Information'],
  },
]

export const searchableMenuItems = [
  ...academicMenuItems.flatMap(({ title, items }) => [
    { label: title, module: 'Academic', section: title, searchText: items.join(' ') },
    ...items.map((label) => ({ label, module: 'Academic', section: title })),
  ]),
  ...hmcMenuItems.flatMap(({ title, items }) => [
    { label: title, module: 'HMC', section: title, searchText: items.join(' ') },
    ...items.map((label) => ({ label, module: 'HMC', section: title })),
  ]),
]
