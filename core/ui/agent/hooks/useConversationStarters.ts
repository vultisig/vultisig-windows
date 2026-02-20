import { useCallback, useEffect, useRef, useState } from 'react'

import { useAgentService } from './useAgentService'

const localStarterPool = [
  "What's the price of ETH?",
  'Show my portfolio balances',
  'Set up a weekly DCA into Bitcoin',
  'Swap 50 USDC to ETH',
  'What are my most valuable holdings?',
  'How much SOL do I have?',
  'Send 0.05 BTC to my second vault',
  'What chains does my vault support?',
  'Swap 1 ETH to USDT',
  'Add Arbitrum to my vault',
  'Check my transaction history',
  'Compare the price of BTC and ETH',
  'Send 100 USDT to my address book contact',
  'What is my vault address on Ethereum?',
  'What plugins are available?',
  'Show my active policies',
  'List all my vaults',
  'Show my address book',
  'Search for PEPE token',
  'Add USDC to my vault',
]

const displayCount = 4
const refreshInterval = 30 * 60 * 1000

const pickRandom = (pool: string[], count: number): string[] => {
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

type UseConversationStartersResult = {
  starters: string[]
  isLoading: boolean
}

export const useConversationStarters = (
  vaultId: string | null
): UseConversationStartersResult => {
  const { getConversationStarters } = useAgentService()
  const [starters, setStarters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const hasFetchedRef = useRef(false)

  const fetchStarters = useCallback(
    async (showLoading: boolean) => {
      if (!vaultId) {
        setStarters(pickRandom(localStarterPool, displayCount))
        setIsLoading(false)
        return
      }

      if (showLoading) {
        setIsLoading(true)
      }

      const backendStarters = await getConversationStarters(vaultId)
      const pool =
        backendStarters.length > 0 ? backendStarters : localStarterPool
      setStarters(pickRandom(pool, displayCount))
      setIsLoading(false)
    },
    [vaultId, getConversationStarters]
  )

  useEffect(() => {
    hasFetchedRef.current = false
  }, [vaultId])

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchStarters(true)

    const timer = setInterval(() => fetchStarters(false), refreshInterval)
    return () => clearInterval(timer)
  }, [fetchStarters])

  return { starters, isLoading }
}
