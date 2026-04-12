import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serversApi } from '@/api/servers'
import type { Server, ServerDetails, ServerMetrics, Container } from '@/types'
import { ArrowLeft, Edit2, Cpu, HardDrive, Network, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { getStatusVariant, getStatusLabel, getEnvironmentVariant, formatLastSeen, formatPercentage } from '@/utils/formatters'
import './ServerDetailsPage.css'

export default function ServerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [server, setServer] = useState<Server | null>(null)
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null)
  const [containers, setContainers] = useState<Container[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServer = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const [serverData, metricsData, containersData] = await Promise.all([
        serversApi.getById(parseInt(id)),
        serversApi.getLatestMetrics(parseInt(id)),
        serversApi.getContainers(parseInt(id)),
      ])

      setServer(serverData)
      setMetrics(metricsData)
      setContainers(containersData || [])
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load server details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServer()
  }, [id])

  if (isLoading) {
    return <LoadingState message="Loading server details..." />
  }

  if (error || !server) {
    return <ErrorState message={error || 'Server not found'} onRetry={fetchServer} />
  }

  return (
    <div className="server-details-page">
      <div className="server-details-page__header">
        <button 
          onClick={() => navigate('/servers')}
          className="server-details-page__back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="server-details-page__header-content">
          <h1 className="server-details-page__title">{server.name}</h1>
          <div className="server-details-page__badges">
            <Badge variant={getStatusVariant(server.status)}>
              {getStatusLabel(server.status)}
            </Badge>
            {server.environment && (
              <Badge variant={getEnvironmentVariant(server.environment)}>
                {server.environment}
              </Badge>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate(`/servers/${id}/edit`)}
          className="server-details-page__edit-btn"
        >
          <Edit2 size={18} />
          Edit
        </button>
      </div>

      <div className="server-details-page__info">
        <Card>
          <h2 className="server-details-page__section-title">Server Information</h2>
          <div className="server-info-grid">
            <div className="server-info-item">
              <div className="server-info-item__label">Host</div>
              <div className="server-info-item__value">{server.host}:{server.port}</div>
            </div>
            <div className="server-info-item">
              <div className="server-info-item__label">Connection Type</div>
              <div className="server-info-item__value">{server.connection_type.toUpperCase()}</div>
            </div>
            <div className="server-info-item">
              <div className="server-info-item__label">Last Seen</div>
              <div className="server-info-item__value">
                <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                {formatLastSeen(server.last_seen)}
              </div>
            </div>
            <div className="server-info-item">
              <div className="server-info-item__label">Tags</div>
              <div className="server-info-item__tags">
                {server.tags.length > 0 ? (
                  server.tags.map(tag => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))
                ) : (
                  <span className="server-info-item__empty">No tags</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {metrics && (
        <div className="server-details-page__metrics">
          <Card className="server-metric-card">
            <div className="server-metric-card__header">
              <div className="server-metric-card__icon server-metric-card__icon--cpu">
                <Cpu size={24} />
              </div>
              <h3 className="server-metric-card__title">CPU Usage</h3>
            </div>
            <div className="server-metric-card__value">
              {formatPercentage(metrics.cpu_usage_percent)}
            </div>
            <div className="server-metric-card__bar">
              <div 
                className="server-metric-card__bar-fill server-metric-card__bar-fill--cpu"
                style={{ width: `${metrics.cpu_usage_percent ?? 0}%` }}
              />
            </div>
            <div className="server-metric-card__details">
              <div className="server-metric-card__detail">
                <span>Load (1m):</span>
                <strong>{metrics.load_average_1m?.toFixed(2) ?? 'N/A'}</strong>
              </div>
              <div className="server-metric-card__detail">
                <span>Load (5m):</span>
                <strong>{metrics.load_average_5m?.toFixed(2) ?? 'N/A'}</strong>
              </div>
              <div className="server-metric-card__detail">
                <span>Load (15m):</span>
                <strong>{metrics.load_average_15m?.toFixed(2) ?? 'N/A'}</strong>
              </div>
            </div>
          </Card>

          <Card className="server-metric-card">
            <div className="server-metric-card__header">
              <div className="server-metric-card__icon server-metric-card__icon--ram">
                <HardDrive size={24} />
              </div>
              <h3 className="server-metric-card__title">Memory</h3>
            </div>
            <div className="server-metric-card__value">
              {formatPercentage(metrics.memory_usage_percent)}
            </div>
            <div className="server-metric-card__bar">
              <div 
                className="server-metric-card__bar-fill server-metric-card__bar-fill--ram"
                style={{ width: `${metrics.memory_usage_percent ?? 0}%` }}
              />
            </div>
            <div className="server-metric-card__details">
              <div className="server-metric-card__detail">
                <span>Used:</span>
                <strong>{metrics.memory_used_mb ? `${(metrics.memory_used_mb / 1024).toFixed(1)} GB` : 'N/A'}</strong>
              </div>
              <div className="server-metric-card__detail">
                <span>Total:</span>
                <strong>{metrics.memory_total_mb ? `${(metrics.memory_total_mb / 1024).toFixed(1)} GB` : 'N/A'}</strong>
              </div>
            </div>
          </Card>

          <Card className="server-metric-card">
            <div className="server-metric-card__header">
              <div className="server-metric-card__icon server-metric-card__icon--disk">
                <HardDrive size={24} />
              </div>
              <h3 className="server-metric-card__title">Disk</h3>
            </div>
            <div className="server-metric-card__value">
              {formatPercentage(metrics.disk_usage_percent)}
            </div>
            <div className="server-metric-card__bar">
              <div 
                className="server-metric-card__bar-fill server-metric-card__bar-fill--disk"
                style={{ width: `${metrics.disk_usage_percent ?? 0}%` }}
              />
            </div>
            <div className="server-metric-card__details">
              <div className="server-metric-card__detail">
                <span>Used:</span>
                <strong>{metrics.disk_used_gb ? `${metrics.disk_used_gb.toFixed(1)} GB` : 'N/A'}</strong>
              </div>
              <div className="server-metric-card__detail">
                <span>Total:</span>
                <strong>{metrics.disk_total_gb ? `${metrics.disk_total_gb.toFixed(1)} GB` : 'N/A'}</strong>
              </div>
            </div>
          </Card>

          <Card className="server-metric-card">
            <div className="server-metric-card__header">
              <div className="server-metric-card__icon server-metric-card__icon--network">
                <Network size={24} />
              </div>
              <h3 className="server-metric-card__title">Network</h3>
            </div>
            <div className="server-metric-card__network">
              <div className="server-metric-card__network-item">
                <span className="server-metric-card__network-label">In:</span>
                <span className="server-metric-card__network-value">
                  {metrics.network_in_bytes ? `${(metrics.network_in_bytes / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </span>
              </div>
              <div className="server-metric-card__network-item">
                <span className="server-metric-card__network-label">Out:</span>
                <span className="server-metric-card__network-value">
                  {metrics.network_out_bytes ? `${(metrics.network_out_bytes / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </span>
              </div>
            </div>
            {metrics.uptime_seconds && (
              <div className="server-metric-card__uptime">
                <span>Uptime:</span>
                <strong>{Math.floor(metrics.uptime_seconds / 86400)}d {Math.floor((metrics.uptime_seconds % 86400) / 3600)}h</strong>
              </div>
            )}
          </Card>
        </div>
      )}

      {!metrics && (
        <Card className="server-details-page__no-metrics">
          <div className="no-metrics-content">
            <Cpu size={48} />
            <h3>No Metrics Available</h3>
            <p>Metrics have not been collected yet for this server.</p>
          </div>
        </Card>
      )}

      <Card className="server-details-page__containers">
        <h2 className="server-details-page__section-title">Containers</h2>
        {containers.length === 0 ? (
          <div className="server-containers-empty">No containers detected</div>
        ) : (
          <div className="server-containers-table">
            <table>
              <thead>
                <tr>
                  <th>Container ID</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Collected At</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr key={container.id}>
                    <td>
                      <code className="server-container-id">{container.container_id}</code>
                    </td>
                    <td>
                      <div className="server-container-name">{container.container_name}</div>
                    </td>
                    <td>
                      <span className="server-container-image">{container.image || '—'}</span>
                    </td>
                    <td>
                      {container.status ? (
                        <Badge 
                          variant={
                            container.status === 'running' ? 'success' : 
                            container.status === 'paused' ? 'warning' : 'error'
                          }
                        >
                          {container.status}
                        </Badge>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="server-container-collected">
                      {new Date(container.collected_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
