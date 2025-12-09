import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { CoinsStorage, initialCoinsRecord } from '@core/ui/storage/coins'
import { recordMap } from '@lib/utils/record/recordMap'

import {
  DeleteCoin,
  GetCoins,
  SaveCoin,
  SaveCoins,
} from '../../wailsjs/go/storage/Store'
import { fromStorageCoin, toStorageCoin } from './storageCoin'

export const coinsStorage: CoinsStorage = {
  createCoins: async ({ vaultId, coins }) => {
    const existingCoinsRecord = (await GetCoins()) ?? initialCoinsRecord
    const existingCoins = (existingCoinsRecord[vaultId] ?? []).map(
      fromStorageCoin
    )

    const newCoins = coins.filter(
      coin => !existingCoins.some(existing => areEqualCoins(existing, coin))
    )

    if (newCoins.length > 0) {
      await SaveCoins(vaultId, newCoins.map(toStorageCoin))
    }
  },
  createCoin: async ({ vaultId, coin }) => {
    const existingCoinsRecord = (await GetCoins()) ?? initialCoinsRecord
    const existingCoins = (existingCoinsRecord[vaultId] ?? []).map(
      fromStorageCoin
    )

    if (existingCoins.some(existing => areEqualCoins(existing, coin))) {
      return
    }

    await SaveCoin(vaultId, toStorageCoin(coin))
  },
  deleteCoin: async ({ vaultId, coinKey }) => {
    await DeleteCoin(vaultId, accountCoinKeyToString(coinKey))
  },
  getCoins: async () => {
    const coins = (await GetCoins()) ?? initialCoinsRecord
    return recordMap(coins, coins => coins.map(fromStorageCoin))
  },
}
