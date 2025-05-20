import { CoinKey } from '@core/chain/coin/Coin'
import { coinFinderIgnoreQueryKey } from '@core/ui/query/keys'
import {
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  SetCoinFinderIgnoreFunction,
} from '@core/ui/storage/coinFinderIgnore'

import { persistentStorage } from '../state/persistentState'

const [key] = coinFinderIgnoreQueryKey

const getCoinFinderIgnore: GetCoinFinderIgnoreFunction = async () => {
  const value = persistentStorage.getItem<CoinKey[]>(key)

  if (value === undefined) {
    return coinFinderIgnoreInitialValue
  }

  return value
}

const setCoinFinderIgnore: SetCoinFinderIgnoreFunction = async value => {
  persistentStorage.setItem(key, value)
}

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  setCoinFinderIgnore,
}
