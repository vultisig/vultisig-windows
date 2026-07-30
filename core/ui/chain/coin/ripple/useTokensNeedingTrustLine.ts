import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { without } from '@vultisig/lib-utils/array/without'

import { useRippleTrustLinesQuery } from './queries/useRippleTrustLinesQuery'
import { needsRippleTrustLine } from './trustLine'

type UseTokensNeedingTrustLineInput = {
  chain: Chain
  coins: CoinKey[]
}

/**
 * Token ids on `chain` that the vault holds in its asset list but has no trust
 * line for, so the balance cannot move until one is opened.
 *
 * Only XRPL has trust lines, so every other chain resolves to an empty set. The
 * set stays empty until the lines have actually loaded — an in-flight or failed
 * lookup is not evidence that a line is missing, and offering to open one the
 * user already has is worse than showing nothing.
 */
export const useTokensNeedingTrustLine = ({
  chain,
  coins,
}: UseTokensNeedingTrustLineInput): Set<string> => {
  const isRipple = chain === Chain.Ripple
  const address = useCurrentVaultAddress(chain)

  const { data: lines } = useRippleTrustLinesQuery(isRipple ? address : '')

  if (!isRipple || !lines) {
    return new Set()
  }

  return new Set(
    without(
      coins.filter(coin => !isFeeCoin(coin)).map(coin => coin.id),
      undefined
    ).filter(tokenId => needsRippleTrustLine({ tokenId, lines }))
  )
}
