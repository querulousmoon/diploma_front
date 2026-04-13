import { useState, useEffect } from 'react'
import { alertsApi } from '@/api/alerts'
import type { Alert } from '@/types'


import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import AlertsTable from '@/components/AlertsTable'
import './AlertsPage.css'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await alertsApi.getAll({
        limit: 100
      })
      setAlerts(data.alerts)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <LoadingState message="Loading alerts..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  return (
    <div className="alerts-page">
      <div className="alerts-page__header">
        <h1 className="alerts-page__title">Alerts</h1>
        <div className="alerts-page__actions">
          <button className="alerts-refresh-btn" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </div>

      <AlertsTable 
        alerts={alerts} 
        loading={false} 
        onRefresh={handleRefresh} 
      />
    </div>
  )
}