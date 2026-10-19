import AccordionPanel from '../components/AccordionPanel'
import { hmcMenuItems } from '../data/menuItems'

export default function HMCPage({ expandedItem, onToggle, onSelectItem }) {
  return (
    <div className="accordion-list">
      {hmcMenuItems.map(({ title, items }) => (
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
