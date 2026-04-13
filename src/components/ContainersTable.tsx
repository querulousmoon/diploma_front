import { useState } from 'react'
import type { ContainerMetrics } from '@/types'
import { RefreshCw } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import './ContainersTable.css'

interface ContainersTableProps {
  serverId: number
  containers: ContainerMetrics[]
  loading: boolean
  onRefresh: () => void
}

const ContainersTable = ({ serverId, containers, loading, onRefresh }: ContainersTableProps) => {


  const [sortField, setSortField] = useState<keyof ContainerMetrics>('container_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedContainers = [...containers].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1
    if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (field: keyof ContainerMetrics) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusVariant = (status: string | null | undefined) => {
    if (!status) return 'secondary'
    
    switch (status.toLowerCase()) {
      case 'running':
        return 'success'
      case 'paused':
        return 'warning'
      case 'dead':
        return 'error'
      case 'created':
        return 'secondary'
      case 'exited':
        return 'error'
      default:
        return 'secondary'
    }
  }

  const getHealthStatusVariant = (health: string | null | undefined) => {
    if (!health) return 'secondary'
    
    switch (health.toLowerCase()) {
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

  if (loading) {
    return (
      <Card className="containers-table-container">
        <LoadingState message="Loading containers..." />
      </Card>
    )
  }

  return (
    <Card className="containers-table-container">
      <div className="containers-table-header">
        <h2 className="containers-table-title">Containers</h2>
        <button 
          className="containers-refresh-btn" 
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'rotate-animation' : ''} />
          Refresh
        </button>
      </div>

      {sortedContainers.length === 0 ? (
        <div className="containers-empty">
          No containers found for this server
        </div>
      ) : (
        <div className="containers-table-wrapper">
          <table className="containers-table">
            <thead>
              <tr>
<th>
  <div className={`sortable ${sortField === 'container_name' ? 'sorted' : ''}`}
    onClick={() => handleSort('container_name')}>
    <span>Name</span>
    {sortField === 'container_name' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
<th>
  <div className={`sortable ${sortField === 'status' ? 'sorted' : ''}`}
    onClick={() => handleSort('status')}>
    <span>Status</span>
    {sortField === 'status' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
<th>
  <div className={`sortable ${sortField === 'cpu_percentage' ? 'sorted' : ''}`}
    onClick={() => handleSort('cpu_percentage')}>
    <span>CPU</span>
    {sortField === 'cpu_percentage' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
<th>
  <div className={`sortable ${sortField === 'memory_percentage' ? 'sorted' : ''}`}
    onClick={() => handleSort('memory_percentage')}>
    <span>Memory</span>
    {sortField === 'memory_percentage' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
<th>
  <div className={`sortable ${sortField === 'restart_count' ? 'sorted' : ''}`}
    onClick={() => handleSort('restart_count')}>
    <span>Restarts</span>
    {sortField === 'restart_count' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
<th>
  <div className={`sortable ${sortField === 'health_status' ? 'sorted' : ''}`}
    onClick={() => handleSort('health_status')}>
    <span>Health</span>
    {sortField === 'health_status' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
<th>
  <div className={`sortable ${sortField === 'image' ? 'sorted' : ''}`}
    onClick={() => handleSort('image')}>
    <span>Image</span>
    {sortField === 'image' && (
      <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
    )}
  </div>
</th>
              </tr>
            </thead>
            <tbody>
              {sortedContainers.map((container) => (
                <tr key={container.id}>
                  <td>
                    <div className="container-name">
                      <span className="container-id">{container.container_id.substring(0, 12)}</span>
                      <span className="container-full-name">{container.container_name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(container.status)}>
                      {container.status || 'Unknown'}
                    </Badge>
                  </td>
                  <td>
                    {container.cpu_percentage !== undefined && container.cpu_percentage !== null ? (
                      <span className="metric-value">{container.cpu_percentage.toFixed(2)}%</span>
                    ) : (
                      <span className="metric-unavailable">-</span>
                    )}
                  </td>
                  <td>
                    {container.memory_percentage !== undefined && container.memory_percentage !== null ? (
                      <span className="metric-value">{container.memory_percentage.toFixed(2)}%</span>
                    ) : (
                      <span className="metric-unavailable">-</span>
                    )}
                  </td>
                  <td>
                    {container.restart_count !== undefined && container.restart_count !== null ? (
                      <span className="metric-value">{container.restart_count}</span>
                    ) : (
                      <span className="metric-unavailable">-</span>
                    )}
                  </td>
                  <td>
                    {container.health_status ? (
                      <Badge variant={getHealthStatusVariant(container.health_status)}>
                        {container.health_status}
                      </Badge>
                    ) : (
                      <span className="metric-unavailable">-</span>
                    )}
                  </td>
                  <td>
                    <span className="container-image">{container.image || 'N/A'}</span>
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

export default ContainersTable