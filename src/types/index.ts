export interface User {
  id: number
  email: string
  username: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Server {
  id: number
  name: string
  host: string
  port: number
  connection_type: string
  environment: string | null
  tags: string[]
  status: 'online' | 'offline' | 'warning' | 'unknown' | string
  last_seen: string | null
  created_at: string
  updated_at: string
}

export interface ServerMetrics {
  id: number
  server_id: number
  cpu_usage_percent: number | null
  load_average_1m: number | null
  load_average_5m: number | null
  load_average_15m: number | null
  memory_total_mb: number | null
  memory_used_mb: number | null
  memory_free_mb: number | null
  memory_usage_percent: number | null
  disk_total_gb: number | null
  disk_used_gb: number | null
  disk_free_gb: number | null
  disk_usage_percent: number | null
  network_in_bytes: number | null
  network_out_bytes: number | null
  uptime_seconds: number | null
  collected_at: string
}

export interface Container {
  id: number
  server_id: number
  container_id: string
  container_name: string
  image: string | null
  status: string | null
  collected_at: string
}

export interface ServerDetails extends Server {
  metrics: ServerMetrics | null
  containers: Container[]
}

export interface CreateServerInput {
  name: string
  host: string
  port: number
  connection_type: string
  environment: string
  tags: string[]
  ssh_username?: string
  ssh_password?: string
  ssh_private_key?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ContainerMetrics extends Container {
  cpu_percentage?: number | null
  memory_usage_mb?: number | null
  memory_percentage?: number | null
  restart_count?: number | null
  health_status?: string | null
}

export interface HistoricalMetric {
  id: number
  server_id: number
  metric_type: string
  aggregation_level: string
  timestamp: string
  period_start: string
  value_min: number | null
  value_max: number | null
  value_avg: number | null
  value_last: number | null
  sample_count: number
  collected_at: string
}

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

export interface ConnectionTestResult {
  success: boolean
  message: string
  error_code: string | null
}
