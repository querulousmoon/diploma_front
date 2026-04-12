import type { User, LoginCredentials } from '@/types'
import { apiClient } from '@/lib/api-client'

interface LoginResponseData {
  access_token: string
  token_type: string
  user: User
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponseData> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', {
      username: credentials.email,
      password: credentials.password,
    })
    return response.data.data
  },

  logout: async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },
}
