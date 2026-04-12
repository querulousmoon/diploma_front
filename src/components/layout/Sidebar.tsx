import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Server, Activity } from 'lucide-react'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <Activity size={28} />
        <h1 className="sidebar__title">Server Monitor</h1>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/dashboard" className="sidebar__link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/servers" className="sidebar__link">
          <Server size={20} />
          <span>Servers</span>
        </NavLink>
      </nav>
    </aside>
  )
}
