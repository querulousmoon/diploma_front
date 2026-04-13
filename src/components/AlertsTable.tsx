import { useState, useEffect } from 'react'
import type { Alert } from '@/types'
import { alertsApi } from '@/api/alerts'
import { RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import './AlertsTable.css'

interface AlertsTableProps {
  serverId?: number
  alerts: Alert[]
  loading: boolean
  onRefresh: () => void
}

const AlertsTable = ({ serverId, alerts, loading, onRefresh }: AlertsTableProps) => {
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    serverId: serverId || null
  })
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [sortField, setSortField] = useState<keyof Alert>('last_triggered_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    let result = [...alerts]
    
    // Apply filters
    if (filters.status) {
      result = result.filter(alert => alert.status === filters.status)
    }
    if (filters.severity) {
      result = result.filter(alert => alert.severity === filters.severity)
    }
    if (filters.serverId && filters.serverId > 0) {
      result = result.filter(alert => alert.server_id === filters.serverId)
    }
    
    // Sort the results
    result.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1
      
      // Handle date comparison
      if (sortField === 'last_triggered_at' || sortField === 'first_triggered_at' || sortField === 'created_at' || sortField === 'updated_at' || sortField === 'acknowledged_at' || sortField === 'resolved_at') {
        const aDate = new Date(aValue as string)
        const bDate = new Date(bValue as string)
        
        if (aDate < bDate) {
          return sortDirection === 'asc' ? -1 : 1
        }
        if (aDate > bDate) {
          return sortDirection === 'asc' ? 1 : -1
        }
        return 0
      }
      
      // Handle string comparison
      if ((aValue as string) < (bValue as string)) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if ((aValue as string) > (bValue as string)) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
    
    setFilteredAlerts(result)
  }, [alerts, filters, sortField, sortDirection])

  const handleSort = (field: keyof Alert) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status
    }))
  }

  const handleSeverityChange = (severity: string) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity === severity ? '' : severity
    }))
  }

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertsApi.acknowledge(alertId)
      onRefresh() // Refresh the alerts list
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'error'
      case 'acknowledged':
        return 'warning'
      case 'resolved':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'default'
      case 'medium':
        return 'warning'
      case 'high':
        return 'error'
      case 'critical':
        return 'critical'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card className="alerts-table-container">
        <LoadingState message="Loading alerts..." />
      </Card>
    )
  }

  return (
    <Card className="alerts-table-container">
      <div className="alerts-table-header">
        <h2 className="alerts-table-title">Alerts</h2>
        <div className="alerts-controls">
          <div className="alerts-filters">
            <select 
              value={filters.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="alerts-filter-select"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
            <select 
              value={filters.severity} 
              onChange={(e) => handleSeverityChange(e.target.value)}
              className="alerts-filter-select"
            >
              <option value="">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button 
            className="alerts-refresh-btn" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'rotate-animation' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="alerts-empty">
          No alerts found
        </div>
      ) : (
        <div className="alerts-table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th 
                  className={`sortable ${sortField === 'title' ? 'sorted' : ''}`}
                  onClick={() => handleSort('title')}
                >
                  <span>Title</span>
                  {sortField === 'title' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className={`sortable ${sortField === 'severity' ? 'sorted' : ''}`}
                  onClick={() => handleSort('severity')}
                >
                  <span>Severity</span>
                  {sortField === 'severity' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className={`sortable ${sortField === 'status' ? 'sorted' : ''}`}
                  onClick={() => handleSort('status')}
                >
                  <span>Status</span>
                  {sortField === 'status' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className={`sortable ${sortField === 'last_triggered_at' ? 'sorted' : ''}`}
                  onClick={() => handleSort('last_triggered_at')}
                >
                  <span>Last Triggered</span>
                  {sortField === 'last_triggered_at' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className={`sortable ${sortField === 'server_id' ? 'sorted' : ''}`}
                  onClick={() => handleSort('server_id')}
                >
                  <span>Server</span>
                  {sortField === 'server_id' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <div className="alert-title">
                      <span className="alert-title-text">{alert.title}</span>
                      {alert.description && (
                        <span className="alert-description">{alert.description}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getSeverityVariant(alert.severity)}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(alert.status)}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {new Date(alert.last_triggered_at).toLocaleString()}
                  </td>
                  <td>
                    {alert.server_id ? (
                      <Link to={`/servers/${alert.server_id}`} className="alert-server-link">
                        Server #{alert.server_id}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {alert.status === 'open' ? (
                      <button 
                        className="alert-acknowledge-btn"
                        onClick={() => handleAcknowledge(alert.id)}
                        title="Acknowledge alert"
                      >
                        <CheckCircle size={16} />
                      </button>
                    ) : alert.status === 'acknowledged' ? (
                      <span className="alert-status-indicator">
                        <Clock size={16} />
                      </span>
                    ) : (
                      <span className="alert-status-indicator">
                        <XCircle size={16} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default AlertsTable