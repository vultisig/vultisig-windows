import { useMemo } from 'react'

const defaultStarters = [
  "What's the price of ETH?",
  'Show my portfolio balances',
  'Set up a weekly DCA into Bitcoin',
  'Send 0.1 ETH to my other vault',
]

type UseConversationStartersResult = {
  starters: string[]
  isLoading: boolean
}

export const useConversationStarters = (
  _vaultId: string | null
): UseConversationStartersResult => {
  const starters = useMemo(() => defaultStarters, [])
  return { starters, isLoading: false }
}
