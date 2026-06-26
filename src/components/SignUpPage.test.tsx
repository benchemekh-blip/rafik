import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import SignUpPage from './SignUpPage'
import * as authModule from '../api/auth'

vi.mock('../api/auth')

const mockSignUpUser = vi.mocked(authModule.signUpUser)

function renderPage() {
  return render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>
  )
}

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── A: Rendering ────────────────────────────────────────────────────────────

  describe('A — Rendering', () => {
    it('A1: renders Full Name input', () => {
      renderPage()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    it('A2: renders Email input', () => {
      renderPage()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('A3: renders Password input', () => {
      renderPage()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('A4: renders Confirm Password input', () => {
      renderPage()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('A5: renders Sign Up submit button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('A6: renders "Log in" link', () => {
      renderPage()
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })
  })

  // ── B: Validation ───────────────────────────────────────────────────────────

  describe('B — Validation', () => {
    it('B1: shows "Full name is required" when name is empty', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Full name is required')).toBeInTheDocument()
    })

    it('B2: shows "Email is required" when email is empty', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('B3: shows "Invalid email address" for bad email format', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'not-an-email')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    it('B4: shows "Password is required" when password is empty', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('B5: shows "Password must be at least 6 characters" for short password', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'abc')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('B6: shows "Please confirm your password" when confirm password is empty', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
    })

    it('B7: shows "Passwords do not match" when passwords differ', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'different123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    it('B8: does NOT call the API when validation fails', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      expect(mockSignUpUser).not.toHaveBeenCalled()
    })
  })

  // ── C: Interactions ─────────────────────────────────────────────────────────

  describe('C — Interactions', () => {
    it('C1: typing in Full Name field updates its value', async () => {
      const user = userEvent.setup()
      renderPage()
      const input = screen.getByLabelText(/full name/i)
      await user.type(input, 'Jane Doe')
      expect(input).toHaveValue('Jane Doe')
    })

    it('C2: typing in Email field updates its value', async () => {
      const user = userEvent.setup()
      renderPage()
      const input = screen.getByLabelText(/email/i)
      await user.type(input, 'jane@example.com')
      expect(input).toHaveValue('jane@example.com')
    })

    it('C3: typing in Password field updates its value', async () => {
      const user = userEvent.setup()
      renderPage()
      const input = screen.getByLabelText('Password')
      await user.type(input, 'mypassword')
      expect(input).toHaveValue('mypassword')
    })

    it('C4: typing in Confirm Password field updates its value', async () => {
      const user = userEvent.setup()
      renderPage()
      const input = screen.getByLabelText(/confirm password/i)
      await user.type(input, 'mypassword')
      expect(input).toHaveValue('mypassword')
    })
  })

  // ── D: Submission & API Integration ─────────────────────────────────────────

  describe('D — Submission & API Integration', () => {
    it('D1: calls signUpUser with name, email, and password on valid submit', async () => {
      const user = userEvent.setup()
      mockSignUpUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      await waitFor(() => {
        expect(mockSignUpUser).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'password123')
      })
    })

    it('D2: button shows "Creating account…" and is disabled while loading', async () => {
      const user = userEvent.setup()
      mockSignUpUser.mockImplementationOnce(() => new Promise(() => {}))
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Creating account…')
        expect(button).toBeDisabled()
      })
    })

    it('D3: shows success message on resolved API response', async () => {
      const user = userEvent.setup()
      mockSignUpUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('D4: shows error message on rejected API response', async () => {
      const user = userEvent.setup()
      mockSignUpUser.mockRejectedValueOnce(new Error('An account with this email already exists'))
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      await waitFor(() => {
        expect(screen.getByText(/An account with this email already exists/)).toBeInTheDocument()
      })
    })

    it('D5: re-enables submit button after API call resolves', async () => {
      const user = userEvent.setup()
      mockSignUpUser.mockResolvedValueOnce({ token: 'mock-token' })
      renderPage()
      await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))
      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })
    })
  })

  // ── E: Navigation ────────────────────────────────────────────────────────────

  describe('E — Navigation', () => {
    it('E1: "Log in" link is present', () => {
      renderPage()
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })

    it('E2: "Log in" link points to the login route', () => {
      renderPage()
      expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/')
    })
  })
})
