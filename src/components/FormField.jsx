export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  children,
}) {
  return (
    <div className="field-group">
      {label ? (
        <label htmlFor={name} className="field-label">
          {label}
        </label>
      ) : null}
      <div className="input-shell">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="text-input"
        />
        {children}
      </div>
    </div>
  )
}
