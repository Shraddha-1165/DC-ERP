import { useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FormField from '../components/FormField'
import SelectField from '../components/SelectField'
import CaptchaMock from '../components/CaptchaMock'
import DemoDashboard from '../components/DemoDashboard'
import { demoUsers } from '../data/demoUsers'
import { programOptions, securityQuestions, stakeholderOptions } from '../data/options'

const emptySignUp = {
  stakeholderType: '',
  program: '',
  registrationNumber: '',
  stakeholderCode: '',
  stakeholderName: '',
  loginId: '',
  password: '',
  confirmPassword: '',
  alias: '',
  passphrase: '',
  confirmPassphrase: '',
  dob: '',
  securityQuestionOne: '',
  securityAnswerOne: '',
  securityQuestionTwo: '',
  securityAnswerTwo: '',
  securityQuestionThree: '',
  securityAnswerThree: '',
  captcha: '',
  otp: '',
}

const emptyForgot = {
  recoveryLoginId: '',
  recoveryPassword: '',
  recoveryQuestion: '',
  recoveryAnswer: '',
  recoveryStakeholder: '',
  recoveryDob: '',
  recoveryOtp: '',
}

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 5; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (!password) {
    return { label: 'No password', value: 0 }
  }
  if (score <= 2) return { label: 'Weak', value: 25 }
  if (score <= 3) return { label: 'Moderate', value: 50 }
  if (score <= 4) return { label: 'Strong', value: 75 }
  return { label: 'Very strong', value: 100 }
}

