import { Chain } from '../Chain'
import { ChainEntity } from '../ChainEntity'

export type CoinKey<T extends Chain = Chain> = ChainEntity<T> & {
  id: string
}

export type Coin = CoinKey & {
  priceProviderId?: string
  decimals: number
  ticker: string
  logo: string
  cmcId?: number
}

export type CoinAmount = {
  decimals: number
  amount: bigint
}

export const areEqualCoins = (one: CoinKey, another: CoinKey): boolean =>
  one.chain === another.chain &&
  one.id.toLowerCase() === another.id.toLowerCase()

export const coinKeyToString = (coin: CoinKey): string =>
  `${coin.chain}:${coin.id}`

export const coinKeyFromString = (coin: string): CoinKey => {
  const [chain, id] = coin.split(':')
  return { chain: chain as Chain, id }
}
