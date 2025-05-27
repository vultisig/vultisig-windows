import { accountCoinKeyToString } from '@core/chain/coin/AccountCoin'
import { CoinsStorage, initialCoinsRecord } from '@core/ui/storage/coins'
import { recordMap } from '@lib/utils/record/recordMap'

import { GetCoins, SaveCoins } from '../../wailsjs/go/storage/Store'
import { SaveCoin } from '../../wailsjs/go/storage/Store'
import { DeleteCoin } from '../../wailsjs/go/storage/Store'
import { fromStorageCoin, toStorageCoin } from './storageCoin'

export const coinsStorage: CoinsStorage = {
  createCoins: async ({ vaultId, coins }) => {
    await SaveCoins(vaultId, coins.map(toStorageCoin))
  },
  createCoin: async ({ vaultId, coin }) => {
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
