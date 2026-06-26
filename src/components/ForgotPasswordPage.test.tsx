import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ForgotPasswordPage from './ForgotPasswordPage'
import * as authModule from '../api/auth'

vi.mock('../api/auth')

const mockForgotPassword = vi.mocked(authModule.forgotPassword)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<div>login-sentinel</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── A: Rendering ────────────────────────────────────────────────────────────

  describe('A — Rendering', () => {
    it('A1: renders email input', () => {
      renderPage()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('A2: renders "Send reset link" button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('A3: renders "Log in" back link', () => {
      renderPage()
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })

    it('A4: renders page heading', () => {
      renderPage()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  // ── B: Validation ───────────────────────────────────────────────────────────

  describe('B — Validation', () => {
    it('B1: shows "Email is required" when submitting empty email', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('B2: shows "Invalid email address" for bad email format', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'not-an-email')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    it('B3: does NOT call the API when validation fails', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      expect(mockForgotPassword).not.toHaveBeenCalled()
    })
  })

  // ── C: Submission & API Integration ─────────────────────────────────────────

  describe('C — Submission & API Integration', () => {
    it('C1: calls forgotPassword with the trimmed email on valid submit', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockResolvedValueOnce({ message: 'Password reset link sent' })
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), '  benchemekh@gmail.com  ')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith('benchemekh@gmail.com')
      })
    })

    it('C2: button shows "Sending…" and is disabled while loading', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockImplementationOnce(() => new Promise(() => {}))
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'benchemekh@gmail.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveTextContent('Sending…')
        expect(screen.getByRole('button')).toBeDisabled()
      })
    })

    it('C3: shows success message after API resolves', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockResolvedValueOnce({ message: 'Password reset link sent' })
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'benchemekh@gmail.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
      })
    })

    it('C4: shows the submitted email in the success message', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockResolvedValueOnce({ message: 'Password reset link sent' })
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'benchemekh@gmail.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => {
        expect(screen.getByText(/benchemekh@gmail\.com/)).toBeInTheDocument()
      })
    })

    it('C5: shows error message when API rejects', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockRejectedValueOnce(new Error('No account found with that email address'))
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'unknown@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => {
        expect(screen.getByText(/No account found/)).toBeInTheDocument()
      })
    })

    it('C6: re-enables submit button after API error', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockRejectedValueOnce(new Error('No account found with that email address'))
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'unknown@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send reset link/i })).not.toBeDisabled()
      })
    })
  })

  // ── D: Navigation ────────────────────────────────────────────────────────────

  describe('D — Navigation', () => {
    it('D1: "Log in" link navigates back to the login page', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('link', { name: /log in/i }))
      expect(screen.getByText('login-sentinel')).toBeInTheDocument()
    })

    it('D2: "Back to Log In" link on success screen navigates to login', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockResolvedValueOnce({ message: 'Password reset link sent' })
      renderPage()
      await user.type(screen.getByLabelText(/email address/i), 'benchemekh@gmail.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))
      await waitFor(() => screen.getByRole('status'))
      await user.click(screen.getByRole('link', { name: /back to log in/i }))
      expect(screen.getByText('login-sentinel')).toBeInTheDocument()
    })
  })
})
