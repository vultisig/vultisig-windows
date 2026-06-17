import { useIsCircleIncluded } from '@core/ui/storage/circleVisibility'
import {
  isSupportedDefiChain,
  useDefiChains,
} from '@core/ui/storage/defiChains'
import { List } from '@lib/ui/list'
import { useDeferredValue, useMemo } from 'react'

import { CircleDefiItem } from '../../protocols/circle/CircleDefiItem'
import { VultStakingDefiItem } from '../../protocols/vultStaking/components/VultStakingDefiItem'
import { useDefiChainPortfolios } from '../hooks/useDefiPortfolios'
import { DefiChainItem } from './DefiChainItem'
import { useSearchChain } from './state/searchChainProvider'

export const DefiChainsList = () => {
  const { data: chainPortfolios = [] } = useDefiChainPortfolios()
  const defiChains = useDefiChains()
  const isCircleVisible = useIsCircleIncluded()
  const [searchQuery] = useSearchChain()
  const deferredQuery = useDeferredValue(searchQuery)

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const defiChainBalances = useMemo(() => {
    return chainPortfolios.filter(
      ({ chain }) => isSupportedDefiChain(chain) && defiChains.includes(chain)
    )
  }, [chainPortfolios, defiChains])

  const filteredBalances = useMemo(() => {
    if (!normalizedQuery) {
      return defiChainBalances
    }

    return defiChainBalances.filter(({ chain }) =>
      String(chain).toLowerCase().includes(normalizedQuery)
    )
  }, [normalizedQuery, defiChainBalances])

  // VULT staking is a first-party position shown unconditionally, so the DeFi
  // list always has at least one entry and never falls back to an empty state.
  return (
    <List>
      <VultStakingDefiItem />
      {isCircleVisible ? <CircleDefiItem /> : null}
      {filteredBalances.map(balance => (
        <DefiChainItem key={balance.chain} balance={balance} />
      ))}
    </List>
  )
}
