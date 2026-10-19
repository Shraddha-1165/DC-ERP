import { useMemo, useRef, useState } from 'react'
import { searchableMenuItems } from '../data/menuItems'

export default function SearchMenu({ onSelectResult }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return searchableMenuItems.filter(({ label, module, searchText }) => {
      const words = `${label} ${module} ${searchText || ''}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
      return words.some(
        (word) =>
          word === term ||
          (term.length >= 3 && word === `${term}s`) ||
          (term.length >= 4 && word.startsWith(term)),
      )
    })
  }, [query])

  const isOpen = isFocused && query.trim().length > 0

  const chooseResult = (item) => {
    onSelectResult(item)
    setQuery('')
    setActiveIndex(-1)
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (event) => {
    if (!isOpen || results.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      chooseResult(results[activeIndex])
    } else if (event.key === 'Escape') {
      setQuery('')
      setIsFocused(false)
    }
  }

  return (
    <div className="search-menu">
      <label className="visually-hidden" htmlFor="search-menu-input">
        Search Menu
      </label>
      <input
        ref={inputRef}
        id="search-menu-input"
        type="search"
        role="combobox"
        aria-label="Search Menu"
        aria-expanded={isOpen}
        aria-controls="search-menu-results"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        placeholder="Search Menu"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(-1)
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        onKeyDown={handleKeyDown}
      />
      {isOpen ? (
        <ul id="search-menu-results" className="search-results" role="listbox">
          {results.length ? (
            results.map((item, index) => (
              <li key={`${item.module}-${item.label}`}>
                <button
                  id={`search-result-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? 'search-result active' : 'search-result'}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseResult(item)}
                >
                  <span>{item.label}</span>
                  <small>{item.module}</small>
                </button>
              </li>
            ))
          ) : (
            <li className="search-empty" role="status">No matching menu items</li>
          )}
        </ul>
      ) : null}
    </div>
  )
}
