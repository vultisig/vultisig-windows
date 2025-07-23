import { CosmosChain } from '../../Chain'
import { cosmosFeeCoinDenom } from '../../chains/cosmos/cosmosFeeCoinDenom'
import { Coin } from '../Coin'
import { isFeeCoin } from './isFeeCoin'

export const getDenom = (token: Coin): string =>
  isFeeCoin(token) ? cosmosFeeCoinDenom[token.chain as CosmosChain] : token.id
