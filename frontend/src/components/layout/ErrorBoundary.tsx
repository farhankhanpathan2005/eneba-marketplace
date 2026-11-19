import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>We encountered an unexpected error. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', background: '#7c4ddb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
