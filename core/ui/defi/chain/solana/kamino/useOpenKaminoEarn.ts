import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Chain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'

import { resolveKaminoEarnSelection } from './earnSelection'

/**
 * Opens Kamino Earn from outside the DeFi tab, where neither of the lists the
 * Earn tab reads can be assumed: Solana is not on the DeFi tab until the user
 * adds it, and the curated vaults are not selected until something selects
 * them. An entry point that only navigated would land on the "no positions
 * selected" state, so the selection is seeded first - see
 * {@link resolveKaminoEarnSelection} for what counts as unseeded.
 *
 * Writing the selection is best-effort - an Earn tab the user has to populate
 * themselves still beats a tap that goes nowhere.
 */
export const useOpenKaminoEarn = () => {
  const navigate = useCoreNavigate()
  const { getDefiChains, setDefiChains, getDefiPositions, setDefiPositions } =
    useCore()
  const refetchQueries = useRefetchQueries()

  const selectKaminoEarn = async () => {
    const selection = resolveKaminoEarnSelection({
      defiChains: await getDefiChains(),
      defiPositions: await getDefiPositions(),
    })

    if (selection.defiChains) {
      await setDefiChains(selection.defiChains)
      await refetchQueries([StorageKey.defiChains])
    }

    if (selection.defiPositions) {
      await setDefiPositions(selection.defiPositions)
      await refetchQueries([StorageKey.defiPositions])
    }
  }

  return async () => {
    await attempt(selectKaminoEarn)

    navigate({
      id: 'defiChainDetail',
      state: { chain: Chain.Solana, tab: 'earn' },
    })
  }
}
