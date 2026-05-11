import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { clearToken, getToken } from './tokenStorage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60_000,
})

function isAuthRequest(config: AxiosRequestConfig | undefined): boolean {
  const url = config?.url ?? ''
  return url.includes('auth/login') || url.includes('auth/register')
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers)
      headers.set('Authorization', `Bearer ${token}`)
      config.headers = headers
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const requireAuthRedirect =
      (status === 401 || status === 403) && !isAuthRequest(error.config)

    if (requireAuthRedirect) {
      clearToken()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  },
)

export default httpClient
