import AccordionPanel from '../components/AccordionPanel'
import { academicMenuItems } from '../data/menuItems'

export default function AcademicPage({ expandedItem, onToggle, onSelectItem }) {
  return (
    <div className="accordion-list">
      {academicMenuItems.map(({ title, items }) => (
        <AccordionPanel
          key={title}
          title={title}
          items={items}
          expanded={expandedItem === title}
          onToggle={() => onToggle(title)}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  )
}
