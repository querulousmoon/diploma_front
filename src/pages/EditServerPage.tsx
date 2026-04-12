import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { serversApi } from '@/api/servers'
import ServerForm from '@/components/ServerForm'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import type { CreateServerInput, Server } from '@/types'

export default function EditServerPage() {
  const { id } = useParams<{ id: string }>()
  const [server, setServer] = useState<Server | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServer = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const data = await serversApi.getById(parseInt(id))
        setServer(data)
      } catch (err: any) {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServer()
  }, [id])

  const handleSubmit = async (data: CreateServerInput) => {
    if (!id) return
    await serversApi.update(parseInt(id), data)
  }

  if (isLoading) {
    return <LoadingState message="Loading server..." />
  }

  if (error || !server) {
    return <ErrorState message={error || 'Server not found'} />
  }

  return (
    <ServerForm
      initialData={{
        name: server.name,
        host: server.host,
        port: server.port,
        connection_type: server.connection_type,
        environment: server.environment || '',
        tags: server.tags,
      }}
      onSubmit={handleSubmit}
      submitLabel="Update Server"
    />
  )
}
