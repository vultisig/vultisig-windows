// Shared `staleTime` for the balance observers `useVaultsTotalBalances`
// spawns.
//
// Balances barely change in the seconds-to-minutes range relevant to the
// vault selection screen; 1 minute is aligned with other balance-style
// queries in the codebase (`useMayaLpPositionsQuery`,
// `useAgentConversationsQuery`, etc.) and is enough to prevent the
// mount-time refetch storm users hit when switching between
// vault/manage/folder screens.
//
// TanStack Query evaluates `staleTime` per observer, so this value must be
// set on every balance observer we spawn from the vault selection surface.
// Other consumers in the app (e.g. `useBalanceQuery` in the active vault
// screens) keep their default `staleTime: 0` — their fresher expectations
// are unaffected by our observers sharing the same cache key.
export const balanceStaleTimeMs = 60_000
