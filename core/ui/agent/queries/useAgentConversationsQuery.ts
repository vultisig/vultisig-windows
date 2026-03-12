import { useQuery } from '@tanstack/react-query'

import { useAgentService } from '../hooks/useAgentService'
import { getAgentConversationsQueryKey } from './queryKeys'

/**
 * Returns the cached conversation history for the current vault and keeps it
 * warm long enough for back-navigation to feel instant.
 */
export const useAgentConversationsQuery = (vaultPubKey: string | null) => {
  const { getConversations } = useAgentService()

  return useQuery({
    queryKey:
      vaultPubKey === null
        ? ['agentConversations', null]
        : getAgentConversationsQueryKey(vaultPubKey),
    queryFn: async () => getConversations(vaultPubKey ?? ''),
    enabled: vaultPubKey !== null,
    staleTime: 60_000,
  })
}
