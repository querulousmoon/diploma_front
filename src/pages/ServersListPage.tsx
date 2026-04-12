import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { serversApi } from '@/api/servers'
import type { Server } from '@/types'
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { getStatusVariant, getStatusLabel, getEnvironmentVariant, formatLastSeen } from '@/utils/formatters'
import './ServersListPage.css'

export default function ServersListPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchServers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await serversApi.getAll()
      setServers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load servers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this server?')) return

    try {
      await serversApi.delete(id)
      setServers(servers.filter(s => s.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete server')
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading servers..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchServers} />
  }

  return (
    <div className="servers-list-page">
      <div className="servers-list-page__header">
        <h1 className="servers-list-page__title">Servers</h1>
        <button 
          onClick={() => navigate('/servers/new')}
          className="servers-list-page__add-btn"
        >
          <Plus size={20} />
          Add Server
        </button>
      </div>

      {servers.length === 0 ? (
        <EmptyState
          icon={<Plus size={48} />}
          title="No servers yet"
          description="Get started by adding your first server to monitor"
          action={
            <button 
              onClick={() => navigate('/servers/new')}
              className="servers-list-page__add-btn"
            >
              <Plus size={20} />
              Add Server
            </button>
          }
        />
      ) : (
        <div className="servers-table">
          <div className="servers-table__wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Host</th>
                  <th>Status</th>
                  <th>Environment</th>
                  <th>Last Seen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server) => (
                  <tr key={server.id}>
                    <td>
                      <div className="servers-table__name">{server.name}</div>
                    </td>
                    <td>
                      <div className="servers-table__host">
                        {server.host}:{server.port}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(server.status)}>
                        {getStatusLabel(server.status)}
                      </Badge>
                    </td>
                    <td>
                      {server.environment ? (
                        <Badge variant={getEnvironmentVariant(server.environment)}>
                          {server.environment}
                        </Badge>
                      ) : (
                        <span className="servers-table__empty">—</span>
                      )}
                    </td>
                    <td>{formatLastSeen(server.last_seen)}</td>
                    <td>
                      <div className="servers-table__actions">
                        <button
                          onClick={() => navigate(`/servers/${server.id}`)}
                          className="servers-table__action-btn"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/servers/${server.id}/edit`)}
                          className="servers-table__action-btn"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(server.id)}
                          className="servers-table__action-btn servers-table__action-btn--delete"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
