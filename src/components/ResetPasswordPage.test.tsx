import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ResetPasswordPage from './ResetPasswordPage'
import * as authModule from '../api/auth'

vi.mock('../api/auth')

const mockValidateResetToken = vi.mocked(authModule.validateResetToken)
const mockResetPassword = vi.mocked(authModule.resetPassword)

function renderPage(token = 'mock-reset-token-abc123') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<div>login-sentinel</div>} />
        <Route path="/forgot-password" element={<div>forgot-sentinel</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── A: Token Validation ──────────────────────────────────────────────────────

  describe('A — Token Validation', () => {
    it('A1: shows "Verifying link…" heading while validating', () => {
      mockValidateResetToken.mockImplementationOnce(() => new Promise(() => {}))
      renderPage()
      expect(screen.getByText(/verifying link/i)).toBeInTheDocument()
    })

    it('A2: shows a spinner while validating', () => {
      mockValidateResetToken.mockImplementationOnce(() => new Promise(() => {}))
      renderPage()
      expect(screen.getByRole('status', { name: /validating token/i })).toBeInTheDocument()
    })

    it('A3: shows the password form when token is valid', async () => {
      mockValidateResetToken.mockResolvedValueOnce({ valid: true })
      renderPage()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
      })
    })

    it('A4: shows "Link expired" error when token is invalid', async () => {
      mockValidateResetToken.mockRejectedValueOnce(new Error('Invalid or expired'))
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/link expired/i)).toBeInTheDocument()
      })
    })

    it('A5: shows "Link expired" when no token is in the URL', async () => {
      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </MemoryRouter>
      )
      await waitFor(() => {
        expect(screen.getByText(/link expired/i)).toBeInTheDocument()
      })
    })

    it('A6: "Request a new link" button navigates to /forgot-password', async () => {
      const user = userEvent.setup()
      mockValidateResetToken.mockRejectedValueOnce(new Error('Invalid or expired'))
      renderPage()
      await waitFor(() => screen.getByText(/link expired/i))
      await user.click(screen.getByRole('link', { name: /request a new link/i }))
      expect(screen.getByText('forgot-sentinel')).toBeInTheDocument()
    })
  })

  // ── B: Form Rendering ────────────────────────────────────────────────────────

  describe('B — Form Rendering', () => {
    beforeEach(async () => {
      mockValidateResetToken.mockResolvedValueOnce({ valid: true })
    })

    it('B1: renders new password input', async () => {
      renderPage()
      await waitFor(() => expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument())
    })

    it('B2: renders confirm password input', async () => {
      renderPage()
      await waitFor(() => expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument())
    })

    it('B3: renders "Reset password" submit button', async () => {
      renderPage()
      await waitFor(() => expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument())
    })
  })

  // ── C: Validation ────────────────────────────────────────────────────────────

  describe('C — Validation', () => {
    beforeEach(async () => {
      mockValidateResetToken.mockResolvedValueOnce({ valid: true })
    })

    it('C1: shows "New password is required" when submitting empty password', async () => {
      const user = userEvent.setup()
      renderPage()
      await waitFor(() => screen.getByRole('button', { name: /reset password/i }))
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      expect(screen.getByText('New password is required')).toBeInTheDocument()
    })

    it('C2: shows "Password must be at least 6 characters" for short password', async () => {
      const user = userEvent.setup()
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'abc')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('C3: shows "Please confirm your new password" when confirm is empty', async () => {
      const user = userEvent.setup()
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      expect(screen.getByText('Please confirm your new password')).toBeInTheDocument()
    })

    it('C4: shows "Passwords do not match" when passwords differ', async () => {
      const user = userEvent.setup()
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'different456')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    it('C5: does NOT call the API when validation fails', async () => {
      const user = userEvent.setup()
      renderPage()
      await waitFor(() => screen.getByRole('button', { name: /reset password/i }))
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      expect(mockResetPassword).not.toHaveBeenCalled()
    })
  })

  // ── D: Submission & API Integration ─────────────────────────────────────────

  describe('D — Submission & API Integration', () => {
    beforeEach(async () => {
      mockValidateResetToken.mockResolvedValueOnce({ valid: true })
    })

    it('D1: calls resetPassword with the token and new password', async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValueOnce({ message: 'Password reset successfully' })
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('mock-reset-token-abc123', 'newpassword123')
      })
    })

    it('D2: button shows "Resetting…" and is disabled while loading', async () => {
      const user = userEvent.setup()
      mockResetPassword.mockImplementationOnce(() => new Promise(() => {}))
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent('Resetting…')
        expect(screen.getByRole('button')).toBeDisabled()
      })
    })

    it('D3: shows success message after password is reset', async () => {
      const user = userEvent.setup()
      mockResetPassword.mockResolvedValueOnce({ message: 'Password reset successfully' })
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(screen.getByText(/password updated/i)).toBeInTheDocument()
      })
    })

    it('D4: shows error message when resetPassword API rejects', async () => {
      const user = userEvent.setup()
      mockResetPassword.mockRejectedValueOnce(new Error('This reset link is invalid or has expired'))
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      await waitFor(() => {
        expect(screen.getByText(/invalid or has expired/)).toBeInTheDocument()
      })
    })

    it('D5: re-enables submit button after API error', async () => {
      const user = userEvent.setup()
      mockResetPassword.mockRejectedValueOnce(new Error('Expired'))
      renderPage()
      await waitFor(() => screen.getByLabelText(/^new password/i))
      await user.type(screen.getByLabelText(/^new password/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')
      await user.click(screen.getByRole('button', { name: /reset password/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset password/i })).not.toBeDisabled()
      })
    })
  })
})
