import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import './Header.css'

export default function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="header">
      <div className="header__spacer" />
      <div className="header__user">
        <div className="header__user-info">
          <User size={18} />
          <span>{user?.name || user?.email}</span>
        </div>
        <button onClick={handleLogout} className="header__logout" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
