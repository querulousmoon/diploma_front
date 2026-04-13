import Spinner from './Spinner'
import './LoadingState.css'

interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <Spinner size="lg" />
      <p className="loading-state__message">{message}</p>
    </div>
  )
}
