import httpClient from './httpClient'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await httpClient.post<LoginResponse>('/api/auth/login', payload)
  return data
}
