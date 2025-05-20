import { CoinKey } from '@core/chain/coin/Coin'

export type GetCoinFinderIgnoreFunction = () => Promise<CoinKey[]>

export type AddToCoinFinderIgnoreFunction = (coinKey: CoinKey) => Promise<void>

export type RemoveFromCoinFinderIgnoreFunction = (
  coinKey: CoinKey
) => Promise<void>

export type CoinFinderIgnoreStorage = {
  getCoinFinderIgnore: GetCoinFinderIgnoreFunction
  addToCoinFinderIgnore: AddToCoinFinderIgnoreFunction
  removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction
}

export const coinFinderIgnoreInitialValue: CoinKey[] = []