export default function LoginPage() {
  const [view, setView] = useState('signin')
  const [loginForm, setLoginForm] = useState({
    loginId: '',
    password: '',
    remember: false,
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signUpForm, setSignUpForm] = useState(emptySignUp)
  const [forgotForm, setForgotForm] = useState(emptyForgot)
  const [changePasswordForm, setChangePasswordForm] = useState({
    loginId: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [resetAccountForm, setResetAccountForm] = useState({
    loginId: '',
    username: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [demoUser, setDemoUser] = useState(null)
  const [captchaValue, setCaptchaValue] = useState(() => generateCaptcha())
  const [showSignature, setShowSignature] = useState(false)
  const [otpValue, setOtpValue] = useState('123456')

  const signUpProgramOptions = useMemo(
    () => programOptions[signUpForm.stakeholderType] || [],
    [signUpForm.stakeholderType],
  )

  const passwordStrength = useMemo(
    () => getPasswordStrength(changePasswordForm.newPassword),
    [changePasswordForm.newPassword],
  )

  const updateLoginForm = (event) => {
    const { name, value, type, checked } = event.target
    setLoginForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const updateSignUpForm = (event) => {
    const { name, value } = event.target
    setSignUpForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'stakeholderType' ? { program: '' } : {}),
    }))
  }

  const updateForgotForm = (event) => {
    const { name, value } = event.target
    setForgotForm((current) => ({ ...current, [name]: value }))
  }

  const updateChangePasswordForm = (event) => {
    const { name, value } = event.target
    setChangePasswordForm((current) => ({ ...current, [name]: value }))
  }

  const resetStatus = (type, message) => setStatus({ type, message })

  const handleSignIn = (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    setTimeout(() => {
      const match = demoUsers.find(
        (user) => user.loginId === loginForm.loginId && user.password === loginForm.password,
      )

      if (!match) {
        setStatus({ type: 'error', message: 'Invalid demo credentials.' })
        setLoading(false)
        return
      }

      setDemoUser(match)
      setView('dashboard')
      setStatus({ type: 'success', message: 'Demo Login Successful' })
      setLoading(false)
    }, 600)
  }

  const handleSignUp = (event) => {
    event.preventDefault()

    if (!signUpForm.stakeholderType || !signUpForm.program) {
      resetStatus('error', 'Select a stakeholder type and program.')
      return
    }

    if (!signUpForm.loginId || !signUpForm.stakeholderName || !signUpForm.password) {
      resetStatus('error', 'Please complete the required account fields.')
      return
    }

    if (signUpForm.captcha.toUpperCase() !== captchaValue) {
      resetStatus('error', 'Incorrect demo CAPTCHA.')
      return
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      resetStatus('error', 'Passwords do not match.')
      return
    }

    if (signUpForm.otp !== otpValue) {
      resetStatus('error', 'Incorrect demo OTP.')
      return
    }

    setStatus({ type: 'success', message: 'Demo account created successfully.' })
    setSignUpForm({ ...emptySignUp, captcha: '', otp: '' })
    setCaptchaValue(generateCaptcha())
  }

  const handleForgotSubmit = (event) => {
    event.preventDefault()

    if (forgotForm.recoveryOtp !== otpValue) {
      resetStatus('error', 'Incorrect demo OTP.')
      return
    }

    setStatus({ type: 'success', message: 'Account recovery guidance prepared for demo review.' })
  }

  const handleChangePassword = (event) => {
    event.preventDefault()

    if (!changePasswordForm.loginId || !changePasswordForm.currentPassword) {
      resetStatus('error', 'Please complete the required password fields.')
      return
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmNewPassword) {
      resetStatus('error', 'Passwords do not match.')
      return
    }

    const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!passwordRules.test(changePasswordForm.newPassword)) {
      resetStatus('error', 'Password must contain 8+ characters, uppercase, lowercase, number, and special character.')
      return
    }

    setStatus({ type: 'success', message: 'Demo password changed successfully.' })
    setChangePasswordForm({
      loginId: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })
  }

  const handleResetAccount = (event) => {
    event.preventDefault()
    if (!resetAccountForm.loginId || !resetAccountForm.username) {
      resetStatus('error', 'Please enter the required reset details.')
      return
    }

    setStatus({ type: 'success', message: 'Demo account reset link prepared.' })
  }

  const handleOtpSend = () => {
    setOtpValue('123456')
    resetStatus('info', 'Demo OTP sent locally: 123456')
  }

  const handleBackToSignIn = () => {
    setStatus({ type: '', message: '' })
    setView('signin')
  }

  const renderStatus = status.message ? (
    <div className={`alert-box ${status.type || 'info'}`} role="alert">
      {status.message}
    </div>
  ) : null

  const renderSignin = (
    <form onSubmit={handleSignIn} noValidate>
      <div className="panel-header">
        <h2>Sign In</h2>
        <p>Sign in with your ERP demo account.</p>
      </div>
      <div className="form-body signin-form-body">
        {renderStatus}
        <div className="form-grid">
          <div className="full-span">
            <FormField
              label="Email / Login ID"
              name="loginId"
              type="email"
              value={loginForm.loginId}
              onChange={updateLoginForm}
              placeholder="Enter your account email"
              required
              autoComplete="email"
            />
          </div>

          <div className="full-span">
            <FormField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={updateLoginForm}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            >
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </FormField>
          </div>

          <div className="full-span">
            <label className="check-row" htmlFor="rememberMe">
              <input
                id="rememberMe"
                className="checkbox-input"
                type="checkbox"
                name="remember"
                checked={loginForm.remember}
                onChange={updateLoginForm}
              />
              Remember me
            </label>
          </div>
        </div>

        <div className="login-actions">
          <div className="login-secondary-actions">
            <button type="button" className="secondary-button" onClick={() => setView('signup')}>
              Sign Up
            </button>
            <button type="button" className="link-style" onClick={() => setView('forgot')}>
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </div>
    </form>
  )

  const renderSignup = (
    <form className="signup-form" onSubmit={handleSignUp} noValidate>
      <div className="panel-header">
        <h2>Sign Up</h2>
        <p>Register your stakeholder details to create a demo portal account.</p>
      </div>
      <div className="form-body">
        {renderStatus}
        <section className="signup-section" aria-labelledby="signup-user-heading">
          <h3 id="signup-user-heading">New User Sign Up</h3>
          <div className="signup-fields">
            <SelectField
              label="Stakeholder Type"
              name="stakeholderType"
              value={signUpForm.stakeholderType}
              options={stakeholderOptions}
              placeholder="Select stakeholder type"
              onChange={updateSignUpForm}
            />
            <FormField
              label="Stakeholder Code"
              name="stakeholderCode"
              value={signUpForm.stakeholderCode}
              onChange={updateSignUpForm}
              placeholder="Enter stakeholder code"
            />
            <FormField
              label="Stakeholder Name"
              name="stakeholderName"
              value={signUpForm.stakeholderName}
              onChange={updateSignUpForm}
              placeholder="Enter stakeholder name"
            />
            <FormField
              label="Your Login ID"
              name="loginId"
              type="email"
              value={signUpForm.loginId}
              onChange={updateSignUpForm}
              placeholder="Enter your account email"
              autoComplete="email"
              required
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              value={signUpForm.password}
              onChange={updateSignUpForm}
              placeholder="Enter password"
            />
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={signUpForm.confirmPassword}
              onChange={updateSignUpForm}
              placeholder="Re-enter password"
            />
          </div>

          <div className="signup-additional-fields">
            <SelectField
              label="Entrance Exam / Program"
              name="program"
              value={signUpForm.program}
              options={signUpProgramOptions}
              placeholder="Select program"
              onChange={updateSignUpForm}
            />
            <FormField
              label="Registration / Application Number"
              name="registrationNumber"
              value={signUpForm.registrationNumber}
              onChange={updateSignUpForm}
              placeholder="Enter registration or application number"
            />
          </div>
        </section>

        <section className="signup-section" aria-labelledby="signup-signature-heading">
          <h3 id="signup-signature-heading">Digital Signature Information</h3>
          <div className="signup-fields">
            <FormField
              label="Alias"
              name="alias"
              value={signUpForm.alias}
              onChange={updateSignUpForm}
              placeholder="Choose an alias"
            />
            <FormField
              label="Passphrase"
              name="passphrase"
              type="password"
              value={signUpForm.passphrase}
              onChange={updateSignUpForm}
              placeholder="Create a passphrase"
            />
            <FormField
              label="Confirm Passphrase"
              name="confirmPassphrase"
              type="password"
              value={signUpForm.confirmPassphrase}
              onChange={updateSignUpForm}
              placeholder="Confirm passphrase"
            />
            <div className="signup-signature-control">
              <button type="button" className="secondary-button" onClick={() => setShowSignature((current) => !current)}>
                {showSignature ? 'Hide Digital Signature' : 'Add Digital Signature'}
              </button>
              {showSignature ? (
                <div className="signature-input">
                  <label htmlFor="demo-signature">Digital Signature</label>
                  <input id="demo-signature" type="text" placeholder="Type your name as a signature" />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="signup-section" aria-labelledby="signup-verification-heading">
          <h3 id="signup-verification-heading">Information for Verification</h3>
          <div className="signup-fields">
            <FormField
              label="Date of Birth (DD-MM-YYYY)"
              name="dob"
              type="date"
              value={signUpForm.dob}
              onChange={updateSignUpForm}
            />
          </div>
        </section>

        <section className="signup-section" aria-labelledby="signup-security-heading">
          <h3 id="signup-security-heading">Security Questions</h3>
          <p className="security-question-notice">These security questions may be asked during login to verify your identity.</p>
          <div className="security-question-list">
            {[
              { questionLabel: 'First Question', questionName: 'securityQuestionOne', answerLabel: 'First Answer', answerName: 'securityAnswerOne' },
              { questionLabel: 'Second Question', questionName: 'securityQuestionTwo', answerLabel: 'Second Answer', answerName: 'securityAnswerTwo' },
              { questionLabel: 'Third Question', questionName: 'securityQuestionThree', answerLabel: 'Third Answer', answerName: 'securityAnswerThree' },
            ].map(({ questionLabel, questionName, answerLabel, answerName }) => (
              <div className="security-question-pair" key={questionName}>
                <SelectField
                  label={questionLabel}
                  name={questionName}
                  value={signUpForm[questionName]}
                  options={securityQuestions}
                  placeholder="Select a security question"
                  onChange={updateSignUpForm}
                />
                <FormField
                  label={answerLabel}
                  name={answerName}
                  value={signUpForm[answerName]}
                  onChange={updateSignUpForm}
                  placeholder="Enter your answer"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="signup-section signup-confirm-section" aria-labelledby="signup-confirm-heading">
          <h3 id="signup-confirm-heading">Confirm</h3>
          <div className="signup-fields">
            <CaptchaMock
              value={captchaValue}
              onChange={(event) => setSignUpForm((current) => ({ ...current, captcha: event.target.value }))}
              onRefresh={() => setCaptchaValue(generateCaptcha())}
            />
            <div className="otp-row">
              <FormField
                label="Demo OTP"
                name="otp"
                value={signUpForm.otp}
                onChange={updateSignUpForm}
                placeholder="Enter the demo OTP"
              />
              <button type="button" className="secondary-button" onClick={handleOtpSend}>
                Send OTP
              </button>
              <p className="form-note">Demo OTP: 123456</p>
            </div>
          </div>

          <div className="panel-actions">
            <button type="button" className="ghost-button" onClick={handleBackToSignIn}>
              Back to Sign In
            </button>
            <button type="submit" className="primary-button">
              Sign Up
            </button>
          </div>
        </section>
      </div>
    </form>
  )

  const renderForgot = (
    <form onSubmit={handleForgotSubmit} noValidate>
      <div className="panel-header">
        <h2>Forgot Password</h2>
        <p>Verify your demo account details to recover access.</p>
      </div>
      <div className="form-body">
        {renderStatus}
        <div className="form-grid">
          <div className="full-span">
            <FormField
              label="Login ID"
              name="recoveryLoginId"
              value={forgotForm.recoveryLoginId}
              onChange={updateForgotForm}
              placeholder="Enter your login ID"
              required
            />
          </div>
          <div className="full-span">
            <FormField label="Registered Password" name="recoveryPassword" type="password" value={forgotForm.recoveryPassword} onChange={updateForgotForm} placeholder="Enter registered password" />
          </div>
          <div className="full-span">
            <SelectField
              label="Security Question"
              name="recoveryQuestion"
              value={forgotForm.recoveryQuestion}
              options={securityQuestions}
              placeholder="Select a security question"
              onChange={updateForgotForm}
            />
          </div>
          <div className="full-span">
            <FormField label="Security Answer" name="recoveryAnswer" value={forgotForm.recoveryAnswer} onChange={updateForgotForm} placeholder="Enter your answer" />
          </div>
          <div className="full-span">
            <SelectField
              label="Stakeholder Type"
              name="recoveryStakeholder"
              value={forgotForm.recoveryStakeholder}
              options={stakeholderOptions}
              placeholder="Select stakeholder type"
              onChange={updateForgotForm}
            />
          </div>
          <div className="full-span">
            <FormField label="Date of Birth" name="recoveryDob" type="date" value={forgotForm.recoveryDob} onChange={updateForgotForm} />
          </div>
          <div className="full-span">
            <div className="otp-row">
              <FormField label="Demo OTP" name="recoveryOtp" value={forgotForm.recoveryOtp} onChange={updateForgotForm} placeholder="Enter the demo OTP" />
              <button type="button" className="secondary-button" onClick={handleOtpSend}>Send OTP</button>
            </div>
            <p className="form-note">Demo OTP: 123456</p>
          </div>
        </div>

        <div className="panel-actions">
          <button type="button" className="ghost-button" onClick={handleBackToSignIn}>
            Back to Sign In
          </button>
          <button type="submit" className="primary-button">
            Recover Account
          </button>
        </div>
      </div>
    </form>
  )

  const renderChangePassword = (
    <form onSubmit={handleChangePassword} noValidate>
      <div className="panel-header">
        <h2>Change Password</h2>
        <p>Update the demo account password securely.</p>
      </div>
      <div className="form-body">
        {renderStatus}
        <div className="form-grid">
          <div className="full-span">
            <FormField label="Login ID" name="loginId" value={changePasswordForm.loginId} onChange={updateChangePasswordForm} placeholder="Enter login ID" />
          </div>

          <div className="full-span">
            <FormField label="Current Password" name="currentPassword" type="password" value={changePasswordForm.currentPassword} onChange={updateChangePasswordForm} placeholder="Enter current password" />
          </div>

          <div className="full-span">
            <FormField label="New Password" name="newPassword" type="password" value={changePasswordForm.newPassword} onChange={updateChangePasswordForm} placeholder="Enter new password" />
          </div>

          <div className="full-span">
            <FormField label="Confirm New Password" name="confirmNewPassword" type="password" value={changePasswordForm.confirmNewPassword} onChange={updateChangePasswordForm} placeholder="Confirm new password" />
          </div>

          <div className="full-span">
            <div className="password-strength">
              <div className="strength-meter" aria-live="polite">
                <div
                  className="strength-fill"
                  style={{ width: `${passwordStrength.value}%`, background: passwordStrength.value < 50 ? '#d63b3b' : passwordStrength.value < 75 ? '#d08a12' : '#249c62' }}
                />
              </div>
              <div className="form-note">Password strength: {passwordStrength.label}</div>
            </div>
            <p className="form-note">
              Minimum 8 characters; at least one uppercase, lowercase, number, and special character.
            </p>
          </div>
        </div>

        <div className="panel-actions">
          <button type="button" className="ghost-button" onClick={handleBackToSignIn}>
            Back to Sign In
          </button>
          <button type="submit" className="primary-button">
            Update Password
          </button>
        </div>
      </div>
    </form>
  )

  const renderReset = (
    <form onSubmit={handleResetAccount} noValidate>
      <div className="panel-header">
        <h2>Reset Account</h2>
        <p>Enter the account details to complete the demo reset flow.</p>
      </div>
      <div className="form-body">
        {renderStatus}
        <div className="form-grid">
          <div className="full-span">
            <FormField label="Login ID" name="loginId" value={resetAccountForm.loginId} onChange={(event) => setResetAccountForm((current) => ({ ...current, loginId: event.target.value }))} placeholder="Enter login ID" />
          </div>
          <div className="full-span">
            <FormField label="Username" name="username" value={resetAccountForm.username} onChange={(event) => setResetAccountForm((current) => ({ ...current, username: event.target.value }))} placeholder="Enter username" />
          </div>
        </div>

        <div className="panel-actions">
          <button type="button" className="ghost-button" onClick={handleBackToSignIn}>
            Back to Sign In
          </button>
          <button type="submit" className="primary-button">
            Verify Account
          </button>
        </div>
      </div>
    </form>
  )

  if (view === 'dashboard') {
    return (
      <DemoDashboard
        user={demoUser}
        onLogout={() => {
          setDemoUser(null)
          setLoginForm({ loginId: '', password: '', remember: false })
          setStatus({ type: '', message: '' })
          setView('signin')
        }}
      />
    )
  }

  let activeView = renderSignin
  if (view === 'signup') activeView = renderSignup
  if (view === 'forgot') activeView = renderForgot
  if (view === 'changepassword') activeView = renderChangePassword
  if (view === 'reset') activeView = renderReset
  return (
    <div className="portal-shell">
      <Header />
      <main className="page-container">
        <div className={`panel-card${view === 'signin' ? ' login-panel' : ''}`}>{activeView}</div>
      </main>
      <Footer />
    </div>
  )
}
