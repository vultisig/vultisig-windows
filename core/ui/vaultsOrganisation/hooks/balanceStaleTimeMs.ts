import { balanceQueryStaleTime } from '@lib/ui/query/utils/options'

// `staleTime` for the balance observers `useVaultsTotalBalances` spawns.
//
// TanStack Query evaluates `staleTime` per observer, so the vault selection
// surface has to state its own expectation rather than inherit one. It now
// matches `balanceQueryStaleTime` — the value `getBalanceQueryOptions` already
// carries — so this screen and the active vault screens agree on how long a
// cached balance stays fresh, and neither can drift from the other.
//
// The value still has to be set here: dropping it would leave these observers
// on whatever default a future refactor gives them, and it is this throttle
// that prevents the mount-time refetch storm users hit when switching between
// vault/manage/folder screens.
export const balanceStaleTimeMs = balanceQueryStaleTime
