import { apiClient } from '@/lib/api-client'
import type { Server, CreateServerInput } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

interface ServerListParams {
  skip?: number
  limit?: number
  environment?: string
  status?: string
}

export const serversApi = {
  getAll: async (params?: ServerListParams): Promise<Server[]> => {
    const response = await apiClient.get<ApiResponse<Server[]>>('/servers', {
      params: {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 100,
        ...(params?.environment && { environment: params.environment }),
        ...(params?.status && { status: params.status }),
      },
    })
    return response.data.data
  },

  getById: async (id: number): Promise<Server> => {
    const response = await apiClient.get<ApiResponse<Server>>(`/servers/${id}`)
    return response.data.data
  },

  create: async (data: CreateServerInput): Promise<Server> => {
    const response = await apiClient.post<ApiResponse<Server>>('/servers', data)
    return response.data.data
  },

  update: async (id: number, data: Partial<CreateServerInput>): Promise<Server> => {
    const response = await apiClient.put<ApiResponse<Server>>(`/servers/${id}`, data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/servers/${id}`)
  },

  getLatestMetrics: async (serverId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(`/servers/${serverId}/metrics/latest`)
    return response.data.data
  },

  getMetricsHistory: async (serverId: number, limit = 100) => {
    const response = await apiClient.get<ApiResponse<any>>(`/servers/${serverId}/metrics/history`, {
      params: { limit },
    })
    return response.data.data
  },

  getContainers: async (serverId: number) => {
    const response = await apiClient.get<ApiResponse<any>>(`/servers/${serverId}/containers`)
    return response.data.data
  },

  testConnection: async (serverId: number) => {
    const response = await apiClient.post(`/connections/test/${serverId}`)
    return response.data.data
  },

  startContainer: async (serverId: number, containerId: string) => {
    const response = await apiClient.post(`/servers/${serverId}/containers/${containerId}/start`)
    return response.data.data
  },

  stopContainer: async (serverId: number, containerId: string) => {
    const response = await apiClient.post(`/servers/${serverId}/containers/${containerId}/stop`)
    return response.data.data
  },

  restartContainer: async (serverId: number, containerId: string) => {
    const response = await apiClient.post(`/servers/${serverId}/containers/${containerId}/restart`)
    return response.data.data
  },

  deleteContainer: async (serverId: number, containerId: string, force: boolean = false) => {
    const response = await apiClient.delete(`/servers/${serverId}/containers/${containerId}?force=${force}`)
    return response.data.data
  },
}
