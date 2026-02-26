import { useEffect, useRef, useState } from 'react'

import type { AgentOrchestrator } from '../orchestrator'

type ConnectionState = 'disconnected' | 'connecting' | 'connected'

type UseConnectionStatusReturn = {
  state: ConnectionState
  checked: boolean
  error: string | null
  connect: (password: string) => Promise<void>
  disconnect: () => void
  clearError: () => void
}

export const useConnectionStatus = (
  vaultId: string | null,
  orchestrator?: AgentOrchestrator
): UseConnectionStatusReturn => {
  const [state, setState] = useState<ConnectionState>('disconnected')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const orchestratorRef = useRef(orchestrator)
  orchestratorRef.current = orchestrator
  const vaultIdRef = useRef(vaultId)
  vaultIdRef.current = vaultId

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }

  const scheduleRefreshRef = useRef<(expiresAt: string) => void>(() => {})
  scheduleRefreshRef.current = (expiresAt: string) => {
    clearRefreshTimer()
    const expiryMs = new Date(expiresAt).getTime()
    const nowMs = Date.now()
    const refreshInMs = expiryMs - nowMs - 6 * 60 * 1000
    if (refreshInMs <= 0) return

    refreshTimerRef.current = setTimeout(async () => {
      const orch = orchestratorRef.current
      const vid = vaultIdRef.current
      if (!vid || !orch) return
      try {
        const refreshed = await orch.refreshToken(vid)
        if (!refreshed) {
          setState('disconnected')
          return
        }
        const info = orch.getTokenInfo(vid)
        if (info.connected) {
          setState('connected')
          scheduleRefreshRef.current(info.expiresAt)
        } else {
          setState('disconnected')
        }
      } catch {
        setState('disconnected')
      }
    }, refreshInMs)
  }

  useEffect(() => {
    if (!vaultId || !orchestrator) return

    let cancelled = false
    const checkStatus = async () => {
      try {
        const info = orchestrator.getTokenInfo(vaultId)
        if (cancelled) return
        if (!info.connected) {
          setState('disconnected')
          return
        }
        const services = await orchestrator.checkServices(vaultId)
        if (cancelled) return
        if (!services.authenticated) {
          const refreshed = await orchestrator.refreshToken(vaultId)
          if (cancelled) return
          if (!refreshed) {
            orchestrator.invalidateToken(vaultId)
            setState('disconnected')
            return
          }
          const refreshedInfo = orchestrator.getTokenInfo(vaultId)
          if (refreshedInfo.connected) {
            setState('connected')
            scheduleRefreshRef.current(refreshedInfo.expiresAt)
          } else {
            orchestrator.invalidateToken(vaultId)
            setState('disconnected')
          }
          return
        }
        setState('connected')
        scheduleRefreshRef.current(info.expiresAt)
      } catch {
        if (!cancelled) {
          const info = orchestrator.getTokenInfo(vaultId)
          if (info.connected) {
            setState('connected')
            scheduleRefreshRef.current(info.expiresAt)
          } else {
            setState('disconnected')
          }
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
  }, [vaultId, orchestrator])

  useEffect(() => {
    if (!orchestrator) return

    return orchestrator.events.on('auth_required', () => {
      setState('disconnected')
      clearRefreshTimer()
    })
  }, [orchestrator])

  useEffect(() => {
    if (!orchestrator || !vaultId) return

    return orchestrator.events.on('auth_connected', () => {
      const orch = orchestratorRef.current
      const vid = vaultIdRef.current
      if (!orch || !vid) return
      const info = orch.getTokenInfo(vid)
      if (info.connected) {
        setState('connected')
        scheduleRefreshRef.current(info.expiresAt)
      }
    })
  }, [orchestrator, vaultId])

  useEffect(() => {
    return () => clearRefreshTimer()
  }, [])

  const connect = async (password: string) => {
    if (!vaultId || !orchestrator) return
    setState('connecting')
    setError(null)
    try {
      await orchestrator.signIn({ vaultPubKey: vaultId, password })
      const info = orchestrator.getTokenInfo(vaultId)
      setState('connected')
      if (info.connected) {
        scheduleRefreshRef.current(info.expiresAt)
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
  }

  const disconnect = () => {
    if (!vaultId || !orchestrator) return
    clearRefreshTimer()
    setState('disconnected')
    orchestrator.disconnect(vaultId)
  }

  const clearError = () => {
    setError(null)
  }

  return { state, checked, error, connect, disconnect, clearError }
}
