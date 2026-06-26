import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import LoginPage from './LoginPage'
import * as authModule from '../api/auth'

vi.mock('../api/auth')

const mockLoginUser = vi.mocked(authModule.loginUser)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<div>home-sentinel</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── A: Rendering ────────────────────────────────────────────────────────────

  describe('A — Rendering', () => {
    it('A1: renders email input', () => {
      renderPage()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('A2: renders password input', () => {
      renderPage()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('A3: renders Remember Me checkbox unchecked by default', () => {
      renderPage()
      const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('A4: renders submit button labeled "Log In"', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })
  })

  // ── B: Validation ───────────────────────────────────────────────────────────

  describe('B — Validation', () => {
    it('B1: shows "Email is required" when submitting with empty email', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('B2: shows "Invalid email address" for bad email format', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'not-an-email')
      await user.type(screen.getByLabelText(/password/i), 'validpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    it('B3: shows "Password is required" when submitting with empty password', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'user@example.com')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('B4: shows "Password must be at least 6 characters" for short password', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'user@example.com')
      await user.type(screen.getByLabelText(/password/i), 'abc')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('B5: does NOT call the API when validation fails', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(mockLoginUser).not.toHaveBeenCalled()
    })

    it('B6: clears validation errors when user corrects input and resubmits', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()

      await user.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()

      await user.type(screen.getByLabelText(/email/i), 'benchemekh@gmail.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      })
    })
  })

  // ── C: Interactions ─────────────────────────────────────────────────────────

  describe('C — Interactions', () => {
    it('C1: typing in email field updates its value', async () => {
      const user = userEvent.setup()
      renderPage()
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')
      expect(emailInput).toHaveValue('user@example.com')
    })

    it('C2: typing in password field updates its value', async () => {
      const user = userEvent.setup()
      renderPage()
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'mypassword')
      expect(passwordInput).toHaveValue('mypassword')
    })

    it('C3: clicking Remember Me toggles the checkbox', async () => {
      const user = userEvent.setup()
      renderPage()
      const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(checkbox).not.toBeChecked()
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  // ── D: Submission & API Integration ─────────────────────────────────────────

  describe('D — Submission & API Integration', () => {
    it('D1: calls loginUser with email and password on valid submit', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'benchemekh@gmail.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith('benchemekh@gmail.com', 'password123')
      })
    })

    it('D2: button shows "Logging in…" and is disabled while loading', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockImplementationOnce(() => new Promise(() => {}))
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'benchemekh@gmail.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Logging in…')
        expect(button).toBeDisabled()
      })
    })

    it('D3: navigates to /home after successful login', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'benchemekh@gmail.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(screen.getByText('home-sentinel')).toBeInTheDocument()
      })
    })

    it('D4: shows error message on rejected API response', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'))
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument()
      })
    })

    it('D5: re-enables submit button after API call fails', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'))
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled()
      })
    })

    it('D6: calls loginUser exactly once per submit', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'benchemekh@gmail.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledTimes(1)
      })
    })
  })

  // ── E: Edge Cases ────────────────────────────────────────────────────────────

  describe('E — Edge Cases', () => {
    it('E1: trims leading/trailing whitespace from email before API call', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/email/i), '  benchemekh@gmail.com  ')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(mockLoginUser).toHaveBeenCalledWith('benchemekh@gmail.com', 'password123')
      })
    })

    it('E2: hides API error message after a successful retry', async () => {
      const user = userEvent.setup()
      mockLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'))
      renderPage()
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument()
      })

      mockLoginUser.mockResolvedValueOnce({ token: 'mock-token' })
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.queryByText(/Invalid credentials/)).not.toBeInTheDocument()
      })
    })
  })

  // ── F: Navigation Links ──────────────────────────────────────────────────────

  describe('F — Navigation Links', () => {
    it('F1: renders a "Forgot password?" link', () => {
      renderPage()
      const link = screen.getByRole('link', { name: /forgot password/i })
      expect(link).toBeInTheDocument()
    })

    it('F2: "Forgot password?" link has an href attribute', () => {
      renderPage()
      const link = screen.getByRole('link', { name: /forgot password/i })
      expect(link).toHaveAttribute('href')
    })

    it('F3: renders a "Sign up" link', () => {
      renderPage()
      const link = screen.getByRole('link', { name: /sign up/i })
      expect(link).toBeInTheDocument()
    })

    it('F4: "Sign up" link has an href attribute', () => {
      renderPage()
      const link = screen.getByRole('link', { name: /sign up/i })
      expect(link).toHaveAttribute('href')
    })

    it('F5: "Don\'t have an account?" prompt is visible alongside the Sign up link', () => {
      renderPage()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })
  })
})
