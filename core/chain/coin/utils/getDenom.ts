import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { CosmosChain } from '../../Chain'
import { cosmosFeeCoinDenom } from '../../chains/cosmos/cosmosFeeCoinDenom'
import { CoinKey } from '../Coin'
import { isFeeCoin } from './isFeeCoin'

export const getDenom = (coin: CoinKey<CosmosChain>): string => {
  if (isFeeCoin(coin)) return shouldBePresent(cosmosFeeCoinDenom[coin.chain])

  if (coin.chain === CosmosChain.THORChain) {
    return 'rune'
  }

  if (coin.chain === CosmosChain.MayaChain) {
    return 'cacao'
  }

  // For Terra/TerraClassic: prefer explicit native/IBC denom if present
  const ca = (coin as any).contractAddress as string | undefined
  if (
    (coin.chain === CosmosChain.Terra ||
      coin.chain === CosmosChain.TerraClassic) &&
    ca &&
    (ca.startsWith('ibc/') || /^u[a-z]+$/.test(ca))
  ) {
    return ca
  }

  return shouldBePresent(coin.id)
}
