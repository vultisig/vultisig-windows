import { useCallback, useEffect, useRef, useState } from 'react'

export type ConnectionState = 'disconnected' | 'connecting' | 'connected'

type UseConnectionStatusReturn = {
  state: ConnectionState
  checked: boolean
  error: string | null
  connect: (password: string) => Promise<void>
  disconnect: () => void
  clearError: () => void
}

export const useConnectionStatus = (
  vaultId: string | null
): UseConnectionStatusReturn => {
  const [state, setState] = useState<ConnectionState>('disconnected')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const scheduleRefresh = useCallback(
    (expiresAt: string) => {
      clearRefreshTimer()
      const expiryMs = new Date(expiresAt).getTime()
      const nowMs = Date.now()
      const refreshInMs = expiryMs - nowMs - 6 * 60 * 1000
      if (refreshInMs <= 0) return

      refreshTimerRef.current = setTimeout(async () => {
        if (!vaultId) return
        try {
          const info =
            await window.go.agent.AgentService.GetAuthTokenInfo(vaultId)
          if (info.connected) {
            setState('connected')
            scheduleRefresh(info.expiresAt as unknown as string)
          } else {
            setState('disconnected')
          }
        } catch {
          setState('disconnected')
        }
      }, refreshInMs)
    },
    [vaultId, clearRefreshTimer]
  )

  useEffect(() => {
    if (!vaultId) return

    let cancelled = false
    const checkStatus = async () => {
      try {
        const info =
          await window.go.agent.AgentService.GetAuthTokenInfo(vaultId)
        if (cancelled) return
        if (!info.connected) {
          setState('disconnected')
          return
        }
        const services =
          await window.go.agent.AgentService.CheckServices(vaultId)
        if (cancelled) return
        if (!services.authenticated) {
          await window.go.agent.AgentService.InvalidateAuthToken(vaultId)
          setState('disconnected')
          return
        }
        setState('connected')
        scheduleRefresh(info.expiresAt as unknown as string)
      } catch {
        if (!cancelled) {
          setState('disconnected')
        }
      } finally {
        if (!cancelled) {
          setChecked(true)
        }
      }
    }
    checkStatus()

    return () => {
      cancelled = true
    }
  }, [vaultId, scheduleRefresh])

  useEffect(() => {
    if (!window.runtime) return

    const cleanup = window.runtime.EventsOn('agent:auth_required', () => {
      setState('disconnected')
      clearRefreshTimer()
    })

    return cleanup
  }, [clearRefreshTimer])

  useEffect(() => {
    if (!window.runtime || !vaultId) return

    const cleanup = window.runtime.EventsOn('agent:auth_connected', () => {
      window.go.agent.AgentService.GetAuthTokenInfo(vaultId)
        .then(info => {
          if (info.connected) {
            setState('connected')
            scheduleRefresh(info.expiresAt as unknown as string)
          }
        })
        .catch(() => {})
    })

    return cleanup
  }, [vaultId, scheduleRefresh])

  useEffect(() => {
    return () => clearRefreshTimer()
  }, [clearRefreshTimer])

  const connect = useCallback(
    async (password: string) => {
      if (!vaultId) return
      setState('connecting')
      setError(null)
      try {
        await window.go.agent.AgentService.SignIn(vaultId, password)
        const info =
          await window.go.agent.AgentService.GetAuthTokenInfo(vaultId)
        setState('connected')
        if (info.connected) {
          scheduleRefresh(info.expiresAt as unknown as string)
        }
      } catch (err) {
        setState('disconnected')
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'Sign in failed'
        setError(message)
        throw err
      }
    },
    [vaultId, scheduleRefresh]
  )

  const disconnect = useCallback(() => {
    if (!vaultId) return
    clearRefreshTimer()
    setState('disconnected')
    window.go.agent.AgentService.Disconnect(vaultId).catch(() => {})
  }, [vaultId, clearRefreshTimer])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { state, checked, error, connect, disconnect, clearError }
}
