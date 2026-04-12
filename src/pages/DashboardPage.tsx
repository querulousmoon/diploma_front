import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { serversApi } from '@/api/servers'
import type { Server } from '@/types'
import { Server as ServerIcon, Activity, AlertTriangle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { getStatusVariant, getStatusLabel, formatLastSeen } from '@/utils/formatters'
import './DashboardPage.css'

export default function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await serversApi.getAll()
      setServers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  const onlineCount = servers.filter(s => s.status === 'online').length
  const offlineCount = servers.filter(s => s.status === 'offline').length
  const warningCount = servers.filter(s => s.status === 'warning').length

  const problemServers = servers.filter(s => s.status === 'offline' || s.status === 'warning')

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
      </div>

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
      </div>

      {problemServers.length > 0 && (
        <Card className="dashboard-page__problems">
          <h2 className="dashboard-page__section-title">Servers Requiring Attention</h2>
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
        </Card>
      )}

      <Card className="dashboard-page__recent">
        <div className="dashboard-page__recent-header">
          <h2 className="dashboard-page__section-title">Recent Servers</h2>
          <button 
            onClick={() => navigate('/servers')}
            className="dashboard-page__view-all"
          >
            View All
          </button>
        </div>
        <div className="dashboard-recent-list">
          {servers.length === 0 ? (
            <div className="dashboard-empty">No servers added yet</div>
          ) : (
            servers.slice(0, 5).map((server) => (
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
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
