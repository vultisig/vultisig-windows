/** Returns the query key for a vault's agent conversation history. */
export const getAgentConversationsQueryKey = (vaultPubKey: string) =>
  ['agentConversations', vaultPubKey] as const
