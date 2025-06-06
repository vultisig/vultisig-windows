import { makeRecord } from '@lib/utils/record/makeRecord'

import { Chain } from '../../../../Chain'
import { chainFeeCoin } from '../../../../coin/chainFeeCoin'
import { KnownCoinMetadata } from '../../../../coin/Coin'
import { kujiraThorChainTokens, kujiraThorChainTokenSharedMetadata } from '.'

export const getKujiraTokensOnThorChain = (): Record<
  string,
  KnownCoinMetadata
> => {
  return makeRecord(kujiraThorChainTokens, ticker => {
    const metadata = kujiraThorChainTokenSharedMetadata[ticker]
    const decimals = chainFeeCoin[Chain.THORChain].decimals
    const id = `thor.${ticker.toLowerCase()}`

    return {
      ...metadata,
      decimals,
      id,
    }
  })
}
