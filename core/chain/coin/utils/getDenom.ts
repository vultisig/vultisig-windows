import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { CosmosChain } from '../../Chain'
import { cosmosFeeCoinDenom } from '../../chains/cosmos/cosmosFeeCoinDenom'
import { CoinKey } from '../Coin'
import { isFeeCoin } from './isFeeCoin'

export const getDenom = (coin: CoinKey<CosmosChain>): string =>
  isFeeCoin(coin) ? cosmosFeeCoinDenom[coin.chain] : shouldBePresent(coin.id)
