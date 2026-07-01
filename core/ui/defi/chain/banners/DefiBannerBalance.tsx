import { AnimatedFiatAmount } from '@core/ui/chain/components/AnimatedFiatAmount'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Chain } from '@vultisig/core-chain/Chain'

import { BalanceValue } from './shared'

type DefiBannerBalanceProps = {
  chain: Chain
  value: number
}

/**
 * Total fiat shown in a DeFi chain banner, rendered with the same count-up
 * animation as the vault/DeFi home totals. The cache is scoped per vault +
 * chain so switching vaults or chains never replays a stale transition.
 */
export const DefiBannerBalance = ({ chain, value }: DefiBannerBalanceProps) => {
  const currentVaultId = useAssertCurrentVaultId()

  return (
    <BalanceValue>
      <BalanceVisibilityAware>
        <AnimatedFiatAmount
          value={value}
          cacheKey={`defi-chain-total-${currentVaultId}-${chain}`}
        />
      </BalanceVisibilityAware>
    </BalanceValue>
  )
}
