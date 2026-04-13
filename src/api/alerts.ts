import { apiClient } from '@/lib/api-client'


export interface Alert {
  id: number
  title: string
  description: string | null
  status: 'open' | 'acknowledged' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  rule_type: string
  server_id: number | null
  container_id: string | null
  metric_type: string | null
  threshold_value: string | null
  current_value: string | null
  metadata: Record<string, any>
  acknowledged_at: string | null
  acknowledged_by_user_id: number | null
  resolved_at: string | null
  first_triggered_at: string
  last_triggered_at: string
  created_at: string
  updated_at: string
}

export interface AlertFilters {
  status?: 'open' | 'acknowledged' | 'resolved'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  server_id?: number
  limit?: number
  offset?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export const alertsApi = {
  getAll: async (params?: AlertFilters) => {
    const response = await apiClient.get<ApiResponse<{
      alerts: Alert[]
      pagination: { limit: number; offset: number }
    }>>('/alerts', {
      params: {
        ...(params?.status && { status: params.status }),
        ...(params?.severity && { severity: params.severity }),
        ...(params?.server_id && { server_id: params.server_id }),
        limit: params?.limit ?? 100,
        offset: params?.offset ?? 0,
      },
    })
    return response.data.data
  },

  getById: async (id: number): Promise<Alert> => {
    const response = await apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`)
    return response.data.data
  },

  acknowledge: async (id: number) => {
    const response = await apiClient.post<ApiResponse<Alert>>(`/alerts/${id}/acknowledge`)
    return response.data.data
  },

  resolve: async (id: number) => {
    const response = await apiClient.post<ApiResponse<Alert>>(`/alerts/${id}/resolve`)
    return response.data.data
  },

  getCount: async (params?: Omit<AlertFilters, 'limit' | 'offset'>) => {
    const response = await apiClient.get<ApiResponse<{
      count: number
      filters: { status: string | null; severity: string | null; server_id: number | null }
    }>>('/alerts/count', {
      params: {
        ...(params?.status && { status: params.status }),
        ...(params?.severity && { severity: params.severity }),
        ...(params?.server_id && { server_id: params.server_id }),
      },
    })
    return response.data.data
  },
}