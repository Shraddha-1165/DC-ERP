import { useId } from 'react'

export default function AccordionPanel({ title, items, expanded, onToggle, onSelectItem, children }) {
  const contentId = useId()

  return (
    <section className="accordion-panel">
      <h2 className="accordion-heading">
        <button
          type="button"
          className="accordion-trigger"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span className="accordion-symbol" aria-hidden="true">{expanded ? '−' : '+'}</span>
          <span>{title}</span>
        </button>
      </h2>
      <div id={contentId} className="accordion-content" hidden={!expanded}>
        {children}
        {items.length > 0 ? (
          <ul>
            {items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="submenu-link"
                  onClick={() => onSelectItem?.(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
