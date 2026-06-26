import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import HomePage from './HomePage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<div>login-sentinel</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  // ── A: Rendering ────────────────────────────────────────────────────────────

  describe('A — Rendering', () => {
    it('A1: renders welcome heading', () => {
      renderPage()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('A2: renders app brand in the nav bar', () => {
      renderPage()
      expect(screen.getByText(/myapp/i)).toBeInTheDocument()
    })

    it('A3: renders Log Out button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
    })

    it('A4: renders Analytics card', () => {
      renderPage()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('A5: renders Settings card', () => {
      renderPage()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('A6: renders Notifications card', () => {
      renderPage()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })
  })

  // ── B: Navigation ───────────────────────────────────────────────────────────

  describe('B — Navigation', () => {
    it('B1: clicking Log Out navigates back to login page', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /log out/i }))
      expect(screen.getByText('login-sentinel')).toBeInTheDocument()
    })
  })
})
