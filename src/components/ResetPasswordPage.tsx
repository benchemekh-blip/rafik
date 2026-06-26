import { useState, useEffect, FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { validateResetToken, resetPassword } from '../api/auth'
import styles from './ResetPasswordPage.module.css'

type TokenStatus = 'validating' | 'valid' | 'invalid'
type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface FormErrors {
  password?: string
  confirmPassword?: string
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('validating')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid')
      return
    }
    validateResetToken(token)
      .then(() => setTokenStatus('valid'))
      .catch(() => setTokenStatus('invalid'))
  }, [token])

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!password) errs.password = 'New password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your new password'
    else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setErrors({})
    setApiError('')
    setFormStatus('loading')

    try {
      await resetPassword(token, password)
      setFormStatus('success')
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      setFormStatus('error')
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🔐</div>
        </div>

        {tokenStatus === 'validating' && (
          <>
            <h1 className={styles.heading}>Verifying link…</h1>
            <p className={styles.subheading}>Please wait while we validate your reset link.</p>
            <div className={styles.spinner} role="status" aria-label="Validating token" />
          </>
        )}

        {tokenStatus === 'invalid' && (
          <div className={styles.invalidBox} role="alert">
            <div className={styles.invalidIcon}>❌</div>
            <h1 className={styles.heading}>Link expired</h1>
            <p className={styles.subheading}>
              This password reset link is invalid or has already been used.
            </p>
            <Link to="/forgot-password" className={styles.button}>Request a new link</Link>
          </div>
        )}

        {tokenStatus === 'valid' && (
          <>
            <h1 className={styles.heading}>Set new password</h1>
            <p className={styles.subheading}>Choose a strong password for your account.</p>

            {formStatus === 'success' ? (
              <div className={styles.successBox} role="status">
                <div className={styles.successIcon}>✅</div>
                <h2 className={styles.successTitle}>Password updated!</h2>
                <p className={styles.successText}>
                  Your password has been reset successfully. Redirecting you to login…
                </p>
                <Link to="/" className={styles.button}>Go to Log In</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>New password</label>
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
                  <label htmlFor="confirmPassword" className={styles.label}>Confirm new password</label>
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

                {formStatus === 'error' && (
                  <div role="alert" className={styles.alertError}>⚠ {apiError}</div>
                )}

                <button type="submit" disabled={formStatus === 'loading'} className={styles.button}>
                  {formStatus === 'loading' ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
