import { coinFinderIgnoreQueryKey } from '@core/ui/query/keys'
import {
  coinFinderIgnoreInitialValue,
  CoinFinderIgnoreStorage,
  GetCoinFinderIgnoreFunction,
  SetCoinFinderIgnoreFunction,
} from '@core/ui/storage/coinFinderIgnore'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = coinFinderIgnoreQueryKey

const getCoinFinderIgnore: GetCoinFinderIgnoreFunction = async () =>
  getPersistentState(key, coinFinderIgnoreInitialValue)

const setCoinFinderIgnore: SetCoinFinderIgnoreFunction = async value => {
  await setPersistentState(key, value)
}

export const coinFinderIgnoreStorage: CoinFinderIgnoreStorage = {
  getCoinFinderIgnore,
  setCoinFinderIgnore,
}
