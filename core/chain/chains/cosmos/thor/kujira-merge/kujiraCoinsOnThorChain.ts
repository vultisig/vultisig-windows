import { makeRecord } from '@lib/utils/record/makeRecord'

import { Chain } from '../../../../Chain'
import { chainFeeCoin } from '../../../../coin/chainFeeCoin'
import { KnownCoinMetadata } from '../../../../coin/Coin'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinsMigratedToThorChain,
  kujiraCoinsMigratedToThorChainSharedMetadata,
} from '.'

export const kujiraCoinsOnThorChain: Record<string, KnownCoinMetadata> =
  makeRecord(kujiraCoinsMigratedToThorChain, coin => {
    const metadata = kujiraCoinsMigratedToThorChainSharedMetadata[coin]
    const decimals = chainFeeCoin[Chain.THORChain].decimals
    const id = kujiraCoinMigratedToThorChainDestinationId[coin]

    return {
      ...metadata,
      decimals,
      id,
    }
  })
