import './Badge.css'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'secondary' | 'critical'
  className?: string
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {children}
    </span>
  )
}
