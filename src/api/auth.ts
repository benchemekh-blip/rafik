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

export async function signUpUser(name: string, email: string, password: string): Promise<SignUpResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (email === 'existing@example.com') {
    throw new Error('An account with this email already exists')
  }
  return { token: 'mock-token' }
}
