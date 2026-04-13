import type { Server } from '@/types'

export function getStatusVariant(status: Server['status']): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'online':
      return 'success'
    case 'warning':
      return 'warning'
    case 'offline':
      return 'error'
    case 'unknown':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export function getStatusLabel(status: Server['status']): string {
  switch (status) {
    case 'online':
      return 'Online'
    case 'warning':
      return 'Warning'
    case 'offline':
      return 'Offline'
    case 'unknown':
      return 'Unknown'
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
  }
}

export function getEnvironmentVariant(environment: Server['environment']): 'error' | 'warning' | 'info' | 'default' {
  if (!environment) return 'default'
  switch (environment) {
    case 'production':
      return 'error'
    case 'staging':
      return 'warning'
    case 'development':
      return 'info'
    default:
      return 'default'
  }
}

export function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Never'

  const date = new Date(lastSeen)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return `${Math.round(value)}%`
}
