import { useState, FormEvent } from 'react'
import { loginUser } from '../api/auth'
import styles from './LoginPage.module.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Invalid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [apiError, setApiError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validationErrors = validate(email, password)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setApiError('')
    setStatus('loading')

    try {
      await loginUser(email.trim(), password)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setApiError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🔐</div>
        </div>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <span role="alert" className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <span role="alert" className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.checkboxField}>
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>Remember Me</label>
          </div>

          {status === 'error' && (
            <div role="alert" className={styles.alertError}>
              ⚠ {apiError}
            </div>
          )}

          {status === 'success' && (
            <div role="status" className={styles.alertSuccess}>
              ✓ Login successful! Welcome back.
            </div>
          )}

          <button type="submit" disabled={status === 'loading'} className={styles.button}>
            {status === 'loading' ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className={styles.signupText}>
          Don't have an account? <a href="#" className={styles.signupLink}>Sign up</a>
        </p>
      </div>
    </div>
  )
}
