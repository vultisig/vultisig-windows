import { ChildrenProp } from '@lib/ui/props'
import React, { ComponentType } from 'react'

type ErrorState = {
  error: Error
  info: React.ErrorInfo | null
}

export type ErrorBoundaryFallbackProps = ErrorState & {
  clearError: () => void
}

type ErrorBoundaryProps = ChildrenProp & {
  fallback?: ComponentType<ErrorBoundaryFallbackProps>
}

type ErrorBoundaryState = {
  error: ErrorState | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error: { error, info: null } }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error: { error, info } })
  }

  render = () => {
    const { children, fallback: Fallback } = this.props

    if (this.state.error) {
      if (Fallback) {
        return (
          <Fallback
            {...this.state.error}
            clearError={() => this.setState({ error: null })}
          />
        )
      }

      return null
    }

    return children
  }
}
