export interface LoginResponse { token: string }
export interface SignUpResponse { token: string }
export interface ForgotPasswordResponse { message: string; resetToken: string }
export interface ResetPasswordResponse { message: string }

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (email === 'benchemekh@gmail.com' && password === 'password123') {
    return { token: 'mock-token' }
  }
  throw new Error('Invalid credentials')
}

export async function signUpUser(name: string, email: string, password: string): Promise<SignUpResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (email === 'existing@example.com') {
    throw new Error('An account with this email already exists')
  }
  return { token: 'mock-token' }
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('No account found with that email address')
  }
  return { message: 'Password reset link sent', resetToken: 'mock-reset-token-abc123' }
}

// Simulates a server-side token store — valid until used once
const validTokens = new Set(['mock-reset-token-abc123'])

export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  if (validTokens.has(token)) return { valid: true }
  throw new Error('This reset link is invalid or has expired')
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (!validTokens.has(token)) {
    throw new Error('This reset link is invalid or has expired')
  }
  validTokens.delete(token) // single-use token
  return { message: 'Password reset successfully' }
}
