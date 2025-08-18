import { areEqualCoins } from '@core/chain/coin/Coin'
import {
  AddToCoinFinderIgnoreFunction,
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  RemoveFromCoinFinderIgnoreFunction,
} from '@core/ui/storage/coinFinderIgnore'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const getCoinFinderIgnore: GetCoinFinderIgnoreFunction = async () =>
  getStorageValue(StorageKey.coinFinderIgnore, coinFinderIgnoreInitialValue)

const addToCoinFinderIgnore: AddToCoinFinderIgnoreFunction = async coinKey => {
  const list = await getCoinFinderIgnore()

  if (list.some(key => areEqualCoins(key, coinKey))) {
    return
  }

  const newList = [...list, coinKey]

  await setStorageValue(StorageKey.coinFinderIgnore, newList)
}

const removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction =
  async coinKey => {
    const list = await getCoinFinderIgnore()

    const newList = list.filter(key => !areEqualCoins(key, coinKey))

    await setStorageValue(StorageKey.coinFinderIgnore, newList)
  }

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  addToCoinFinderIgnore,
  removeFromCoinFinderIgnore,
}
