import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Chain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'

import { resolveThorchainStakedSelection } from './stakedSelection'

/**
 * Opens the THORChain Staked tab from outside the DeFi tab, where neither of
 * the lists the tab reads can be assumed: THORChain is not on the DeFi tab
 * until the user adds it, and its stake positions are not selected until
 * something selects them. An entry point that only navigated would land on the
 * "no positions selected" state, so the selection is seeded first - see
 * {@link resolveThorchainStakedSelection} for what counts as unseeded.
 *
 * Writing the selection is best-effort - a Staked tab the user has to populate
 * themselves still beats a tap that goes nowhere.
 */
export const useOpenThorchainStaked = () => {
  const navigate = useCoreNavigate()
  const { getDefiChains, setDefiChains, getDefiPositions, setDefiPositions } =
    useCore()
  const refetchQueries = useRefetchQueries()

  const selectThorchainStaked = async () => {
    const selection = resolveThorchainStakedSelection({
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
    await attempt(selectThorchainStaked)

    navigate({
      id: 'defiChainDetail',
      state: { chain: Chain.THORChain, tab: 'staked' },
    })
  }
}
