import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import styles from './ForgotPasswordPage.module.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [apiError, setApiError] = useState('')
  const [resetToken, setResetToken] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) {
      setEmailError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Invalid email address')
      return
    }

    setEmailError('')
    setApiError('')
    setStatus('loading')

    try {
      const res = await forgotPassword(trimmed)
      setResetToken(res.resetToken)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🔑</div>
        </div>

        <h1 className={styles.heading}>Forgot password?</h1>
        <p className={styles.subheading}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {status === 'success' ? (
          <div className={styles.successBox} role="status">
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>Check your inbox</h2>
            <p className={styles.successText}>
              We sent a password reset link to <strong>{email.trim()}</strong>.
              It may take a few minutes to arrive.
            </p>
            <div className={styles.demoBox}>
              <p className={styles.demoLabel}>Demo only — click the link below to reset your password:</p>
              <Link
                to={`/reset-password?token=${resetToken}`}
                className={styles.demoLink}
              >
                /reset-password?token={resetToken}
              </Link>
            </div>
            <Link to="/" className={styles.backButton}>Back to Log In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="text"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                placeholder="you@example.com"
              />
              {emailError && <span role="alert" className={styles.errorText}>{emailError}</span>}
            </div>

            {status === 'error' && (
              <div role="alert" className={styles.alertError}>⚠ {apiError}</div>
            )}

            <button type="submit" disabled={status === 'loading'} className={styles.button}>
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <p className={styles.backText}>
            Remember your password? <Link to="/" className={styles.backLink}>Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
