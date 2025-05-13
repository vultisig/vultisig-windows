import { ChildrenProp } from '@lib/ui/props'
import React, { ComponentType } from 'react'

type ErrorState = {
  error: Error
  info: React.ErrorInfo | null
}

export type ErrorBoundaryFallbackProps = ErrorState & {
  clearError: () => void
}

export type ErrorBoundaryProcessError = (error: Error) => Error | null

type ErrorBoundaryProps = ChildrenProp & {
  fallback?: ComponentType<ErrorBoundaryFallbackProps>
  processError?: ErrorBoundaryProcessError
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
    const { processError } = this.props
    if (processError) {
      const processedError = processError(error)
      if (processedError) {
        this.setState({ error: { error: processedError, info } })
      } else {
        this.setState({ error: null })
      }
    } else {
      this.setState({ error: { error, info } })
    }
  }

  render = () => {
    const { children, fallback: Fallback } = this.props

    if (this.state.error) {
      if (Fallback && this.state.error.info) {
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
