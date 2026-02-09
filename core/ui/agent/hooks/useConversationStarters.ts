import { useCallback, useEffect, useState } from 'react'

import { useAgentService } from './useAgentService'

type UseConversationStartersResult = {
  starters: string[]
  isLoading: boolean
  refresh: () => Promise<void>
}

export const useConversationStarters = (
  vaultId: string | null
): UseConversationStartersResult => {
  const { getConversationStarters, generateConversationStarters } =
    useAgentService()
  const [starters, setStarters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!vaultId) {
      setStarters([])
      return
    }

    setIsLoading(true)
    try {
      const immediate = await getConversationStarters(vaultId)
      setStarters((immediate || []).slice(0, 4))
    } catch {
      try {
        const fallback = await getConversationStarters(vaultId)
        setStarters((fallback || []).slice(0, 4))
      } catch {
        setStarters([])
      }
    } finally {
      setIsLoading(false)
    }

    // Refresh cache for next open and update current UI if a new batch is ready.
    generateConversationStarters(vaultId)
      .then(async () => {
        try {
          const latest = await getConversationStarters(vaultId)
          setStarters((latest || []).slice(0, 4))
        } catch {
          // keep current starters
        }
      })
      .catch(() => {})
  }, [generateConversationStarters, getConversationStarters, vaultId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { starters, isLoading, refresh }
}
