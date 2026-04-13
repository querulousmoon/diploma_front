import { apiClient } from '@/lib/api-client'

export interface HistoricalMetric {
  id: number
  server_id: number
  metric_type: string // cpu_usage_percent, memory_usage_percent, disk_usage_percent, network_in_bytes, etc.
  aggregation_level: string // minute, hour, day
  timestamp: string
  period_start: string
  value_min: number | null
  value_max: number | null
  value_avg: number | null
  value_last: number | null
  sample_count: number
  collected_at: string
}

export interface HistoricalMetricsResponse {
  server_id: number
  metric_type: string
  time_range: string // 1h, 24h, 7d, 30d
  aggregation_level: string
  metrics: HistoricalMetric[]
}

export interface AvailableAggregationLevelsResponse {
  metric_type: string
  available_levels: string[]
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export const metricsHistoryApi = {
  getHistoricalMetrics: async (
    serverId: number,
    metricType: string,
    timeRange: '1h' | '24h' | '7d' | '30d',
    aggregationLevel: 'minute' | 'hour' | 'day' = 'minute'
  ): Promise<HistoricalMetricsResponse> => {
    const response = await apiClient.get<ApiResponse<HistoricalMetricsResponse>>(
      `/metrics/${serverId}/historical/${metricType}`,
      {
        params: {
          time_range: timeRange,
          aggregation_level: aggregationLevel,
        },
      }
    )
    return response.data.data
  },

  getAvailableAggregationLevels: async (
    serverId: number,
    metricType: string
  ): Promise<AvailableAggregationLevelsResponse> => {
    const response = await apiClient.get<ApiResponse<AvailableAggregationLevelsResponse>>(
      `/metrics/${serverId}/available-aggregations`,
      {
        params: {
          metric_type: metricType,
        },
      }
    )
    return response.data.data
  },
}