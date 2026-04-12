import { AlertCircle } from 'lucide-react'
import './ErrorState.css'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <AlertCircle size={48} className="error-state__icon" />
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-state__retry">
          Try again
        </button>
      )}
    </div>
  )
}
