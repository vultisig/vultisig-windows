import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'

/** @tony: Required by product to build a Coin object from `knownCosmosTokens` on demand */
export const createMintUnmintCoin = (
  denom: string,
  address: string
): AccountCoin => ({
  chain: Chain.THORChain,
  id: denom,
  ...knownCosmosTokens['THORChain'][denom],
  address,
})
