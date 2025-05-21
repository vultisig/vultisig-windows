import { areEqualCoins } from '@core/chain/coin/Coin'
import { coinFinderIgnoreQueryKey } from '@core/ui/query/keys'
import {
  AddToCoinFinderIgnoreFunction,
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  RemoveFromCoinFinderIgnoreFunction,
} from '@core/ui/storage/coinFinderIgnore'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = coinFinderIgnoreQueryKey

const getCoinFinderIgnore: GetCoinFinderIgnoreFunction = async () =>
  getPersistentState(key, coinFinderIgnoreInitialValue)

const addToCoinFinderIgnore: AddToCoinFinderIgnoreFunction = async coinKey => {
  const list = await getCoinFinderIgnore()

  if (list.some(key => areEqualCoins(key, coinKey))) {
    return
  }

  const newList = [...list, coinKey]

  setPersistentState(key, newList)
}

const removeFromCoinFinderIgnore: RemoveFromCoinFinderIgnoreFunction =
  async coinKey => {
    const list = await getCoinFinderIgnore()

    const newList = list.filter(key => !areEqualCoins(key, coinKey))

    setPersistentState(key, newList)
  }

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  addToCoinFinderIgnore,
  removeFromCoinFinderIgnore,
}
