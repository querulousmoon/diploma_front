import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { serversApi } from '@/api/servers'
import { alertsApi } from '@/api/alerts'
import type { Server, Alert } from '@/types'
import { Server as ServerIcon, Activity, AlertTriangle, TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { getStatusVariant, getStatusLabel, getEnvironmentVariant, formatLastSeen } from '@/utils/formatters'
import './DashboardPage.css'

export default function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    environment: '',
    status: '',
  })
  const navigate = useNavigate()

  const fetchServers = async () => {
    try {
      const data = await serversApi.getAll({
        environment: filters.environment || undefined,
        status: filters.status || undefined,
      })
      setServers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load servers')
    }
  }

  const fetchAlerts = async () => {
    try {
      const data = await alertsApi.getAll({
        status: 'open',
        limit: 10,
      })
      setAlerts(data.alerts)
    } catch (err: any) {
      console.error('Failed to load alerts:', err)
    }
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await Promise.all([fetchServers(), fetchAlerts()])
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchServers()
  }, [filters])

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  // Calculate server stats
  const onlineCount = servers.filter(s => s.status === 'online').length
  const offlineCount = servers.filter(s => s.status === 'offline').length
  const warningCount = servers.filter(s => s.status === 'warning').length
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  
  // Get problem servers
  const problemServers = servers.filter(s => s.status === 'offline' || s.status === 'warning')

  // Get recently triggered alerts
  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.last_triggered_at).getTime() - new Date(a.last_triggered_at).getTime())
    .slice(0, 5)

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
      </div>

      {/* Stats Summary Cards */}
      <div className="dashboard-page__stats">
        <Card className="dashboard-stat-card">
          <div className="dashboard-stat-card__icon dashboard-stat-card__icon--primary">
            <ServerIcon size={24} />
          </div>
          <div className="dashboard-stat-card__content">
            <div className="dashboard-stat-card__label">Total Servers</div>
            <div className="dashboard-stat-card__value">{servers.length}</div>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="dashboard-stat-card__icon dashboard-stat-card__icon--success">
            <Activity size={24} />
          </div>
          <div className="dashboard-stat-card__content">
            <div className="dashboard-stat-card__label">Online</div>
            <div className="dashboard-stat-card__value">{onlineCount}</div>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="dashboard-stat-card__icon dashboard-stat-card__icon--warning">
            <AlertTriangle size={24} />
          </div>
          <div className="dashboard-stat-card__content">
            <div className="dashboard-stat-card__label">Warning</div>
            <div className="dashboard-stat-card__value">{warningCount}</div>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="dashboard-stat-card__icon dashboard-stat-card__icon--error">
            <AlertTriangle size={24} />
          </div>
          <div className="dashboard-stat-card__content">
            <div className="dashboard-stat-card__label">Offline</div>
            <div className="dashboard-stat-card__value">{offlineCount}</div>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="dashboard-stat-card__icon dashboard-stat-card__icon--error">
            <TrendingUp size={24} />
          </div>
          <div className="dashboard-stat-card__content">
            <div className="dashboard-stat-card__label">Critical Alerts</div>
            <div className="dashboard-stat-card__value">{criticalCount}</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dashboard-page__filters">
        <div className="filter-group">
          <label className="filter-label">Environment</label>
          <select
            className="filter-select"
            value={filters.environment}
            onChange={(e) => setFilters({...filters, environment: e.target.value})}
          >
            <option value="">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </Card>

      {/* Problem Servers Section */}
      <Card className="dashboard-page__problems">
        <div className="dashboard-section-header">
          <h2 className="dashboard-page__section-title">Servers Requiring Attention</h2>
          <button 
            onClick={() => navigate('/servers')}
            className="dashboard-action-btn"
          >
            View All
          </button>
        </div>
        
        {problemServers.length === 0 ? (
          <div className="dashboard-no-problems">
            No servers require attention at the moment
          </div>
        ) : (
          <div className="dashboard-problems-list">
            {problemServers.map((server) => (
              <div 
                key={server.id} 
                className="dashboard-problem-item"
                onClick={() => navigate(`/servers/${server.id}`)}
              >
                <div className="dashboard-problem-item__info">
                  <div className="dashboard-problem-item__name">{server.name}</div>
                  <div className="dashboard-problem-item__host">{server.host}</div>
                  <div className="dashboard-problem-item__last-seen">Last seen: {formatLastSeen(server.last_seen)}</div>
                </div>
                <Badge variant={getStatusVariant(server.status)}>
                  {getStatusLabel(server.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Alerts Section */}
      <Card className="dashboard-page__alerts">
        <div className="dashboard-section-header">
          <h2 className="dashboard-page__section-title">Recent Alerts</h2>
          <button 
            onClick={() => navigate('/alerts')}
            className="dashboard-action-btn"
          >
            View All
          </button>
        </div>
        
        {recentAlerts.length === 0 ? (
          <div className="dashboard-no-alerts">
            No recent alerts at the moment
          </div>
        ) : (
          <div className="dashboard-alerts-list">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="dashboard-alert-item"
                onClick={() => navigate(`/servers/${alert.server_id}`)}
              >
                <div className="dashboard-alert-item__info">
                  <div className="dashboard-alert-item__title">{alert.title}</div>
                  <div className="dashboard-alert-item__description">{alert.description}</div>
                  <div className="dashboard-alert-item__meta">
                    <span>Server #{alert.server_id}</span>
                    <span>{new Date(alert.last_triggered_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="dashboard-alert-item__severity">
                  <Badge variant={
                    alert.severity === 'critical' ? 'critical' :
                    alert.severity === 'high' ? 'error' :
                    alert.severity === 'medium' ? 'warning' : 'default'
                  }>
                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recently Added Servers */}
      <Card className="dashboard-page__recent">
        <div className="dashboard-section-header">
          <h2 className="dashboard-page__section-title">Recently Added Servers</h2>
          <button 
            onClick={() => navigate('/servers')}
            className="dashboard-action-btn"
          >
            View All
          </button>
        </div>
        
        {servers.length === 0 ? (
          <div className="dashboard-empty">No servers added yet</div>
        ) : (
          <div className="dashboard-recent-list">
            {servers
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((server) => (
                <div 
                  key={server.id} 
                  className="dashboard-recent-item"
                  onClick={() => navigate(`/servers/${server.id}`)}
                >
                  <div className="dashboard-recent-item__info">
                    <div className="dashboard-recent-item__name">{server.name}</div>
                    <div className="dashboard-recent-item__host">{server.host}:{server.port}</div>
                  </div>
                  <div className="dashboard-recent-item__env">
                    {server.environment ? (
                      <Badge variant={getEnvironmentVariant(server.environment)}>
                        {server.environment}
                      </Badge>
                    ) : (
                      <span className="dashboard-empty">No environment</span>
                    )}
                  </div>
                  <Badge variant={getStatusVariant(server.status)}>
                    {getStatusLabel(server.status)}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  )
}