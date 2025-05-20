import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { coinFinderIgnoreQueryKey } from '@core/ui/query/keys'
import {
  AddToCoinFinderIgnoreFunction,
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  RemoveFromCoinFinderIgnoreFunction,
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

const addToCoinFinderIgnore: AddToCoinFinderIgnoreFunction = async coinKey => {
  const list = await getCoinFinderIgnore()

  if (list.some(key => areEqualCoins(key, coinKey))) {
    return
  }

  const newList = [...list, coinKey]

  persistentStorage.setItem(key, newList)
}

const removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction =
  async coinKey => {
    const list = await getCoinFinderIgnore()

    const newList = list.filter(key => !areEqualCoins(key, coinKey))

    persistentStorage.setItem(key, newList)
  }

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  addToCoinFinderIgnore,
  removeFromCoinFinderIgnore,
}
