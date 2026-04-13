import { useState, useEffect } from 'react'
import { serversApi } from '@/api/servers'
import { Play, Square, RotateCcw, Trash2, HardDrive, Cpu, Activity } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import './ContainerList.css'

interface Container {
  id: number
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
  extra_data?: {
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

interface ContainerListProps {
  serverId: number
}

const ContainerList = ({ serverId }: ContainerListProps) => {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({})
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{[key: string]: boolean}>({})
  const [forceDelete, setForceDelete] = useState<{[key: string]: boolean}>({})

  const fetchContainers = async () => {
    setLoading(true)
    try {
      // Use existing API from serversApi since it's the same endpoint
      const data = await serversApi.getContainers(serverId)
      setContainers(data as Container[])
    } catch (error) {
      console.error('Failed to fetch containers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
  }, [serverId])

  const handleAction = async (containerId: string, action: string) => {
    setActionLoading(prev => ({ ...prev, [containerId]: true }))

    try {
      let response: any
      switch (action) {
        case 'start':
          response = await serversApi.startContainer(serverId, containerId)
          break
        case 'stop':
          response = await serversApi.stopContainer(serverId, containerId)
          break
        case 'restart':
          response = await serversApi.restartContainer(serverId, containerId)
          break
        case 'delete':
          response = await serversApi.deleteContainer(serverId, containerId, forceDelete[containerId] || false)
          break
        default:
          throw new Error('Invalid action')
      }

      if (response) {
        // Show notification message
        alert(response.message || `${action.charAt(0).toUpperCase() + action.slice(1)} successful`)
        // Refresh the container list
        await fetchContainers()
      }
      
      // Close confirmation dialog if it was open
      setShowDeleteConfirmation(prev => ({ ...prev, [containerId]: false }))
      setForceDelete(prev => ({ ...prev, [containerId]: false }))
    } catch (error: any) {
      console.error(`Failed to ${action} container:`, error)
      alert(error.message || `Failed to ${action} container`)
    } finally {
      setActionLoading(prev => ({ ...prev, [containerId]: false }))
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'success'
      case 'exited':
        return 'secondary'
      case 'dead':
        return 'error'
      default:
        return 'warning'
    }
  }

  const getHealthStatusVariant = (healthStatus: string) => {
    switch (healthStatus.toLowerCase()) {
      case 'healthy':
        return 'success'
      case 'unhealthy':
        return 'error'
      case 'starting':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getShortContainerId = (id: string) => {
    return id.substring(0, 12)
  }

  if (loading) {
    return (
      <Card className="container-list-container">
        <LoadingState message="Loading containers..." />
      </Card>
    )
  }

  return (
    <Card className="container-list-container">
      <div className="container-list-header">
        <h2 className="container-list-title">Containers</h2>
      </div>

      <div className="container-list-wrapper">
        <table className="container-list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Status</th>
              <th>Image</th>
              <th>Ports</th>
              <th>Health</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Restarts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {containers.map(container => (
              <tr key={container.id} className="container-row">
                <td className="container-name-cell">
                  {container.container_name}
                </td>
                <td>
                  <code className="container-id">{getShortContainerId(container.container_id)}</code>
                </td>
                <td>
                  <Badge variant={getStatusVariant(container.status)}>
                    {container.status}
                  </Badge>
                </td>
                <td>
                  <span className="container-image">{container.image}</span>
                </td>
                <td>
                  <span className="container-ports">{container.ports || (container.extra_data?.ports) || '-'}</span>
                </td>
                <td>
                  <div className="health-cell">
                    <Badge variant={getHealthStatusVariant(container.extra_data?.health_status || container.health_status)}>
                      {container.extra_data?.health_status || container.health_status}
                    </Badge>
                  </div>
                </td>
                <td>
                  {container.extra_data?.cpu_percentage !== null && container.extra_data?.cpu_percentage !== undefined ? (
                    <div className="metric-cell">
                      <Cpu size={14} />
                      <span>{container.extra_data.cpu_percentage.toFixed(2)}%</span>
                    </div>
                  ) : container.cpu_percentage !== null && container.cpu_percentage !== undefined ? (
                    <div className="metric-cell">
                      <Cpu size={14} />
                      <span>{container.cpu_percentage.toFixed(2)}%</span>
                    </div>
                  ) : (
                    <span className="metric-unavailable">-</span>
                  )}
                </td>
                <td>
                  {container.extra_data?.memory_percentage !== null && container.extra_data?.memory_percentage !== undefined ? (
                    <div className="metric-cell">
                      <HardDrive size={14} />
                      <span>{container.extra_data.memory_percentage.toFixed(2)}%</span>
                    </div>
                  ) : container.memory_percentage !== null && container.memory_percentage !== undefined ? (
                    <div className="metric-cell">
                      <HardDrive size={14} />
                      <span>{container.memory_percentage.toFixed(2)}%</span>
                    </div>
                  ) : (
                    <span className="metric-unavailable">-</span>
                  )}
                </td>
                <td>
                  {container.restart_count !== undefined && container.restart_count !== null ? (
                    <div className="metric-cell">
                      <Activity size={14} />
                      <span>{container.restart_count}</span>
                    </div>
                  ) : container.extra_data?.restart_count !== undefined && container.extra_data?.restart_count !== null ? (
                    <div className="metric-cell">
                      <Activity size={14} />
                      <span>{container.extra_data.restart_count}</span>
                    </div>
                  ) : (
                    <span className="metric-unavailable">-</span>
                  )}
                </td>
                <td className="container-actions-cell">
                  <div className="container-actions">
                    {container.status !== 'running' && (
                      <button
                        className="container-action-btn container-action-btn--start"
                        onClick={() => handleAction(container.container_id, 'start')}
                        disabled={actionLoading[container.container_id]}
                        title="Start container"
                      >
                        {actionLoading[container.container_id] ? (
                          <RotateCcw className="action-spinner" size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                    )}
                    
                    {container.status === 'running' && (
                      <button
                        className="container-action-btn container-action-btn--stop"
                        onClick={() => handleAction(container.container_id, 'stop')}
                        disabled={actionLoading[container.container_id]}
                        title="Stop container"
                      >
                        {actionLoading[container.container_id] ? (
                          <RotateCcw className="action-spinner" size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    )}
                    
                    <button
                      className="container-action-btn container-action-btn--restart"
                      onClick={() => handleAction(container.container_id, 'restart')}
                      disabled={actionLoading[container.container_id]}
                      title="Restart container"
                    >
                      {actionLoading[container.container_id] ? (
                        <RotateCcw className="action-spinner" size={16} />
                      ) : (
                        <RotateCcw size={16} />
                      )}
                    </button>
                    
                    <button
                      className="container-action-btn container-action-btn--delete"
                      onClick={() => setShowDeleteConfirmation(prev => ({ ...prev, [container.container_id]: true }))}
                      title="Delete container"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {showDeleteConfirmation[container.container_id] && (
                    <div className="delete-confirmation-modal">
                      <div className="delete-confirmation-content">
                        <h3>Delete Container</h3>
                        <p>Are you sure you want to delete container "<strong>{container.container_name}</strong>"?</p>
                        <p>This action cannot be undone.</p>
                        
                        <div className="delete-confirmation-options">
                          <label>
                            <input
                              type="checkbox"
                              checked={forceDelete[container.container_id]}
                              onChange={(e) => setForceDelete(prev => ({ ...prev, [container.container_id]: e.target.checked }))}
                            />
                            Force deletion
                          </label>
                        </div>
                        
                        <div className="delete-confirmation-buttons">
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setShowDeleteConfirmation(prev => ({ ...prev, [container.container_id]: false }))
                              setForceDelete(prev => ({ ...prev, [container.container_id]: false }))
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleAction(container.container_id, 'delete')}
                            disabled={actionLoading[container.container_id]}
                          >
                            {actionLoading[container.container_id] ? (
                              <>
                                <RotateCcw className="action-spinner" size={16} />
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default ContainerList