import { areEqualCoins } from '@core/chain/coin/Coin'
import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  AddToCoinFinderIgnoreFunction,
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  RemoveFromCoinFinderIgnoreFunction,
} from '@core/ui/storage/coinFinderIgnore'
import { StorageKey } from '@core/ui/storage/StorageKey'

const getCoinFinderIgnore: GetCoinFinderIgnoreFunction = async () =>
  getPersistentState(StorageKey.coinFinderIgnore, coinFinderIgnoreInitialValue)

const addToCoinFinderIgnore: AddToCoinFinderIgnoreFunction = async coinKey => {
  const list = await getCoinFinderIgnore()

  if (list.some(key => areEqualCoins(key, coinKey))) {
    return
  }

  const newList = [...list, coinKey]

  await setPersistentState(StorageKey.coinFinderIgnore, newList)
}

const removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction =
  async coinKey => {
    const list = await getCoinFinderIgnore()

    const newList = list.filter(key => !areEqualCoins(key, coinKey))

    await setPersistentState(StorageKey.coinFinderIgnore, newList)
  }

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  addToCoinFinderIgnore,
  removeFromCoinFinderIgnore,
}
