export interface LoginResponse {
  token: string
}

export interface SignUpResponse {
  token: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (email === 'benchemekh@gmail.com' && password === 'password123') {
    return { token: 'mock-token' }
  }
  throw new Error('Invalid credentials')
}

export interface ForgotPasswordResponse { message: string }

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('No account found with that email address')
  }
  return { message: 'Password reset link sent' }
}

export async function signUpUser(name: string, email: string, password: string): Promise<SignUpResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (email === 'existing@example.com') {
    throw new Error('An account with this email already exists')
  }
  return { token: 'mock-token' }
}
