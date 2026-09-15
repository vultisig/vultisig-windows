import { ChildrenProp } from '@lib/ui/props'
import { useEffect, useState } from 'react'

import { StartupLoadError } from '../product/StartupLoadError'
import { StartupPlaceholder } from '../product/StartupPlaceholder'
import { loadMpcEngine } from './bootstrapMpcEngine'

type MpcEngineGateProps = ChildrenProp & {
  blocking: boolean
}

/**
 * Holds the tree on the startup placeholder until the SDK has registered the
 * MPC engine, so clients that boot behind a splash never race a signing or
 * keygen flow against the load. When not blocking, children render at once and
 * every MPC entry point awaits `loadMpcEngine` itself; the action popup warms
 * it from its idle prefetch instead.
 */
export const MpcEngineGate = ({ children, blocking }: MpcEngineGateProps) => {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!blocking) return

    loadMpcEngine().then(() => setIsReady(true), setError)
  }, [blocking])

  if (!blocking) {
    return children
  }

  if (error !== null) {
    return (
      <StartupLoadError
        error={error}
        onRetry={() => {
          setError(null)
          loadMpcEngine().then(() => setIsReady(true), setError)
        }}
      />
    )
  }

  if (!isReady) {
    return <StartupPlaceholder />
  }

  return children
}
