import { apiClient } from '@/lib/api-client'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

interface Container {
  id: number
  server_id: number
  container_id: string
  container_name: string
  image: string
  status: string
  cpu_percentage: number | null
  memory_usage_mb: number | null
  memory_percentage: number | null
  restart_count: number
  health_status: string
  ports: string
  command: string
  created_at: string
  started_at: string
  running: boolean
  collected_at: string
  extra_data: {
    cpu_percentage: number | null
    memory_usage_mb: number | null
    memory_percentage: number | null
    restart_count: number
    health_status: string
    ports: string
    command: string
    created_at: string
    started_at: string
    running: boolean
  }
}

interface ControlContainerResponse {
  server_id: number
  container_id: string
  action: string
}

export const containersApi = {
  getContainers: async (serverId: number): Promise<Container[]> => {
    const response = await apiClient.get<ApiResponse<Container[]>>(
      `/servers/${serverId}/containers`
    )
    return response.data.data
  },

  getContainer: async (serverId: number, containerId: string): Promise<Container> => {
    const response = await apiClient.get<ApiResponse<Container>>(
      `/servers/${serverId}/containers/${containerId}`
    )
    return response.data.data
  },

  startContainer: async (serverId: number, containerId: string) => {
    const response = await apiClient.post<ApiResponse<ControlContainerResponse>>(
      `/servers/${serverId}/containers/${containerId}/start`
    )
    return response.data.data
  },

  stopContainer: async (serverId: number, containerId: string) => {
    const response = await apiClient.post<ApiResponse<ControlContainerResponse>>(
      `/servers/${serverId}/containers/${containerId}/stop`
    )
    return response.data.data
  },

  restartContainer: async (serverId: number, containerId: string) => {
    const response = await apiClient.post<ApiResponse<ControlContainerResponse>>(
      `/servers/${serverId}/containers/${containerId}/restart`
    )
    return response.data.data
  },

  deleteContainer: async (serverId: number, containerId: string, force: boolean = false) => {
    const response = await apiClient.delete<ApiResponse<ControlContainerResponse>>(
      `/servers/${serverId}/containers/${containerId}`,
      {
        params: {
          force
        }
      }
    )
    return response.data.data
  }
}