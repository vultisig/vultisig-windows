import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import {
  AddToCoinFinderIgnoreFunction,
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  RemoveFromCoinFinderIgnoreFunction,
} from '@core/ui/storage/coinFinderIgnore'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

const getCoinFinderIgnore: GetCoinFinderIgnoreFunction = async () => {
  const value = persistentStorage.getItem<CoinKey[]>(
    StorageKey.coinFinderIgnore
  )

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

  persistentStorage.setItem(StorageKey.coinFinderIgnore, newList)
}

const removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction =
  async coinKey => {
    const list = await getCoinFinderIgnore()

    const newList = list.filter(key => !areEqualCoins(key, coinKey))

    persistentStorage.setItem(StorageKey.coinFinderIgnore, newList)
  }

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  addToCoinFinderIgnore,
  removeFromCoinFinderIgnore,
}
