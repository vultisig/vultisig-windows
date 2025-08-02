import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'

/** @tony: Required by product to build a Coin object from `knownCosmosTokens` on demand */
export const createMintUnmintCoin = (denom: string): Coin => ({
  chain: Chain.THORChain,
  id: denom,
  ...knownCosmosTokens['THORChain'][denom],
})
