import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ServersListPage from '@/pages/ServersListPage'
import ServerDetailsPage from '@/pages/ServerDetailsPage'
import CreateServerPage from '@/pages/CreateServerPage'
import EditServerPage from '@/pages/EditServerPage'
import AppLayout from '@/components/layout/AppLayout'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/servers" element={<ServersListPage />} />
          <Route path="/servers/new" element={<CreateServerPage />} />
          <Route path="/servers/:id" element={<ServerDetailsPage />} />
          <Route path="/servers/:id/edit" element={<EditServerPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
