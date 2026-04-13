import { apiClient } from '@/lib/api-client'

export interface ConsoleSession {
  session_token: string
  server_id: number
  server_name: string
}

export interface ConsoleSessionInfo {
  session_token: string
  is_connected?: boolean
  server_id?: number
  user_id?: number
  status?: string
  started_at?: string
  ended_at?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export const consoleApi = {
  startSession: async (serverId: number): Promise<ConsoleSession> => {
    const response = await apiClient.post<ApiResponse<ConsoleSession>>(
      `/console/start-session/${serverId}`
    )
    return response.data.data
  },

  terminateSession: async (sessionToken: string) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/console/terminate-session/${sessionToken}`
    )
    return response.data.data
  },

  getSessionInfo: async (sessionToken: string): Promise<ConsoleSessionInfo> => {
    const response = await apiClient.get<ApiResponse<ConsoleSessionInfo>>(
      `/console/session-info/${sessionToken}`
    )
    return response.data.data
  },
}