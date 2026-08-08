import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

/**
 * A move in flight: where the stake is headed, and whose stake it is. The owner
 * is recorded because "this account is gone, forget the move" can only be
 * concluded from the stake accounts of the SAME owner — another vault's account
 * list says nothing about this one's.
 */
export type SolanaMoveStakeDestination = {
  owner: string
  votePubkey: string
}

/**
 * Destination validators for in-flight Solana move-stake flows, keyed by the
 * moved stake account's pubkey (globally unique across owners).
 *
 * Solana has no native redelegate: a move deactivates the account now and
 * re-delegates it to the new validator only after the ~1-epoch cooldown, days
 * later. The destination is picked up front on the Move step and lives here
 * until then — it exists nowhere on-chain, so without it the user would have to
 * re-pick a validator they already chose (and Finish Move could not be offered
 * at all).
 */
export type SolanaMoveStakeDestinations = Record<
  string,
  SolanaMoveStakeDestination
>

type GetSolanaMoveStakeDestinationsFunction =
  () => Promise<SolanaMoveStakeDestinations>

type SetSolanaMoveStakeDestinationsFunction = (
  destinations: SolanaMoveStakeDestinations
) => Promise<void>

/**
 * Per-client persistence of the in-flight move destinations. Implemented by the
 * desktop (`persistentStorage`) and extension (`chrome.storage`) storage layers.
 */
export type SolanaMoveStakeDestinationsStorage = {
  getSolanaMoveStakeDestinations: GetSolanaMoveStakeDestinationsFunction
  setSolanaMoveStakeDestinations: SetSolanaMoveStakeDestinationsFunction
}

const useSolanaMoveStakeDestinationsQuery = () => {
  const { getSolanaMoveStakeDestinations } = useCore()

  return useQuery({
    queryKey: [StorageKey.solanaMoveStakeDestinations],
    queryFn: getSolanaMoveStakeDestinations,
    ...noRefetchQueryOptions,
  })
}

/**
 * Recorded move destinations. Empty while the first read is in flight — callers
 * only use it to decide which actions a stake account offers, so an empty map
 * degrades to "no move in flight" for one render rather than blocking the DeFi
 * tab on storage.
 */
export const useSolanaMoveStakeDestinations =
  (): SolanaMoveStakeDestinations => {
    const { data } = useSolanaMoveStakeDestinationsQuery()

    return data ?? {}
  }

type SetSolanaMoveStakeDestinationInput = SolanaMoveStakeDestination & {
  stakeAccount: string
}

/**
 * Records where a stake account is being moved, so the destination survives the
 * cooldown between the deactivate and the re-delegation. Re-recording the same
 * account replaces its destination.
 */
export const useSetSolanaMoveStakeDestinationMutation = () => {
  const { getSolanaMoveStakeDestinations, setSolanaMoveStakeDestinations } =
    useCore()
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async ({
      stakeAccount,
      owner,
      votePubkey,
    }: SetSolanaMoveStakeDestinationInput) => {
      const current = await getSolanaMoveStakeDestinations()
      await setSolanaMoveStakeDestinations({
        ...current,
        [stakeAccount]: { owner, votePubkey },
      })
      await refetchQueries([StorageKey.solanaMoveStakeDestinations])
    },
  })
}

/**
 * Forgets the destinations of the given stake accounts — the move landed, the
 * account was withdrawn, or a plain unstake superseded the move. Without this a
 * stale destination would keep offering Finish Move on an account whose move is
 * no longer in flight.
 */
export const useForgetSolanaMoveStakeDestinationsMutation = () => {
  const { getSolanaMoveStakeDestinations, setSolanaMoveStakeDestinations } =
    useCore()
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async (stakeAccounts: string[]) => {
      const current = await getSolanaMoveStakeDestinations()
      const remaining = Object.fromEntries(
        Object.entries(current).filter(
          ([stakeAccount]) => !stakeAccounts.includes(stakeAccount)
        )
      )
      await setSolanaMoveStakeDestinations(remaining)
      await refetchQueries([StorageKey.solanaMoveStakeDestinations])
    },
  })
}
