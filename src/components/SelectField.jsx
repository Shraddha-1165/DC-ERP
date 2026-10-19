export default function SelectField({
  label,
  name,
  value,
  options = [],
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="field-group">
      {label ? (
        <label htmlFor={name} className="field-label">
          {label}
        </label>
      ) : null}
      <div className="input-shell">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="text-input select-input"
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
