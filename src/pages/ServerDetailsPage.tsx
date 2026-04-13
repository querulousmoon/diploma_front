import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { serversApi } from '@/api/servers'
import { alertsApi } from '@/api/alerts'
import type { Server, ServerMetrics, Alert } from '@/types'
import { ContainerMetrics } from '@/types'
import { ArrowLeft, Edit2, Cpu, HardDrive, Network, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { Tabs, Tab } from '@/components/ui/Tabs'
import { getStatusVariant, getStatusLabel, getEnvironmentVariant, formatLastSeen, formatPercentage } from '@/utils/formatters'
import './ServerDetailsPage.css'

// Import the new components that we'll create
import MetricsChart from '@/components/MetricsChart'
import ContainerList from '@/components/ContainerList'
import AlertsTable from '@/components/AlertsTable'
import WebConsole from '@/components/WebConsole'

export default function ServerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [server, setServer] = useState<Server | null>(null)
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertsLoading, setAlertsLoading] = useState(false)

  const fetchServer = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const serverData = await serversApi.getById(parseInt(id))
      setServer(serverData)

      // Load initial metrics data only
      const metricsData = await serversApi.getLatestMetrics(parseInt(id))
      setMetrics(metricsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load server details')
    } finally {
      setIsLoading(false)
    }
  }

  // Separate loading functions for each tab to avoid blocking the UI
  const loadAlerts = async () => {
    if (!id) return
    
    setAlertsLoading(true)
    try {
      const data = await alertsApi.getAll({ 
        server_id: parseInt(id),
        limit: 50 
      })
      setAlerts(data.alerts)
    } catch (err: any) {
      console.error('Failed to load alerts:', err)
    } finally {
      setAlertsLoading(false)
    }
  }

  useEffect(() => {
    fetchServer()
  }, [id])

  // Load data for the active tab when it changes
  useEffect(() => {
    if (activeTab === 'alerts' && alerts.length === 0) {
      loadAlerts()
    }
  }, [activeTab])

  if (isLoading) {
    return <LoadingState message="Loading server details..." />
  }

  if (error || !server) {
    return <ErrorState message={error || 'Server not found'} onRetry={fetchServer} />
  }

  return (
    <div className="server-details-page">
      <div className="server-details-page__header">
        <Link 
          to='/servers'
          className="server-details-page__back-btn"
        >
          <ArrowLeft size={20} />
        </Link>
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

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        {/* Overview Tab */}
        <Tab value="overview" label="Overview">
          <div className="server-details-tab-content">
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
          </div>
        </Tab>

        {/* Metrics Tab */}
        <Tab value="metrics" label="Metrics">
          <div className="server-details-tab-content">
            <MetricsChart serverId={parseInt(id!)} />
          </div>
        </Tab>

        {/* Containers Tab */}
        <Tab value="containers" label="Containers">
          <div className="server-details-tab-content">
            <ContainerList 
              serverId={parseInt(id!)} 
            />
          </div>
        </Tab>

        {/* Alerts Tab */}
        <Tab value="alerts" label="Alerts">
          <div className="server-details-tab-content">
            <AlertsTable 
              serverId={parseInt(id!)} 
              loading={alertsLoading}
              alerts={alerts}
              onRefresh={loadAlerts}
            />
          </div>
        </Tab>

        {/* Console Tab */}
        <Tab value="console" label="Console">
          <div className="server-details-tab-content">
            <WebConsole serverId={parseInt(id!)} serverName={server.name} />
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}