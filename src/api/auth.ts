export interface LoginResponse {
  token: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (email === 'admin@example.com' && password === 'password123') {
    return { token: 'mock-token' }
  }
  throw new Error('Invalid credentials')
}
