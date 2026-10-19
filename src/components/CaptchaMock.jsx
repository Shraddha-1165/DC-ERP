export default function CaptchaMock({ value, onChange, onRefresh, label = 'Demo CAPTCHA' }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="captcha-panel">
        <div className="captcha-display" aria-label="Demo CAPTCHA code">
          <span>{value}</span>
        </div>
        <button type="button" className="secondary-button captcha-refresh" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      <div className="input-shell">
        <input
          type="text"
          name="captcha"
          className="text-input"
          placeholder="Enter the code shown above"
          onChange={onChange}
        />
      </div>
    </div>
  )
}
