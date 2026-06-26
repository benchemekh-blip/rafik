import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { signUpUser } from '../api/auth'
import styles from './SignUpPage.module.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validate(name: string, email: string, password: string, confirmPassword: string): FormErrors {
  const errors: FormErrors = {}
  const trimmedEmail = email.trim()

  if (!name.trim()) {
    errors.name = 'Full name is required'
  }

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

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [apiError, setApiError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validationErrors = validate(name, email, password, confirmPassword)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setApiError('')
    setStatus('loading')

    try {
      await signUpUser(name.trim(), email.trim(), password)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setApiError(err instanceof Error ? err.message : 'Sign up failed')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✨</div>
        </div>
        <h1 className={styles.heading}>Create an account</h1>
        <p className={styles.subheading}>Join us today — it's free</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="Jane Doe"
            />
            {errors.name && <span role="alert" className={styles.errorText}>{errors.name}</span>}
          </div>

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
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <span role="alert" className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <span role="alert" className={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          {status === 'error' && (
            <div role="alert" className={styles.alertError}>
              ⚠ {apiError}
            </div>
          )}

          {status === 'success' && (
            <div role="status" className={styles.alertSuccess}>
              ✓ Account created! Welcome aboard.
            </div>
          )}

          <button type="submit" disabled={status === 'loading'} className={styles.button}>
            {status === 'loading' ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className={styles.loginText}>
          Already have an account? <Link to="/" className={styles.loginLink}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
