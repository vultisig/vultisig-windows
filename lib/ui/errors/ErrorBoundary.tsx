import { ChildrenProp } from '@lib/ui/props'
import React from 'react'

export type ErrorState = {
  error: Error
  info: React.ErrorInfo | null
}

type ErrorBoundaryProps = ChildrenProp & {
  renderFallback?: (params: ErrorState) => React.ReactNode
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

  render() {
    const { children, renderFallback } = this.props

    if (this.state.error) {
      if (renderFallback) {
        return renderFallback(this.state.error)
      }

      return null
    }

    return children
  }
}
